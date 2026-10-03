import {
  mysqlTable,
  type AnyMySqlColumn,
  varchar,
  text,
  int,
  boolean,
  json,
  datetime,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core'
import type {
  ContentBody,
  Checklist,
  ContentKind,
  RevisionState,
} from '../../shared/contracts/content'
export const organizations = mysqlTable('organizations', {
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
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 36 })
    .notNull()
    .references(() => organizations.id),
  email: varchar('email', { length: 254 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  mfaCipher: text('mfa_cipher').notNull(),
  lastTotpStep: int('last_totp_step').notNull().default(0),
  roles: json('roles').$type<string[]>().notNull(),
  suspended: boolean('suspended').notNull().default(false),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
})
export const entities = mysqlTable(
  'content_entities',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    kind: varchar('kind', { length: 20 }).$type<ContentKind>().notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    organizationId: varchar('organization_id', { length: 36 })
      .notNull()
      .references(() => organizations.id),
    version: int('version').notNull().default(1),
    publishedRevisionId: varchar('published_revision_id', {
      length: 36,
    }).references((): AnyMySqlColumn => revisions.id),
    everPublished: boolean('ever_published').notNull().default(false),
    archived: boolean('archived').notNull().default(false),
  },
  (t) => [
    uniqueIndex('kind_slug').on(t.kind, t.slug),
    index('published_lookup').on(t.kind, t.publishedRevisionId),
    index('owner_lookup').on(t.organizationId),
  ],
)
export const revisions = mysqlTable(
  'content_revisions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    entityId: varchar('entity_id', { length: 36 })
      .notNull()
      .references(() => entities.id),
    sequence: int('sequence').notNull(),
    body: json('body_json').$type<ContentBody>().notNull(),
    status: varchar('status', { length: 25 }).$type<RevisionState>().notNull(),
    authorId: varchar('author_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    reviewerId: varchar('reviewer_id', { length: 36 }).references(
      () => users.id,
    ),
    checklist: json('checklist').$type<Checklist | null>(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
  },
  (t) => [uniqueIndex('entity_revision').on(t.entityId, t.sequence)],
)
export const sessions = mysqlTable(
  'sessions',
  {
    hash: varchar('token_hash', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    csrfHash: varchar('csrf_hash', { length: 64 }).notNull(),
    expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
    idleAt: datetime('idle_at', { mode: 'date', fsp: 3 }).notNull(),
  },
  (t) => [
    index('session_user').on(t.userId),
    index('session_expiry').on(t.expiresAt),
  ],
)
export const rateLimits = mysqlTable('rate_limit_buckets', {
  key: varchar('key_hash', { length: 64 }).primaryKey(),
  count: int('count').notNull(),
  expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
})
export const auditLogs = mysqlTable(
  'audit_logs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    actorId: varchar('actor_id', { length: 36 }),
    action: varchar('action', { length: 100 }).notNull(),
    targetId: varchar('target_id', { length: 100 }).notNull(),
    requestId: varchar('request_id', { length: 36 }).notNull(),
    reason: text('reason'),
    safeChange: json('safe_change').$type<Record<string, unknown>>().notNull(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
  },
  (t) => [index('audit_target').on(t.targetId, t.createdAt)],
)
export const settings = mysqlTable('settings', {
  key: varchar('setting_key', { length: 80 }).primaryKey(),
  value: json('value_json').$type<Record<string, unknown>>().notNull(),
  version: int('version').notNull().default(1),
})
export const proposals = mysqlTable('change_proposals', {
  id: varchar('id', { length: 36 }).primaryKey(),
  kind: varchar('kind', { length: 40 }).notNull(),
  makerId: varchar('maker_id', { length: 36 })
    .notNull()
    .references(() => users.id),
  payload: json('payload').$type<Record<string, unknown>>().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  checkerId: varchar('checker_id', { length: 36 }),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
})
export const assets = mysqlTable('assets', {
  id: varchar('id', { length: 36 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 36 })
    .notNull()
    .references(() => organizations.id),
  key: varchar('storage_key', { length: 100 }).notNull().unique(),
  mime: varchar('mime', { length: 80 }).notNull(),
  bytes: int('bytes').notNull(),
  sha256: varchar('sha256', { length: 64 }).notNull(),
  width: int('width'),
  height: int('height'),
  scanStatus: varchar('scan_status', { length: 20 }).notNull(),
  rightsStatus: varchar('rights_status', { length: 20 })
    .notNull()
    .default('pending'),
  rightsReason: text('rights_reason'),
  uploadedBy: varchar('uploaded_by', { length: 36 })
    .notNull()
    .references(() => users.id),
  approvedBy: varchar('approved_by', { length: 36 }),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
})
export const outbox = mysqlTable('outbox_jobs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  type: varchar('type', { length: 40 }).notNull(),
  entityId: varchar('entity_id', { length: 36 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  attempts: int('attempts').notNull().default(0),
  availableAt: datetime('available_at', { mode: 'date', fsp: 3 }).notNull(),
  leaseUntil: datetime('lease_until', { mode: 'date', fsp: 3 }),
  leaseOwner: varchar('lease_owner', { length: 36 }),
})

export const authChallenges = mysqlTable('auth_challenges', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  kind: varchar('kind', { length: 20 }).notNull(),
  payload: json('payload').$type<Record<string, unknown>>().notNull(),
  expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
  consumed: boolean('consumed').notNull().default(false),
})

export const redirects = mysqlTable('redirects', {
  fromPath: varchar('from_path', { length: 220 }).primaryKey(),
  toPath: varchar('to_path', { length: 220 }).notNull(),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
})
