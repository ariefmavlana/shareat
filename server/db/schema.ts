import {
  pgTable,
  type AnyPgColumn,
  varchar,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import type {
  ContentBody,
  Checklist,
  ContentKind,
  RevisionState,
} from '../../shared/contracts/content'
export const organizations = pgTable('organizations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  type: varchar('organization_type', { length: 20 })
    .$type<'team' | 'partner'>()
    .notNull()
    .default('partner'),
  name: varchar('name', { length: 140 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  verified: boolean('verified').notNull().default(false),
  suspended: boolean('suspended').notNull().default(false),
  evidence: text('evidence'),
})
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 36 })
    .notNull()
    .references(() => organizations.id),
  email: varchar('email', { length: 254 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  mfaCipher: text('mfa_cipher').notNull(),
  lastTotpStep: integer('last_totp_step').notNull().default(0),
  roles: jsonb('roles').$type<string[]>().notNull(),
  suspended: boolean('suspended').notNull().default(false),
  createdAt: timestamp('created_at', {
    mode: 'date',
    precision: 3,
    withTimezone: true,
  }).notNull(),
})
export const entities = pgTable(
  'content_entities',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    kind: varchar('kind', { length: 20 }).$type<ContentKind>().notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    organizationId: varchar('organization_id', { length: 36 })
      .notNull()
      .references(() => organizations.id),
    version: integer('version').notNull().default(1),
    publishedRevisionId: varchar('published_revision_id', {
      length: 36,
    }).references((): AnyPgColumn => revisions.id),
    everPublished: boolean('ever_published').notNull().default(false),
    archived: boolean('archived').notNull().default(false),
  },
  (t) => [
    uniqueIndex('kind_slug').on(t.kind, t.slug),
    index('published_lookup').on(t.kind, t.publishedRevisionId),
    index('owner_lookup').on(t.organizationId),
  ],
)
export const revisions = pgTable(
  'content_revisions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    entityId: varchar('entity_id', { length: 36 })
      .notNull()
      .references(() => entities.id),
    sequence: integer('sequence').notNull(),
    body: jsonb('body_json').$type<ContentBody>().notNull(),
    status: varchar('status', { length: 25 }).$type<RevisionState>().notNull(),
    authorId: varchar('author_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    reviewerId: varchar('reviewer_id', { length: 36 }).references(
      () => users.id,
    ),
    checklist: jsonb('checklist').$type<Checklist | null>(),
    reviewNote: text('review_note'),
    reviewedAt: timestamp('reviewed_at', {
      mode: 'date',
      precision: 3,
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', {
      mode: 'date',
      precision: 3,
      withTimezone: true,
    }).notNull(),
  },
  (t) => [uniqueIndex('entity_revision').on(t.entityId, t.sequence)],
)
export const sessions = pgTable(
  'sessions',
  {
    hash: varchar('token_hash', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    csrfHash: varchar('csrf_hash', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at', {
      mode: 'date',
      precision: 3,
      withTimezone: true,
    }).notNull(),
    idleAt: timestamp('idle_at', {
      mode: 'date',
      precision: 3,
      withTimezone: true,
    }).notNull(),
  },
  (t) => [
    index('session_user').on(t.userId),
    index('session_expiry').on(t.expiresAt),
  ],
)
export const rateLimits = pgTable('rate_limit_buckets', {
  key: varchar('key_hash', { length: 64 }).primaryKey(),
  count: integer('count').notNull(),
  expiresAt: timestamp('expires_at', {
    mode: 'date',
    precision: 3,
    withTimezone: true,
  }).notNull(),
})
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    actorId: varchar('actor_id', { length: 36 }),
    action: varchar('action', { length: 100 }).notNull(),
    targetId: varchar('target_id', { length: 100 }).notNull(),
    requestId: varchar('request_id', { length: 36 }).notNull(),
    reason: text('reason'),
    safeChange: jsonb('safe_change').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', {
      mode: 'date',
      precision: 3,
      withTimezone: true,
    }).notNull(),
  },
  (t) => [index('audit_target').on(t.targetId, t.createdAt)],
)
export const settings = pgTable('settings', {
  key: varchar('setting_key', { length: 80 }).primaryKey(),
  value: jsonb('value_json').$type<Record<string, unknown>>().notNull(),
  version: integer('version').notNull().default(1),
})
export const proposals = pgTable('change_proposals', {
  id: varchar('id', { length: 36 }).primaryKey(),
  kind: varchar('kind', { length: 40 }).notNull(),
  makerId: varchar('maker_id', { length: 36 })
    .notNull()
    .references(() => users.id),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  checkerId: varchar('checker_id', { length: 36 }),
  createdAt: timestamp('created_at', {
    mode: 'date',
    precision: 3,
    withTimezone: true,
  }).notNull(),
})
export const assets = pgTable('assets', {
  id: varchar('id', { length: 36 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 36 })
    .notNull()
    .references(() => organizations.id),
  key: varchar('storage_key', { length: 100 }).notNull().unique(),
  mime: varchar('mime', { length: 80 }).notNull(),
  bytes: integer('bytes').notNull(),
  sha256: varchar('sha256', { length: 64 }).notNull(),
  width: integer('width'),
  height: integer('height'),
  scanStatus: varchar('scan_status', { length: 20 }).notNull(),
  rightsStatus: varchar('rights_status', { length: 20 })
    .notNull()
    .default('pending'),
  rightsReason: text('rights_reason'),
  uploadedBy: varchar('uploaded_by', { length: 36 })
    .notNull()
    .references(() => users.id),
  approvedBy: varchar('approved_by', { length: 36 }),
  createdAt: timestamp('created_at', {
    mode: 'date',
    precision: 3,
    withTimezone: true,
  }).notNull(),
})
export const outbox = pgTable('outbox_jobs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  type: varchar('type', { length: 40 }).notNull(),
  entityId: varchar('entity_id', { length: 36 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  attempts: integer('attempts').notNull().default(0),
  availableAt: timestamp('available_at', {
    mode: 'date',
    precision: 3,
    withTimezone: true,
  }).notNull(),
  leaseUntil: timestamp('lease_until', {
    mode: 'date',
    precision: 3,
    withTimezone: true,
  }),
  leaseOwner: varchar('lease_owner', { length: 36 }),
})

export const authChallenges = pgTable('auth_challenges', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  kind: varchar('kind', { length: 20 }).notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  expiresAt: timestamp('expires_at', {
    mode: 'date',
    precision: 3,
    withTimezone: true,
  }).notNull(),
  consumed: boolean('consumed').notNull().default(false),
})

export const redirects = pgTable('redirects', {
  fromPath: varchar('from_path', { length: 220 }).primaryKey(),
  toPath: varchar('to_path', { length: 220 }).notNull(),
  createdAt: timestamp('created_at', {
    mode: 'date',
    precision: 3,
    withTimezone: true,
  }).notNull(),
})
