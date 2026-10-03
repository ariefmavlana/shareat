import { createHash } from 'node:crypto'
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:response', (response) => {
    if (typeof response.body !== 'string') return
    const hashes = [
      ...response.body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi),
    ]
      .filter((m) => m[1])
      .map(
        (m) =>
          `'sha256-${createHash('sha256').update(m[1]!).digest('base64')}'`,
      )
    response.headers ??= {}
    response.headers['Content-Security-Policy'] =
      `default-src 'self'; script-src 'self' ${hashes.join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`
  })
})
