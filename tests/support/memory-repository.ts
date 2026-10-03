import { createError } from 'h3'
import type { ContentRecord } from '../../shared/contracts/content'
import type { ContentRepository } from '../../server/modules/content/repository'
import { publicDto } from '../../server/modules/content/service'
export function createMemoryRepository(): ContentRepository {
  const store = new Map<string, ContentRecord>()
  return {
    async create(r) {
      store.set(r.id, structuredClone(r))
    },
    async get(id) {
      return structuredClone(store.get(id) ?? null)
    },
    async bySlug(kind, slug) {
      return structuredClone(
        [...store.values()].find((r) => r.kind === kind && r.slug === slug) ??
          null,
      )
    },
    async list(query) {
      const rows = [...store.values()].filter(
        (r) =>
          (!query.kind || r.kind === query.kind) &&
          (!query.organizationId || r.organizationId === query.organizationId),
      )
      return {
        items: structuredClone(
          rows.slice((query.page - 1) * 20, query.page * 20),
        ),
        page: query.page,
        pages: Math.max(1, Math.ceil(rows.length / 20)),
        total: rows.length,
      }
    },
    async page(query) {
      const items = [...store.values()]
        .map(publicDto)
        .filter((x) => x !== null && (!query.kind || x.kind === query.kind))
      return { items, page: 1, pages: 1, total: items.length }
    },
    async published() {
      return [...store.values()].map(publicDto).filter((x) => x !== null)
    },
    async mutate(id, version, _actor, _action, _reason, change) {
      const r = structuredClone(store.get(id))
      if (!r) throw createError({ statusCode: 404 })
      if (r.version !== version) throw createError({ statusCode: 409 })
      change(r)
      r.version++
      store.set(id, r)
      return structuredClone(r)
    },
  }
}
