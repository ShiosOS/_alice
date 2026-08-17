import { eq } from 'drizzle-orm'
import type { RabbitHoleGraph, RabbitHoleList } from '../../../shared/types/rabbit-holes'
import { createRabbitHoleBodySchema } from '../../../shared/types/rabbit-holes'
import { nodes, rabbitHoles, useDb } from '../../db'
import { bootstrapRabbitHole } from '../../services/expand/bootstrap'
import { RABBIT_HOLE_TITLE_MAX } from '../../services/expand/constants'
import { loadHoleGraph } from '../../services/rabbit-holes/load-graph'
import { toRabbitHoleSummary } from '../../services/rabbit-holes/mappers'
import { fetchVideoMeta } from '../../services/youtube/api'
import { parseYoutubeVideoId } from '../../services/youtube/video-id'
import {
  ErrorMessage,
  badRequest,
  forbidden,
  methodNotAllowed,
  serverError,
} from '../../utils/errors'
import { readZodBody } from '../../utils/validate'

const HOLE_STATUS_INCOMPLETE = 'incomplete' as const

export default defineEventHandler(async (event): Promise<RabbitHoleList | RabbitHoleGraph> => {
  const session = await requireSession(event)
  const db = useDb()

  if (event.method === 'GET') {
    const { desc } = await import('drizzle-orm')
    const holes = await db
      .select()
      .from(rabbitHoles)
      .where(eq(rabbitHoles.userId, session.user.id))
      .orderBy(desc(rabbitHoles.updatedAt))
    return { rabbitHoles: holes.map(toRabbitHoleSummary) }
  }

  if (event.method === 'POST') {
    if (!session.user.termsAccepted) {
      throw forbidden(ErrorMessage.acceptTermsCreate)
    }
    const body = await readZodBody(event, createRabbitHoleBodySchema)
    const videoId = parseYoutubeVideoId(body.url)
    if (!videoId) {
      throw badRequest(ErrorMessage.invalidYoutubeUrl)
    }
    const meta = await fetchVideoMeta(videoId)
    if (!meta.available) {
      throw badRequest(ErrorMessage.youtubeUnavailable)
    }

    const title = (body.title || meta.title || 'Untitled Rabbit Hole').slice(0, RABBIT_HOLE_TITLE_MAX)
    const [hole] = await db
      .insert(rabbitHoles)
      .values({
        userId: session.user.id,
        title,
        seedVideoId: videoId,
        status: HOLE_STATUS_INCOMPLETE,
      })
      .returning()
    if (!hole) {
      throw serverError('Could not create Rabbit Hole')
    }

    const [seedNode] = await db
      .insert(nodes)
      .values({
        rabbitHoleId: hole.id,
        videoId: meta.videoId,
        title: meta.title,
        channelTitle: meta.channelTitle,
        thumbUrl: meta.thumbUrl,
        available: meta.available,
      })
      .returning()
    if (!seedNode) {
      throw serverError('Could not create seed node')
    }

    try {
      await bootstrapRabbitHole({
        userId: session.user.id,
        rabbitHoleId: hole.id,
        seedNodeId: seedNode.id,
      })
    }
    catch (e) {
      await db
        .update(rabbitHoles)
        .set({ status: HOLE_STATUS_INCOMPLETE, updatedAt: new Date() })
        .where(eq(rabbitHoles.id, hole.id))
      throw createError({
        statusCode: 502,
        statusMessage: e instanceof Error ? e.message : 'Bootstrap failed',
        data: { rabbitHoleId: hole.id, status: HOLE_STATUS_INCOMPLETE },
      })
    }

    return loadHoleGraph(hole.id, session.user.id)
  }

  throw methodNotAllowed()
})
