import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('SSR, canonical, private routes, and R1 transaction exclusion', async ({
  request,
}) => {
  for (const path of [
    '/',
    '/program',
    '/inisiatif',
    '/cerita',
    '/tentang',
    '/transparansi',
    '/faq',
    '/kontak',
    '/privasi',
    '/ketentuan',
    '/program/share-eat',
    '/inisiatif/dapur-berbagi',
    '/cerita/berbagi-dari-hal-kecil',
  ]) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    const html = await response.text()
    expect(response.headers()['content-security-policy']).toContain(
      "script-src 'self' 'sha256-",
    )
    expect(response.headers()['cache-control']).toContain('no-store')
    expect(html, path).toContain('lang="id"')
    expect(html, path).toContain('rel="canonical"')
    expect(response.headers()['x-robots-tag']).toContain('noindex')
  }
  expect((await request.get('/inisiatif/tidak-ada')).status()).toBe(404)
  expect((await request.get('/inisiatif?page=999')).status()).toBe(404)
  expect((await request.get('/api/v1/admin/content')).status()).toBe(401)
  for (const path of [
    '/api/v1/donations',
    '/api/v1/payments',
    '/api/v1/webhooks/payment',
  ])
    expect(
      (await request.post(path, { data: { amount: 10000 } })).status(),
    ).toBe(404)
  const dto = await (
    await request.get('/api/v1/public/content?kind=initiative')
  ).json()
  expect(JSON.stringify(dto)).not.toMatch(
    /passwordHash|mfaCipher|organizationId|authorId|reviewerId|targetIdr/,
  )
  expect((await request.get('/api/v1/public/content?page=0')).status()).toBe(
    422,
  )
  const redirect = await request.get('/about.html', { maxRedirects: 0 })
  expect(redirect.status()).toBe(301)
  expect(redirect.headers().location).toBe('/tentang')
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toMatch(/\/admin|draft|preview/)
  expect(sitemap).toContain('/program/share-eat')
})
test('responsive navigation, contact encoding, search reset, and accessible templates', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toHaveCount(1)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    ).toBe(true)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Buka menu navigasi' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.goto('/kontak')
  const link = page.getByRole('link', { name: 'Buka WhatsApp', exact: true })
  const href = await link.getAttribute('href')
  expect(href).toContain('https://wa.me/6287776734038?text=')
  expect(decodeURIComponent(href!)).not.toMatch(
    /transfer|rekening|nominal|token/,
  )
  for (const path of [
    '/',
    '/kontak',
    '/inisiatif',
    '/program/share-eat',
    '/faq',
    '/admin/login',
  ]) {
    await page.goto(path, { waitUntil: 'networkidle' })
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      audit.violations.map((x) => ({
        id: x.id,
        nodes: x.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([])
  }
  await page.goto('/inisiatif', { waitUntil: 'networkidle' })
  await page.getByLabel('Cari inisiatif').fill('tidak-ada-xyz')
  await page.getByRole('button', { name: 'Terapkan' }).click()
  await expect(
    page.getByRole('heading', { name: 'Belum ada informasi yang cocok.' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Reset filter' }).click()
  await expect(page.getByText('3 inisiatif ditemukan')).toBeVisible()
  expect(errors).toEqual([])
})

test('published policy versions expose only approved snapshots', async ({
  request,
}) => {
  const result = await request.get('/api/v1/public/policies/privasi/versions')
  expect(result.status()).toBe(200)
  const versions = await result.json()
  expect(versions.length).toBeGreaterThan(0)
  const version = await request.get(
    '/api/v1/public/policies/privasi/' + versions[0].id,
  )
  expect(version.status()).toBe(200)
  const dto = await version.json()
  expect((await request.get('/privasi/versi/' + versions[0].id)).status()).toBe(
    200,
  )
  expect(
    await (await request.get('/privasi/versi/' + versions[0].id)).text(),
  ).toContain('Arsip versi yang sudah dipublikasikan')
  expect(dto).not.toHaveProperty('authorId')
  expect(dto).not.toHaveProperty('reviewerId')
  expect(
    (
      await request.get(
        '/api/v1/public/policies/privasi/00000000-0000-4000-8000-000000000000',
      )
    ).status(),
  ).toBe(404)
})
