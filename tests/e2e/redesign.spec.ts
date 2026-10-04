import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const routes = [
  '/',
  '/program',
  '/inisiatif',
  '/cerita',
  '/tentang',
  '/transparansi',
  '/faq',
  '/kontak',
  '/cari',
  '/privasi',
  '/ketentuan',
  '/program/share-eat',
  '/inisiatif/dapur-berbagi',
  '/cerita/berbagi-dari-hal-kecil',
]
for (const width of [320, 768, 1024, 1440]) {
  test(`public templates reflow at ${width}px without broken images`, async ({
    page,
  }) => {
    test.setTimeout(240000)
    await page.setViewportSize({ width, height: 900 })
    for (const path of routes) {
      await page.goto(path, { waitUntil: 'networkidle' })
      await expect(page.locator('h1')).toHaveCount(1)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        path,
      ).toBe(true)
      expect(
        await page
          .locator('img')
          .evaluateAll((images) =>
            images.every((image) => image.complete && image.naturalWidth > 0),
          ),
        path,
      ).toBe(true)
    }
  })
}

test('program chips, browser history and reset keep results and inputs in sync', async ({
  page,
}) => {
  await page.goto('/inisiatif', { waitUntil: 'networkidle' })
  const chips = page.getByRole('group', { name: 'Pilih program' })
  await chips.getByRole('button', { name: 'Share Eat', exact: true }).click()
  await expect(page).toHaveURL(/program=share-eat/)
  await expect(
    page.getByRole('combobox', { name: 'Program', exact: true }),
  ).toHaveValue('share-eat')
  await expect(page.getByRole('status')).toContainText('1 inisiatif ditemukan')
  await chips.getByRole('button', { name: 'Share Book', exact: true }).click()
  await expect(page).toHaveURL(/program=share-book/)
  await page.goBack()
  await expect(
    chips.getByRole('button', { name: 'Share Eat', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('combobox', { name: 'Program', exact: true }),
  ).toHaveValue('share-eat')
  await expect(page.getByRole('status')).toContainText('1 inisiatif ditemukan')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page).toHaveURL(/\/inisiatif$/)
  await expect(
    page.getByRole('combobox', { name: 'Program', exact: true }),
  ).toHaveValue('')
  await expect(page.getByRole('status')).toContainText('3 inisiatif ditemukan')
})

test('mobile menu restores focus, contains focus and closes on route change', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/', { waitUntil: 'networkidle' })
  const trigger = page.getByRole('button', { name: 'Buka menu navigasi' })
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab')
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await dialog.getByRole('link', { name: 'Program', exact: true }).click()
  await expect(page).toHaveURL(/\/program$/)
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('contact topic updates the WhatsApp draft and copying has truthful feedback', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/kontak', { waitUntil: 'networkidle' })
  await page
    .getByLabel('Saya ingin membicarakan')
    .selectOption('peluang kolaborasi komunitas')
  const link = page.getByRole('link', { name: 'Buka WhatsApp', exact: true })
  const href = await link.getAttribute('href')
  expect(new URL(href!).searchParams.get('text')).toContain(
    'peluang kolaborasi komunitas',
  )
  expect(new URL(href!).pathname).toBe('/6287776734038')
  await page.getByRole('button', { name: 'Salin nomor', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(
    'Nomor berhasil disalin.',
  )
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    '6287776734038',
  )
  await expect(
    page.getByRole('link', { name: 'Buka WhatsApp Web' }),
  ).toHaveAttribute('href', 'https://web.whatsapp.com/')
})

test('redesigned layouts meet automated WCAG checks on desktop', async ({
  page,
}) => {
  test.setTimeout(240000)
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const path of [
    '/',
    '/program',
    '/tentang',
    '/transparansi',
    '/kontak',
    '/faq',
    '/privasi',
    '/cari',
  ]) {
    await page.goto(path, { waitUntil: 'networkidle' })
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([])
  }
})

test('empty home content stays honest and navigation works without JavaScript', async ({
  page,
  browser,
}) => {
  await page.goto('/faq', { waitUntil: 'networkidle' })
  await page.route('**/api/v1/public/home', (route) =>
    route.fulfill({
      json: { programs: [], initiatives: [], stories: [], faqs: [] },
    }),
  )
  await page
    .getByRole('banner')
    .getByRole('link', { name: 'Shareat, beranda' })
    .click()
  await expect(
    page.getByText('Langkah berikutnya sedang disiapkan.'),
  ).toBeVisible()
  await expect(
    page.getByText(
      'Cerita dan pembelajaran akan hadir setelah dipublikasikan oleh tim.',
    ),
  ).toBeVisible()
  await expect(
    page.getByText('Pertanyaan umum sedang disiapkan.'),
  ).toBeVisible()
  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const staticPage = await noJs.newPage()
  await staticPage.goto(test.info().project.use.baseURL + '/')
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible()
  await staticPage
    .getByRole('navigation', { name: 'Navigasi footer', exact: true })
    .getByRole('link', { name: 'Program', exact: true })
    .click()
  await expect(staticPage).toHaveURL(/\/program$/)
  await noJs.close()
})
