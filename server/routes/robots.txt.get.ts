export default defineEventHandler(() => {
  const origin = process.env.NUXT_SITE_URL ?? 'http://localhost:3000'
  return process.env.NUXT_APP_MODE !== 'production'
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${origin}/sitemap.xml\n`
})
