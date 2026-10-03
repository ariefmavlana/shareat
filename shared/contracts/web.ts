import { z } from 'zod'
export function normalizePhone(value: string): string {
  const digits = value.replace(/[\s()+-]/g, '')
  const phone = digits.startsWith('0') ? '62' + digits.slice(1) : digits
  if (!/^628\d{8,11}$/.test(phone))
    throw new Error('Nomor WhatsApp tidak valid')
  return phone
}
export function whatsappLink(phone: string, context: string): string {
  if (
    !/^628\d{8,11}$/.test(phone) ||
    context.length > 150 ||
    /[@<>\r\n]|https?:/i.test(context)
  )
    throw new Error('Konteks kontak tidak valid')
  return `https://wa.me/${phone}?text=${encodeURIComponent(`Halo tim Shareat, saya ingin mengetahui ${context} dan peluang kolaborasi.`)}`
}
export function contactLink(phone: string, context: string): string {
  try {
    return whatsappLink(phone, context)
  } catch {
    return whatsappLink(phone, 'program Shareat')
  }
}
export function canonical(origin: string, path: string): string {
  const base = new URL(origin)
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\')
  )
    throw new Error('URL tidak valid')
  return new URL(path.split('?')[0]!, base.origin).href
}
export function jsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
export const listQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(500).default(1),
    q: z.string().trim().max(120).default(''),
    program: z.string().max(100).default(''),
    lokasi: z.string().max(100).default(''),
    status: z.enum(['', 'planning', 'ongoing', 'completed']).default(''),
  })
  .strict()
export const contactSchema = z
  .object({
    phone: z.string().regex(/^628\d{8,11}$/),
    hours: z.string().trim().min(5).max(150),
    ownershipVerified: z.literal(true),
  })
  .strict()
export type ContactConfig = z.infer<typeof contactSchema>
