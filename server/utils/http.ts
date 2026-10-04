import { ZodError } from 'zod'
import {
  defineEventHandler,
  createError,
  getHeader,
  setResponseHeader,
} from 'h3'
import type { H3Event } from 'h3'
import type { ZodType } from 'zod'
export const api = <T>(fn: (event: H3Event) => Promise<T>) =>
  defineEventHandler(async (event) => {
    try {
      return await fn(event)
    } catch (error) {
      let cause: unknown = error
      for (
        let depth = 0;
        depth < 4 && cause && typeof cause === 'object';
        depth++
      ) {
        if ('code' in cause && cause.code === '23505')
          throw createError({
            statusCode: 409,
            statusMessage: 'Identitas atau slug sudah digunakan',
          })
        cause = 'cause' in cause ? cause.cause : undefined
      }
      if (error instanceof ZodError)
        throw createError({
          statusCode: 422,
          statusMessage: 'Periksa format data yang dikirim',
        })
      if (error && typeof error === 'object' && 'statusCode' in error)
        throw error
      const wrapped = statusFromCause(error)
      if (wrapped) throw wrapped
      console.error(
        JSON.stringify({
          level: 'error',
          requestId: event.context.requestId,
          event: 'request_failed',
        }),
      )
      throw createError({
        statusCode: 503,
        statusMessage: 'Layanan sementara tidak tersedia. Coba lagi.',
      })
    }
  })
function statusFromCause(error: unknown) {
  let cause: unknown =
    error && typeof error === 'object' && 'cause' in error
      ? error.cause
      : undefined
  for (
    let depth = 0;
    depth < 4 && cause && typeof cause === 'object';
    depth++
  ) {
    if ('statusCode' in cause && typeof cause.statusCode === 'number') {
      const statusCode = cause.statusCode
      const statusMessage =
        'statusMessage' in cause && typeof cause.statusMessage === 'string'
          ? cause.statusMessage
          : undefined
      return createError({ statusCode, statusMessage })
    }
    cause = 'cause' in cause ? cause.cause : undefined
  }
  return undefined
}
export async function body<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const length = Number(getHeader(event, 'content-length') ?? 0)
  if (length > 128 * 1024) throw createError({ statusCode: 413 })
  const chunks: Buffer[] = []
  let bytes = 0
  for await (const chunk of event.node.req) {
    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    bytes += value.length
    if (bytes > 128 * 1024) throw createError({ statusCode: 413 })
    chunks.push(value)
  }
  let input: unknown
  try {
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'JSON tidak valid' })
  }
  return schema.parse(input)
}
export function requireOrigin(event: H3Event) {
  const configured = new URL(
    process.env.NUXT_SITE_URL ?? 'http://localhost:3000',
  ).origin
  if (getHeader(event, 'origin') !== configured)
    throw createError({
      statusCode: 403,
      statusMessage: 'Origin tidak diizinkan',
    })
}
export function requireMethod(event: H3Event, ...allowed: string[]) {
  const method = event.method.toUpperCase()
  if (!allowed.includes(method)) {
    setResponseHeader(event, 'allow', [...allowed, 'HEAD'].join(', '))
    throw createError({
      statusCode: 405,
      statusMessage: 'Metode tidak didukung',
    })
  }
}
export const READ_ONLY_METHODS = ['GET', 'HEAD']
