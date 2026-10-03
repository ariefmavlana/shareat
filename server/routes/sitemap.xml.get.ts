import { contentService } from '../utils/content'
import { canonical } from '../../shared/contracts/web'
const xml = (v: string) =>
  v.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      })[c]!,
  )
export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  const origin = process.env.NUXT_SITE_URL ?? 'http://localhost:3000'
  const items = await contentService().publicList()
  const routes: Record<string, string> = {
    program: 'program',
    initiative: 'inisiatif',
    story: 'cerita',
  }
  const urls = items
    .filter((x) => ['program', 'initiative', 'story', 'page'].includes(x.kind))
    .map((x) => ({
      url: canonical(
        origin,
        x.kind === 'page' ? '/' + x.slug : '/' + routes[x.kind] + '/' + x.slug,
      ),
      date: x.updatedAt,
    }))
  const roots = ['/', '/program', '/inisiatif', '/cerita', '/faq', '/kontak']
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${roots.map((p) => `<url><loc>${xml(canonical(origin, p))}</loc></url>`).join('')}${urls.map((x) => `<url><loc>${xml(x.url)}</loc><lastmod>${xml(x.date)}</lastmod></url>`).join('')}</urlset>`
})
