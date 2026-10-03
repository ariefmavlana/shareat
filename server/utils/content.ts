import { ContentService } from '../modules/content/service'
import { postgresContentRepository } from '../modules/content/postgres-repository'
export const contentService = () =>
  new ContentService(postgresContentRepository())
