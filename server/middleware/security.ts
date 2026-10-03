import { randomUUID } from 'node:crypto'
export default defineEventHandler((event) => {
  event.context.requestId = randomUUID()
  setHeader(event, 'X-Request-Id', event.context.requestId)
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  setHeader(
    event,
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  )
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'Cache-Control', 'no-store')
  if (
    process.env.NUXT_APP_MODE !== 'production' ||
    event.path.startsWith('/admin')
  )
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  if (process.env.NUXT_APP_MODE === 'production')
    setHeader(event, 'Strict-Transport-Security', 'max-age=31536000')
})
