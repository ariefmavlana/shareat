import { randomUUID } from 'node:crypto'
import { api, body } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { database } from '../../../../db/client'
import { proposals, auditLogs } from '../../../../db/schema'
import { organizationSchema } from '../../../../../shared/contracts/identity'
export default api(async (event) => {
  const actor = await requireAuth(event, true, ['admin'])
  const value = await body(event, organizationSchema)
  const id = randomUUID()
  await database().transaction(async (tx) => {
    await tx.insert(proposals).values({
      id,
      kind: 'organization',
      makerId: actor.id,
      payload: value,
      createdAt: new Date(),
    })
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: actor.id,
      action: 'organization.propose',
      targetId: id,
      requestId: event.context.requestId,
      safeChange: {},
      createdAt: new Date(),
    })
  })
  return { id }
})
