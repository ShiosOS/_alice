import { and, eq } from 'drizzle-orm'
import { nodes, rabbitHoles, useDb } from '~~/server/db'
import { expandNode } from '~~/server/utils/expand'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event as never)
  if (!session.user.termsAccepted) {
    throw createError({ statusCode: 403, statusMessage: 'Accept Terms first' })
  }
  const id = getRouterParam(event, 'id')
  const nodeId = getRouterParam(event, 'nodeId')
  if (!id || !nodeId) throw createError({ statusCode: 400, statusMessage: 'Missing params' })

  const db = useDb()
  const hole = await db.query.rabbitHoles.findFirst({
    where: and(eq(rabbitHoles.id, id), eq(rabbitHoles.userId, session.user.id)),
  })
  if (!hole) throw createError({ statusCode: 404, statusMessage: 'Rabbit Hole not found' })

  const node = await db.query.nodes.findFirst({
    where: and(eq(nodes.id, nodeId), eq(nodes.rabbitHoleId, id)),
  })
  if (!node) throw createError({ statusCode: 404, statusMessage: 'Node not found' })

  return expandNode({
    userId: session.user.id,
    rabbitHoleId: id,
    nodeId,
    take: 3,
  })
})
