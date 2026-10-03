import { eq } from 'drizzle-orm'
import { database } from '../db/client'
import { redirects } from '../db/schema'
export default defineEventHandler(async (event) => {
  if (
    event.method !== 'GET' ||
    !/^\/(program|inisiatif|cerita)\/[a-z0-9-]+$/.test(
      event.path.split('?')[0]!,
    )
  )
    return
  try {
    const [row] = await database()
      .select()
      .from(redirects)
      .where(eq(redirects.fromPath, event.path.split('?')[0]!))
    if (row) return sendRedirect(event, row.toPath, 301)
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'Informasi sementara tidak tersedia',
    })
  }
})
