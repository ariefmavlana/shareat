import type {
  Actor,
  ContentKind,
  ContentRecord,
  PublicContent,
} from '../../../shared/contracts/content'
export interface ContentRepository {
  create(record: ContentRecord, actor: Actor): Promise<void>
  get(id: string): Promise<ContentRecord | null>
  bySlug(kind: ContentKind, slug: string): Promise<ContentRecord | null>
  list(query: {
    page: number
    kind?: ContentKind
    organizationId?: string
  }): Promise<{
    items: ContentRecord[]
    page: number
    pages: number
    total: number
  }>
  mutate(
    id: string,
    version: number,
    actor: Actor,
    action: string,
    reason: string | undefined,
    change: (record: ContentRecord) => void,
  ): Promise<ContentRecord>
  page(query: {
    kind?: ContentKind
    page: number
    q: string
    program: string
    lokasi: string
    status: string
  }): Promise<{
    items: PublicContent[]
    page: number
    pages: number
    total: number
  }>
  published(): Promise<PublicContent[]>
}
