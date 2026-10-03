import { api } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { upload } from '../../../../modules/media/service'
export default api(async (event) => {
  const actor = await requireAuth(event, true)
  const maximum = 10 * 1024 * 1024
  const parts: Buffer[] = []
  let bytes = 0
  if (Number(getHeader(event, 'content-length') ?? 0) > maximum)
    throw createError({ statusCode: 413 })
  for await (const part of event.node.req) {
    const value = Buffer.isBuffer(part) ? part : Buffer.from(part)
    bytes += value.length
    if (bytes > maximum) throw createError({ statusCode: 413 })
    parts.push(value)
  }
  return upload(actor, Buffer.concat(parts))
})
