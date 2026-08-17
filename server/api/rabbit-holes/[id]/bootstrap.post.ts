import { and, eq } from 'drizzle-orm'
import { nodes, rabbitHoles, useDb } from '~~/server/db'
import { bootstrapRabbitHole } from '~~/server/services/expand/bootstrap'
import {
  ErrorMessage,
  badRequest,
  notFound,
} from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw badRequest(ErrorMessage.missingId)
  const db = useDb()
  const hole = await db.query.rabbitHoles.findFirst({
    where: and(eq(rabbitHoles.id, id), eq(rabbitHoles.userId, session.user.id)),
  })
  if (!hole) throw notFound(ErrorMessage.rabbitHoleNotFound)
  const seed = await db.query.nodes.findFirst({
    where: and(eq(nodes.rabbitHoleId, id), eq(nodes.videoId, hole.seedVideoId)),
  })
  if (!seed) throw badRequest('Seed node missing')
  await bootstrapRabbitHole({
    userId: session.user.id,
    rabbitHoleId: id,
    seedNodeId: seed.id,
  })
  return { ok: true }
})
