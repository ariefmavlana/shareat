import { describe, it, expect } from 'vitest'
import {
  whatsappLink,
  contactLink,
  normalizePhone,
  canonical,
  jsonLd,
  listQuerySchema,
} from '../../shared/contracts/web'
describe('Public boundaries', () => {
  it('uses only validated phone digits and safe public context', () => {
    expect(normalizePhone('087776734038')).toBe('6287776734038')
    expect(whatsappLink('6287776734038', 'Share Eat')).toMatch(
      /^https:\/\/wa.me\/6287776734038\?text=/,
    )
    expect(() => whatsappLink('javascript:evil', 'x')).toThrow()
    expect(() => whatsappLink('6287776734038', 'name@example.com')).toThrow()
  })
  it('strips tracking parameters and rejects untrusted origins', () => {
    expect(
      canonical('https://shareat.example', '/inisiatif/contoh?utm_source=x'),
    ).toBe('https://shareat.example/inisiatif/contoh')
    expect(() =>
      canonical('https://shareat.example', '//evil.example'),
    ).toThrow()
    expect(jsonLd({ name: '</script>' })).not.toContain('</script>')
  })
  it('rejects malformed pagination and unbounded search', () => {
    expect(listQuerySchema.safeParse({ page: '0' }).success).toBe(false)
    expect(listQuerySchema.safeParse({ page: '1.5' }).success).toBe(false)
    expect(listQuerySchema.safeParse({ q: 'x'.repeat(121) }).success).toBe(
      false,
    )
  })
  it('falls back to neutral context when editable titles contain sensitive link input', () => {
    const link = contactLink('6287776734038', 'Hubungi name@example.com')
    expect(decodeURIComponent(link)).toContain('program Shareat')
    expect(decodeURIComponent(link)).not.toContain('name@example.com')
    expect(() => contactLink('invalid', 'program')).toThrow()
  })
})
