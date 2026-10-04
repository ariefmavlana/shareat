import { z } from 'zod'
export const kinds = ['program', 'initiative', 'story', 'page', 'faq'] as const
export type ContentKind = (typeof kinds)[number]
export const slugSchema = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const contentBodySchema = z
  .object({
    title: z.string().trim().min(3).max(140),
    summary: z.string().trim().min(15).max(320),
    paragraphs: z.array(z.string().trim().min(1).max(4000)).min(1).max(30),
    programSlug: slugSchema.optional(),
    location: z.string().trim().max(100).optional(),
    activityStatus: z
      .enum(['planning', 'ongoing', 'completed'])
      .default('planning'),
    responsible: z.string().trim().max(120).optional(),
    schedule: z.string().trim().max(150).optional(),
    author: z.string().trim().max(120).optional(),
    effectiveDate: z.iso.date().optional(),
    imageId: z.uuid().optional(),
    imageAlt: z.string().trim().max(200).optional(),
    demo: z.boolean().default(false),
    sortOrder: z.number().int().min(0).max(1000).default(0),
  })
  .strict()
export type ContentBody = z.infer<typeof contentBodySchema>
export const reviewSchema = z
  .object({
    claims: z.boolean(),
    media: z.boolean(),
    privacy: z.boolean(),
    seo: z.boolean(),
    contact: z.boolean(),
  })
  .strict()
export type Checklist = z.infer<typeof reviewSchema>
export type RevisionState =
  | 'draft'
  | 'submitted'
  | 'changes_requested'
  | 'reviewed'
  | 'published'
  | 'archived'
export interface PublicContent extends ContentBody {
  id: string
  kind: ContentKind
  slug: string
  updatedAt: string
  imageUrl?: string
}
export interface Actor {
  id: string
  roles: string[]
  organizationId: string
  verified: boolean
  requestId?: string
}
export interface Revision {
  id: string
  body: ContentBody
  status: RevisionState
  authorId: string
  reviewerId: string | null
  checklist: Checklist | null
  reviewNote?: string | null
  reviewedAt?: string | null
  createdAt: string
}
export interface ContentRecord {
  id: string
  kind: ContentKind
  slug: string
  organizationId: string
  version: number
  revisions: Revision[]
  publishedRevisionId: string | null
  everPublished: boolean
  archived: boolean
}
export const createContentSchema = z
  .object({
    kind: z.enum(kinds),
    slug: slugSchema.optional(),
    body: contentBodySchema,
  })
  .strict()
export const saveContentSchema = z
  .object({ version: z.number().int().positive(), body: contentBodySchema })
  .strict()
export const transitionSchema = z
  .object({
    version: z.number().int().positive(),
    action: z.enum([
      'submit',
      'request_changes',
      'review',
      'publish',
      'archive',
    ]),
    checklist: reviewSchema.optional(),
    reason: z.string().trim().min(5).max(500).optional(),
  })
  .strict()
