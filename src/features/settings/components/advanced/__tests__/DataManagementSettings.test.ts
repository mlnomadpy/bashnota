import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BACKUP_FORMAT, BACKUP_VERSION, BLOCK_TABLES } from '@/features/nota/services/backupArchiveService'

const mocks = vi.hoisted(() => ({
  exportAllNotas: vi.fn(),
  importAllNotas: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/features/nota/stores/nota', () => ({
  useNotaStore: () => ({
    exportAllNotas: mocks.exportAllNotas,
    importAllNotas: mocks.importAllNotas,
  }),
}))

vi.mock('vue-sonner', () => ({
  toast: {
    success: mocks.success,
    error: mocks.error,
  },
}))

import DataManagementSettings from '../DataManagementSettings.vue'

const timestamp = '2026-08-19T12:00:00.000Z'
const archive = {
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  exportedAt: timestamp,
  notas: [{ id: 'nota-1', title: 'Recovered', parentId: null, createdAt: timestamp, updatedAt: timestamp }],
  blockStructures: [],
  blocks: Object.fromEntries(Object.keys(BLOCK_TABLES).map((tableName) => [tableName, []])),
}

function mountSettings() {
  return mount(DataManagementSettings, {
    global: {
      stubs: {
        Card: { template: '<section><slot /></section>' },
        CardHeader: { template: '<header><slot /></header>' },
        CardTitle: { template: '<h2><slot /></h2>' },
        CardContent: { template: '<div><slot /></div>' },
        CardDescription: { template: '<p><slot /></p>' },
        Button: { template: '<button v-bind="$attrs"><slot /></button>' },
        Label: { template: '<label v-bind="$attrs"><slot /></label>' },
        Input: { template: '<input v-bind="$attrs" />' },
        Database: true,
        Download: true,
        Upload: true,
        Trash2: true,
        AlertTriangle: true,
      },
    },
  })
}

describe('DataManagementSettings backup controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.exportAllNotas.mockResolvedValue(archive)
    mocks.importAllNotas.mockResolvedValue({ notaCount: 1 })
  })

  it('passes the exact emitted backup format to the store and reports success only after restore', async () => {
    const wrapper = mountSettings()
    const input = wrapper.get('input[type="file"]')
    const file = { name: 'bashnota_backup.json', text: vi.fn().mockResolvedValue(JSON.stringify(archive)) }
    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
    await input.trigger('change')

    const importButton = wrapper.findAll('button').find((button) => button.text().includes('Import Data'))!
    await importButton.trigger('click')
    await flushPromises()

    expect(mocks.importAllNotas).toHaveBeenCalledOnce()
    expect(mocks.importAllNotas).toHaveBeenCalledWith(archive)
    expect(mocks.success).toHaveBeenCalledWith('Import successful', {
      description: 'Restored 1 notas and their canonical blocks.',
    })
    expect(mocks.error).not.toHaveBeenCalled()
  })

  it('shows the store validation or rollback error without claiming success', async () => {
    mocks.importAllNotas.mockRejectedValue(new Error('Restore requires an empty database. Export or clear the current data first.'))
    const wrapper = mountSettings()
    const input = wrapper.get('input[type="file"]')
    const file = { name: 'backup.json', text: vi.fn().mockResolvedValue(JSON.stringify(archive)) }
    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
    await input.trigger('change')

    await wrapper.findAll('button').find((button) => button.text().includes('Import Data'))!.trigger('click')
    await flushPromises()

    expect(mocks.success).not.toHaveBeenCalled()
    expect(mocks.error).toHaveBeenCalledWith('Import failed', {
      description: 'Restore requires an empty database. Export or clear the current data first.',
    })
  })
})
