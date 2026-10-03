import { api, body } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { contentService } from '../../../../utils/content'
import { createContentSchema } from '../../../../../shared/contracts/content'
export default api(async (event) => {
  const actor = await requireAuth(event, true)
  const data = await body(event, createContentSchema)
  return contentService().create(actor, data.kind, data.body, data.slug)
})
