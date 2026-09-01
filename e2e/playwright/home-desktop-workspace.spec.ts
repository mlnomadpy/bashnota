import { expect, test } from '@playwright/test'

test('organizes the desktop library as a workspace and previews a nota in place', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('./')

  await page.getByRole('button', { name: /create a nota/i }).click()
  await expect(page).toHaveURL(/\/bashnota\/nota\/[^/]+$/)

  await page.locator('.nota-title-input').fill('Desktop preview nota')
  await page.locator('.nota-title-input').press('Tab')
  await page.locator('.ProseMirror').fill('Preview content stays in the library workspace.')

  await expect.poll(async () => page.evaluate(async () => {
    const request = indexedDB.open('notaDB')
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    try {
      const transaction = database.transaction(['notas', 'textBlocks'], 'readonly')
      const notas = transaction.objectStore('notas').getAll()
      const blocks = transaction.objectStore('textBlocks').getAll()
      return await new Promise<boolean>((resolve, reject) => {
        transaction.oncomplete = () => resolve(
          JSON.stringify(notas.result).includes('Desktop preview nota')
          && JSON.stringify(blocks.result).includes('Preview content stays in the library workspace.'),
        )
        transaction.onerror = () => reject(transaction.error)
      })
    } finally {
      database.close()
    }
  }), { timeout: 8_000 }).toBe(true)

  await page.goto('./')

  const workspace = page.getByRole('complementary')
  const libraryHeading = page.getByRole('heading', { name: 'Nota library' })
  await expect(workspace).toBeVisible()
  await expect(libraryHeading).toBeVisible()

  const layout = await page.evaluate(() => {
    const aside = document.querySelector('aside')?.getBoundingClientRect()
    const heading = [...document.querySelectorAll('h2')]
      .find((element) => element.textContent?.includes('Nota library'))
      ?.getBoundingClientRect()
    return {
      asideWidth: aside?.width ?? 0,
      asideRight: aside?.right ?? 0,
      libraryLeft: heading?.left ?? 0,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }
  })

  expect(layout.asideWidth).toBeGreaterThanOrEqual(280)
  expect(layout.asideWidth).toBeLessThanOrEqual(330)
  expect(layout.libraryLeft).toBeGreaterThan(layout.asideRight)
  expect(layout.documentWidth).toBe(layout.viewportWidth)

  const row = page.getByRole('row', { name: /Desktop preview nota/ })
  await row.getByRole('button', { name: 'Preview' }).click()

  const preview = page.getByRole('dialog', { name: 'Desktop preview nota' })
  await expect(preview).toBeVisible()
  await expect(preview).toContainText('Preview content stays in the library workspace.')
  await expect(preview.getByRole('button', { name: 'Open in editor' })).toBeVisible()
  await expect(page).toHaveURL(/\/bashnota\/$/)

  await preview.getByRole('button', { name: 'Close panel' }).click()
  await page.setViewportSize({ width: 1024, height: 768 })

  const compactLayout = await page.evaluate(() => {
    const grid = document.querySelector<HTMLElement>('.workspace-grid')
    const aside = document.querySelector<HTMLElement>('aside')
    const library = [...document.querySelectorAll<HTMLElement>('h2')]
      .find((element) => element.textContent?.includes('Nota library'))
    return {
      columns: grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0,
      asideRight: aside?.getBoundingClientRect().right ?? 0,
      libraryLeft: library?.getBoundingClientRect().left ?? 0,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }
  })

  expect(compactLayout.columns).toBe(2)
  expect(compactLayout.libraryLeft).toBeGreaterThan(compactLayout.asideRight)
  expect(compactLayout.documentWidth).toBe(compactLayout.viewportWidth)
})
