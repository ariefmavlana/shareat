import { eq } from 'drizzle-orm'
import { api } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { database } from '../../../../db/client'
import { assets } from '../../../../db/schema'
export default api(async (event) => {
  const actor = await requireAuth(event)
  const query = database().select().from(assets)
  return actor.roles.some((r) =>
    ['admin', 'reviewer', 'auditor', 'editor'].includes(r),
  )
    ? query.limit(200)
    : query.where(eq(assets.organizationId, actor.organizationId)).limit(200)
})
