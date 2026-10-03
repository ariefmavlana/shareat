import { api } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { database } from '../../../../db/client'
import { proposals, settings } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
export default api(async (event) => {
  await requireAuth(event, false, ['admin', 'operator'])
  return {
    proposals: await database()
      .select()
      .from(proposals)
      .where(eq(proposals.status, 'pending')),
    settings: await database().select().from(settings),
  }
})
