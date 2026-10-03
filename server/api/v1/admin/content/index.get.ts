import { getQuery } from 'h3'
import { z } from 'zod'
import { api } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { contentService } from '../../../../utils/content'
import { kinds } from '../../../../../shared/contracts/content'
export default api(async (event) => {
  const actor = await requireAuth(event)
  const query = z
    .object({
      page: z.coerce.number().int().min(1).max(10000).default(1),
      kind: z.enum(kinds).optional(),
    })
    .strict()
    .parse(getQuery(event))
  return contentService().privateList(actor, query)
})
