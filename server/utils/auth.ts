import { and, eq, gt } from 'drizzle-orm'
import {
  getCookie,
  setCookie,
  deleteCookie,
  getHeader,
  getRequestIP,
  createError,
} from 'h3'
import type { H3Event } from 'h3'
import { database } from '../db/client'
import { users, organizations, sessions, rateLimits } from '../db/schema'
import { digest, token } from '../modules/identity/crypto'
import { requireOrigin } from './http'
import type { Actor } from '../../shared/contracts/content'
export const cookieName = () =>
  process.env.NUXT_APP_MODE === 'production'
    ? '__Host-shareat_session'
    : 'shareat_dev_session'
export async function rateLimit(
  event: H3Event,
  key: string,
  max: number,
  windowMs = 900000,
) {
  const db = database()
  const hashed = digest((process.env.NUXT_ENCRYPTION_KEY ?? '') + key)
  await db.transaction(async (tx) => {
    await tx
      .insert(rateLimits)
      .values({
        key: hashed,
        count: 0,
        expiresAt: new Date(Date.now() + windowMs),
      })
      .onDuplicateKeyUpdate({ set: { key: hashed } })
    const [r] = await tx
      .select()
      .from(rateLimits)
      .where(eq(rateLimits.key, hashed))
      .for('update')
    if (!r) throw createError({ statusCode: 503 })
    const count = r.expiresAt.getTime() > Date.now() ? r.count : 0
    if (count >= max)
      throw createError({
        statusCode: 429,
        statusMessage: 'Terlalu banyak percobaan. Coba lagi nanti.',
      })
    await tx
      .update(rateLimits)
      .set({
        count: count + 1,
        expiresAt: count === 0 ? new Date(Date.now() + windowMs) : r.expiresAt,
      })
      .where(eq(rateLimits.key, hashed))
  })
}
export function networkKey(event: H3Event) {
  return (
    getRequestIP(event, {
      xForwardedFor: process.env.NUXT_PROXY_TRUSTED === 'true',
    }) ?? 'local'
  )
}
export async function authentication(event: H3Event) {
  const value = getCookie(event, cookieName())
  if (!value || !/^[a-f0-9]{64}$/.test(value))
    throw createError({
      statusCode: 401,
      statusMessage: 'Silakan masuk kembali',
    })
  const db = database()
  const [row] = await db
    .select({ session: sessions, user: users, org: organizations })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(organizations, eq(users.organizationId, organizations.id))
    .where(
      and(
        eq(sessions.hash, digest(value)),
        gt(sessions.expiresAt, new Date()),
        gt(sessions.idleAt, new Date()),
      ),
    )
  if (!row || row.user.suspended || row.org.suspended)
    throw createError({
      statusCode: 401,
      statusMessage: 'Silakan masuk kembali',
    })
  const actor: Actor = {
    id: row.user.id,
    roles: row.user.roles,
    organizationId: row.org.id,
    verified: row.org.verified,
    requestId: event.context.requestId,
  }
  await db
    .update(sessions)
    .set({ idleAt: new Date(Date.now() + 30 * 60000) })
    .where(eq(sessions.hash, row.session.hash))
  return { actor, session: row.session, email: row.user.email }
}
export async function requireAuth(
  event: H3Event,
  mutation = false,
  roles?: string[],
) {
  const result = await authentication(event)
  if (roles && !roles.some((r) => result.actor.roles.includes(r)))
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  if (mutation) {
    requireOrigin(event)
    const csrf = getHeader(event, 'x-csrf-token')
    if (!csrf || digest(csrf) !== result.session.csrfHash)
      throw createError({
        statusCode: 403,
        statusMessage: 'Token keamanan tidak valid',
      })
  }
  return result.actor
}
export async function issueSession(event: H3Event, userId: string) {
  const value = token()
  const csrf = token()
  await database()
    .insert(sessions)
    .values({
      hash: digest(value),
      userId,
      csrfHash: digest(csrf),
      expiresAt: new Date(Date.now() + 8 * 3600000),
      idleAt: new Date(Date.now() + 30 * 60000),
    })
  const secure = process.env.NUXT_APP_MODE === 'production'
  setCookie(event, cookieName(), value, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 3600,
  })
  setCookie(event, 'shareat_csrf', csrf, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 3600,
  })
  return { csrf }
}
export async function endSession(event: H3Event) {
  const value = getCookie(event, cookieName())
  if (value)
    await database()
      .delete(sessions)
      .where(eq(sessions.hash, digest(value)))
  deleteCookie(event, cookieName(), { path: '/' })
  deleteCookie(event, 'shareat_csrf', { path: '/' })
}
