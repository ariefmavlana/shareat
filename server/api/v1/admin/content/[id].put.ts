import { api, body } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { contentService } from '../../../../utils/content'
import { saveContentSchema } from '../../../../../shared/contracts/content'
export default api(async (event) => {
  const actor = await requireAuth(event, true)
  const data = await body(event, saveContentSchema)
  return contentService().save(
    actor,
    getRouterParam(event, 'id') ?? '',
    data.version,
    data.body,
  )
})
