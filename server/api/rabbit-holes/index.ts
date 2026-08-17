import { eq } from 'drizzle-orm'
import type { RabbitHoleGraph, RabbitHoleList } from '../../../shared/types/rabbit-holes'
import { createRabbitHoleBodySchema } from '../../../shared/types/rabbit-holes'
import { nodes, rabbitHoles, useDb } from '../../db'
import { bootstrapRabbitHole } from '../../utils/expand'
import { loadHoleGraph, toRabbitHoleSummary } from '../../utils/rabbit-holes'
import { readZodBody } from '../../utils/validate'
import { fetchVideoMeta, parseYoutubeVideoId } from '../../utils/youtube'

export default defineEventHandler(async (event): Promise<RabbitHoleList | RabbitHoleGraph> => {
  const session = await requireUserSession(event)
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
      throw createError({ statusCode: 403, statusMessage: 'Accept Terms before creating Rabbit Holes' })
    }
    const body = await readZodBody(event, createRabbitHoleBodySchema)
    const videoId = parseYoutubeVideoId(body.url)
    if (!videoId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid YouTube URL' })
    }
    const meta = await fetchVideoMeta(videoId)
    if (!meta.available) {
      throw createError({ statusCode: 400, statusMessage: 'That YouTube video is unavailable' })
    }

    const title = (body.title || meta.title || 'Untitled Rabbit Hole').slice(0, 200)
    const [hole] = await db
      .insert(rabbitHoles)
      .values({
        userId: session.user.id,
        title,
        seedVideoId: videoId,
        status: 'incomplete',
      })
      .returning()
    if (!hole) {
      throw createError({ statusCode: 500, statusMessage: 'Could not create Rabbit Hole' })
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
      throw createError({ statusCode: 500, statusMessage: 'Could not create seed node' })
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
        .set({ status: 'incomplete', updatedAt: new Date() })
        .where(eq(rabbitHoles.id, hole.id))
      throw createError({
        statusCode: 502,
        statusMessage: e instanceof Error ? e.message : 'Bootstrap failed',
        data: { rabbitHoleId: hole.id, status: 'incomplete' },
      })
    }

    return loadHoleGraph(hole.id, session.user.id)
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
