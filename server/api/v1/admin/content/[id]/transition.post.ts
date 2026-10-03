import { api, body } from '../../../../../utils/http'
import { requireAuth } from '../../../../../utils/auth'
import { contentService } from '../../../../../utils/content'
import { transitionSchema } from '../../../../../../shared/contracts/content'
export default api(async (event) => {
  const actor = await requireAuth(event, true)
  const data = await body(event, transitionSchema)
  return contentService().transition(
    actor,
    getRouterParam(event, 'id') ?? '',
    data.version,
    data.action,
    data.checklist,
    data.reason,
  )
})
