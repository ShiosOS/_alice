import { and, eq } from 'drizzle-orm'
import type { WatchResponse } from '../../../../../../shared/types/rabbit-holes'
import { nodes, pathEvents, rabbitHoles, useDb } from '~~/server/db'
import { youtubeWatchUrl } from '~~/server/services/youtube/video-id'
import {
  ErrorMessage,
  badRequest,
  notFound,
} from '~~/server/utils/errors'

export default defineEventHandler(async (event): Promise<WatchResponse> => {
  const session = await requireSession(event)
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
