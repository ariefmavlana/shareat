import { getRequestURL, setResponseHeader } from 'h3'

const readOnlyPaths = [
  '/api/v1/public/',
  '/api/health',
  '/robots.txt',
  '/sitemap.xml',
]

export default defineEventHandler((event) => {
  const method = event.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD') return
  const path = getRequestURL(event).pathname
  const readOnly = readOnlyPaths.some(
    (prefix) => path === prefix || path.startsWith(prefix),
  )
  if (!readOnly) return
  setResponseHeader(event, 'allow', 'GET, HEAD')
  throw createError({
    statusCode: 405,
    statusMessage: 'Metode tidak didukung',
  })
})
