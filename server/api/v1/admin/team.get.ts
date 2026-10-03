import { api } from '../../../utils/http'
import { requireAuth } from '../../../utils/auth'
import { database } from '../../../db/client'
import { users, organizations } from '../../../db/schema'
export default api(async (event) => {
  await requireAuth(event, false, ['admin'])
  return {
    users: await database()
      .select({
        id: users.id,
        email: users.email,
        roles: users.roles,
        organizationId: users.organizationId,
        suspended: users.suspended,
      })
      .from(users),
    organizations: await database().select().from(organizations),
  }
})
