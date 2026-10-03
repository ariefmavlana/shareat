import { desc } from 'drizzle-orm'
import { api } from '../../../utils/http'
import { requireAuth } from '../../../utils/auth'
import { database } from '../../../db/client'
import { auditLogs } from '../../../db/schema'
export default api(async (event) => {
  await requireAuth(event, false, ['admin', 'auditor'])
  return database()
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(100)
})
