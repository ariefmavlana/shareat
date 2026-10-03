import { z } from 'zod'
import { api } from '../../../utils/http'
import { contentService } from '../../../utils/content'
import { kinds } from '../../../../shared/contracts/content'
import { listQuerySchema } from '../../../../shared/contracts/web'
const schema = listQuerySchema.extend({ kind: z.enum(kinds).optional() })
export default api(async (event) => {
  return contentService().publicPage(schema.parse(getQuery(event)))
})
