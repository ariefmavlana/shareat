import { z } from 'zod'
export const staffRoles = [
  'editor',
  'partner_editor',
  'reviewer',
  'operator',
  'auditor',
  'admin',
] as const
export const inviteSchema = z
  .object({
    email: z.email().max(254),
    organizationId: z.uuid(),
    roles: z.array(z.enum(staffRoles)).min(1).max(6),
  })
  .strict()
export const organizationSchema = z
  .object({
    name: z.string().trim().min(3).max(140),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    evidence: z.string().trim().min(20).max(4000),
  })
  .strict()
