import { expect, test } from '@playwright/test'

test('is installable, loads offline, and replaces a stale service worker', async ({ context, page, request }) => {
  await page.goto('./')

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(manifestHref).toBe('/bashnota/manifest.webmanifest')
  const manifestResponse = await request.get(manifestHref!)
  expect(manifestResponse.ok()).toBe(true)
  const manifest = await manifestResponse.json() as {
    display?: string
    scope?: string
    start_url?: string
    icons?: Array<{ src: string }>
  }
  expect(manifest).toMatchObject({
    display: 'standalone',
    scope: '/bashnota/',
    start_url: '/bashnota/',
  })
  expect(manifest.icons).not.toHaveLength(0)
  for (const icon of manifest.icons ?? []) {
    const iconResponse = await request.get(new URL(icon.src, manifestResponse.url()).toString())
    expect(iconResponse.ok()).toBe(true)
    expect(iconResponse.headers()['content-type']).toContain('image/')
  }

  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  const staleScriptUrl = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('/bashnota/sw.js?stale-fixture=1', {
      scope: '/bashnota/',
    })
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('stale worker did not activate')), 10_000)
      const finish = () => {
        window.clearTimeout(timeout)
        resolve()
      }
      const worker = registration.installing ?? registration.waiting ?? registration.active
      if (worker?.state === 'activated') finish()
      else worker?.addEventListener('statechange', () => worker.state === 'activated' && finish())
    })
    return registration.active?.scriptURL ?? ''
  })
  expect(staleScriptUrl).toContain('stale-fixture=1')

  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('/bashnota/sw.js', {
      scope: '/bashnota/',
    })
    await registration.update()
  })
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration('/bashnota/')
    return {
      active: registration?.active?.scriptURL ?? '',
      installing: registration?.installing?.scriptURL ?? '',
      waiting: registration?.waiting?.scriptURL ?? '',
    }
  })).toEqual({
    active: 'http://127.0.0.1:4174/bashnota/sw.js',
    installing: '',
    waiting: '',
  })

  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('#app')).not.toBeEmpty()
  await expect(page).toHaveURL(/\/bashnota\/$/)
})
