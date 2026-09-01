import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import JSZip from 'jszip'

const importedNota = fileURLToPath(new URL('../fixtures/imported-nota.nota', import.meta.url))

test('creates, edits, autosaves, reopens, exports, and imports a nota', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /create a nota/i }).click()
  await expect(page).toHaveURL(/\/bashnota\/nota\/[^/]+$/)

  const title = page.locator('.nota-title-input')
  const editor = page.locator('.ProseMirror')
  await expect(title).toBeVisible()
  await expect(editor).toBeVisible()

  await title.fill('Critical workflow nota')
  await title.press('Tab')
  await editor.fill('Autosaved browser content')

  // The production editor intentionally debounces persistence for two seconds.
  await expect.poll(async () => page.evaluate(async () => {
    const request = indexedDB.open('notaDB')
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    try {
      const transaction = database.transaction('textBlocks', 'readonly')
      const rows = transaction.objectStore('textBlocks').getAll()
      return await new Promise<boolean>((resolve, reject) => {
        rows.onsuccess = () => resolve(JSON.stringify(rows.result).includes('Autosaved browser content'))
        rows.onerror = () => reject(rows.error)
      })
    } finally {
      database.close()
    }
  }), { timeout: 8_000 }).toBe(true)

  await page.reload()
  await expect(title).toHaveText('Critical workflow nota')
  await expect(editor).toContainText('Autosaved browser content')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('critical_workflow_nota_export.zip')
  const downloadPath = await download.path()
  expect(downloadPath).not.toBeNull()
  const zip = await JSZip.loadAsync(await readFile(downloadPath!))
  expect(await zip.file('index.html')!.async('text')).toContain('Autosaved browser content')

  await page.goto('./')
  await page.getByRole('button', { name: 'Workspace menu' }).click()
  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('menuitem', { name: 'Import Nota file' }).click()
  const chooser = await chooserPromise
  await chooser.setFiles(importedNota)

  const importedRow = page.getByRole('row', { name: /Imported deterministic nota/ })
  await expect(importedRow).toBeVisible()
  await importedRow.getByText('Imported deterministic nota', { exact: true }).click()
  await expect(page).toHaveURL(/\/bashnota\/nota\/e2e-imported-nota$/)
  await expect(page.locator('.nota-title-input')).toHaveText('Imported deterministic nota')
  await expect(page.locator('.ProseMirror')).toContainText('Imported fixture content')
})
