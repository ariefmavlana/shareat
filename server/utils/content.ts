import { ContentService } from '../modules/content/service'
import { mysqlContentRepository } from '../modules/content/mysql-repository'
export const contentService = () => new ContentService(mysqlContentRepository())
