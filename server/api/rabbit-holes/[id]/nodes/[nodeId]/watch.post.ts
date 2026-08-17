import { and, eq } from 'drizzle-orm'
import { nodes, pathEvents, rabbitHoles, useDb } from '~~/server/db'
import { youtubeWatchUrl } from '~~/server/utils/youtube'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event as never)
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

  await db
    .insert(pathEvents)
    .values({
      rabbitHoleId: id,
      nodeId,
      kind: 'visited',
    })
    .onConflictDoNothing()

  return { watchUrl: youtubeWatchUrl(node.videoId), videoId: node.videoId }
})
