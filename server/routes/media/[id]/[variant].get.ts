import { eq } from 'drizzle-orm'
import { readFile } from 'node:fs/promises'
import { database } from '../../../db/client'
import { assets } from '../../../db/schema'
import { mediaPath } from '../../../modules/media/service'
import { contentService } from '../../../utils/content'
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? '',
    variant = getRouterParam(event, 'variant') ?? ''
  if (!/^(400|800|1200|1600)\.webp$/.test(variant))
    throw createError({ statusCode: 404 })
  const [asset] = await database()
    .select()
    .from(assets)
    .where(eq(assets.id, id))
  if (
    !asset ||
    asset.scanStatus !== 'clean' ||
    asset.rightsStatus !== 'approved' ||
    !asset.mime.startsWith('image/')
  )
    throw createError({ statusCode: 404 })
  const published = await contentService().publicList()
  if (!published.some((item) => item.imageId === id))
    throw createError({ statusCode: 404 })
  setHeader(event, 'Content-Type', 'image/webp')
  return readFile(mediaPath(`${id}-${variant}`))
})
