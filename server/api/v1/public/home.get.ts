import { api } from '../../../utils/http'
import { contentService } from '../../../utils/content'
import type { ContentKind } from '../../../../shared/contracts/content'
export default api(async () => {
  const service = contentService()
  const read = async (kind: ContentKind) =>
    (
      await service.publicPage({
        kind,
        page: 1,
        q: '',
        program: '',
        lokasi: '',
        status: '',
      })
    ).items
  return {
    programs: await read('program'),
    initiatives: (await read('initiative')).slice(0, 3),
    stories: (await read('story')).slice(0, 3),
    faqs: await read('faq'),
  }
})
