import { randomUUID } from 'node:crypto'
import { api, body } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { database } from '../../../../db/client'
import { proposals, auditLogs } from '../../../../db/schema'
import { contactSchema } from '../../../../../shared/contracts/web'
export default api(async (event) => {
  const actor = await requireAuth(event, true, ['admin', 'operator'])
  const input = await body(event, contactSchema)
  const id = randomUUID()
  await database().transaction(async (tx) => {
    await tx.insert(proposals).values({
      id,
      kind: 'contact',
      makerId: actor.id,
      payload: input,
      createdAt: new Date(),
    })
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: actor.id,
      action: 'contact.propose',
      targetId: id,
      requestId: event.context.requestId,
      safeChange: { phoneChanged: true },
      createdAt: new Date(),
    })
  })
  return { id }
})
