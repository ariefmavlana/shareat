import { api } from '../../../utils/http'
import { requireAuth, endSession } from '../../../utils/auth'
export default api(async (event) => {
  await requireAuth(event, true)
  await endSession(event)
  return { ok: true }
})
