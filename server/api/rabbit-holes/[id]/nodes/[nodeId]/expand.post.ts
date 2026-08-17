import { and, eq } from 'drizzle-orm'
import type { ExpandPatch } from '../../../../../../shared/types/rabbit-holes'
import { nodes, rabbitHoles, useDb } from '~~/server/db'
import { EXPAND_TAKE_DEFAULT } from '~~/server/services/expand/constants'
import { expandNode } from '~~/server/services/expand/expand-node'
import { toExpandPatch } from '~~/server/services/rabbit-holes/mappers'
import {
  ErrorMessage,
  badRequest,
  forbidden,
  notFound,
} from '~~/server/utils/errors'

export default defineEventHandler(async (event): Promise<ExpandPatch> => {
  const session = await requireSession(event)
  if (!session.user.termsAccepted) {
    throw forbidden(ErrorMessage.acceptTermsFirst)
  }
  const id = getRouterParam(event, 'id')
  const nodeId = getRouterParam(event, 'nodeId')
  if (!id || !nodeId) throw badRequest(ErrorMessage.missingParams)

  const db = useDb()
  const hole = await db.query.rabbitHoles.findFirst({
    where: and(eq(rabbitHoles.id, id), eq(rabbitHoles.userId, session.user.id)),
  })
  if (!hole) throw notFound(ErrorMessage.rabbitHoleNotFound)

  const node = await db.query.nodes.findFirst({
    where: and(eq(nodes.id, nodeId), eq(nodes.rabbitHoleId, id)),
  })
  if (!node) throw notFound(ErrorMessage.nodeNotFound)

  const created = await expandNode({
    userId: session.user.id,
    rabbitHoleId: id,
    nodeId,
    take: EXPAND_TAKE_DEFAULT,
  })
  return toExpandPatch(created)
})
