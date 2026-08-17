import { and, eq } from 'drizzle-orm'
import { nodes, rabbitHoles, useDb } from '~~/server/db'
import { bootstrapRabbitHole } from '~~/server/utils/expand'

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const db = useDb()
  const hole = await db.query.rabbitHoles.findFirst({
    where: and(eq(rabbitHoles.id, id), eq(rabbitHoles.userId, session.user.id)),
  })
  if (!hole) throw createError({ statusCode: 404, statusMessage: 'Rabbit Hole not found' })
  const seed = await db.query.nodes.findFirst({
    where: and(eq(nodes.rabbitHoleId, id), eq(nodes.videoId, hole.seedVideoId)),
  })
  if (!seed) throw createError({ statusCode: 400, statusMessage: 'Seed node missing' })
  await bootstrapRabbitHole({
    userId: session.user.id,
    rabbitHoleId: id,
    seedNodeId: seed.id,
  })
  return { ok: true }
})
