import { z } from 'zod'
import { kinds, slugSchema } from '../../../../../shared/contracts/content'
import { api } from '../../../../utils/http'
import { contentService } from '../../../../utils/content'
export default api(async (event) =>
  contentService().publicDetail(
    z.enum(kinds).parse(getRouterParam(event, 'kind')),
    slugSchema.parse(getRouterParam(event, 'slug')),
  ),
)
