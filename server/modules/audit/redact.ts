const sensitiveKeys = new Set([
  'phone',
  'email',
  'userid',
  'organizationid',
  'token',
  'recoverytoken',
  'secret',
])

export function redact(
  value: Record<string, unknown>,
): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (sensitiveKeys.has(key.toLowerCase())) {
      output[key] = '[redacted]'
      continue
    }
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      output[key] = redact(entry as Record<string, unknown>)
      continue
    }
    output[key] = entry
  }
  return output
}
