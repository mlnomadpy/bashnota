#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')
const inventoryPath = resolve(ROOT, 'docs/supabase/firebase-inventory.json')
const matrixPath = resolve(ROOT, 'docs/supabase/firebase-to-supabase-verification.json')

function fail(message) {
  console.error(`FAIL: ${message}`)
  process.exitCode = 1
}

function parseArgs(argv) {
  const result = { gate: 'contract', report: null }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--gate') result.gate = argv[++index]
    else if (argument === '--report') result.report = argv[++index]
    else if (argument === '--help') result.help = true
    else throw new Error(`Unknown argument: ${argument}`)
  }
  return result
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

function requireKeys(object, keys, label) {
  for (const key of keys) {
    if (object[key] === undefined || object[key] === null || object[key] === '') {
      fail(`${label} is missing ${key}`)
    }
  }
}

function verifyContract(inventory, matrix) {
  const expectedCollections = [
    'users/{firebaseUid}',
    'publicProfiles/{firebaseUid}',
    'userTags/{tag}',
    'notas/{notaId}',
    'publishedNotas/{notaId}',
    'publishedNotaViewers/{notaId}',
    'publishedNotaViewers/{notaId}/viewers/{firebaseUid}',
    'notaVotes/{notaId}_{firebaseUid}',
    'comments/{commentId}',
    'newsletterSubscriptions/{firebaseUid}',
  ]
  const actualCollections = new Set(inventory.collections.map((item) => item.path))
  for (const path of expectedCollections) {
    if (!actualCollections.has(path)) fail(`inventory is missing collection ${path}`)
  }

  for (const collection of inventory.collections) {
    requireKeys(
      collection,
      ['path', 'owner', 'sensitivity', 'sourceOfTruth', 'shape', 'evidence'],
      `collection ${collection.path}`,
    )
  }
  for (const index of inventory.indexes)
    requireKeys(index, ['collection', 'fields', 'owner'], 'index')
  for (const flow of inventory.authFlows)
    requireKeys(flow, ['flow', 'owner', 'sensitivity', 'callSite'], 'auth flow')
  for (const event of inventory.analyticsEvents)
    requireKeys(event, ['name', 'owner', 'sensitivity', 'callSite'], 'analytics event')
  for (const callSite of [...inventory.directClientCallSites, ...inventory.serverCallSites]) {
    requireKeys(callSite, ['owner', 'sensitivity', 'file', 'operations'], 'call site')
  }

  const caseIds = new Set()
  const coveredDomains = new Set()
  for (const testCase of matrix.cases) {
    requireKeys(testCase, ['id', 'domain', 'gate', 'description'], `matrix case ${testCase.id}`)
    if (caseIds.has(testCase.id)) fail(`duplicate matrix case ${testCase.id}`)
    caseIds.add(testCase.id)
    coveredDomains.add(testCase.domain)
  }
  for (const domain of matrix.requiredDomains) {
    if (!coveredDomains.has(domain)) fail(`verification matrix does not cover ${domain}`)
  }

  if (!process.exitCode) {
    console.log(
      `PASS: contract inventory (${inventory.collections.length} collections, ${inventory.indexes.length} indexes, ${inventory.authFlows.length} auth flows, ${inventory.analyticsEvents.length} analytics events, ${inventory.directClientCallSites.length} direct client call sites)`,
    )
    console.log(
      `PASS: verification matrix (${matrix.cases.length} cases across ${matrix.requiredDomains.length} required domains)`,
    )
  }
}

function casesForGate(matrix, gate) {
  if (gate === 'all') return matrix.cases.filter((item) => item.required)
  return matrix.cases.filter((item) => item.required && item.gate === gate)
}

function verifyReport(report, matrix, gate) {
  requireKeys(
    report,
    ['migrationId', 'generatedAt', 'sourceWatermark', 'targetWatermark', 'cases'],
    'report',
  )
  const selected = casesForGate(matrix, gate)
  if (selected.length === 0) fail(`gate ${gate} has no verification cases`)

  const results = new Map(report.cases.map((item) => [item.id, item]))
  for (const expected of selected) {
    const result = results.get(expected.id)
    if (!result) {
      fail(`${gate} report is missing ${expected.id}`)
      continue
    }
    if (result.status !== 'pass') fail(`${expected.id} status is ${result.status}, expected pass`)
    if (!Array.isArray(result.evidence) || result.evidence.length === 0)
      fail(`${expected.id} has no evidence`)
  }

  if (gate === 'rollback' || gate === 'all') {
    if (report.sourceWatermark !== report.targetWatermark) {
      fail(`rollback watermarks differ (${report.sourceWatermark} != ${report.targetWatermark})`)
    }
  }

  if (!process.exitCode)
    console.log(`PASS: ${gate} report ${report.migrationId} (${selected.length} required cases)`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    console.log(
      'Usage: node docs/supabase/verify-firebase-supabase.mjs [--gate contract|pre-cutover|canary|rollback|all] [--report path/to/report.json]',
    )
    return
  }

  const allowedGates = new Set(['contract', 'pre-cutover', 'canary', 'rollback', 'all'])
  if (!allowedGates.has(options.gate)) throw new Error(`Unknown gate: ${options.gate}`)

  const [inventory, matrix] = await Promise.all([readJson(inventoryPath), readJson(matrixPath)])
  verifyContract(inventory, matrix)

  if (options.gate !== 'contract') {
    if (!options.report) throw new Error(`--report is required for gate ${options.gate}`)
    verifyReport(await readJson(resolve(options.report)), matrix, options.gate)
  }
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`)
  process.exitCode = 1
})
