import { and, eq } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'
import { edges, expandLedger, nodes, rabbitHoles, useDb } from '../../db'
import {
  ErrorMessage,
  badGateway,
  notFound,
  unprocessable,
} from '../../utils/errors'
import { getRelatedCandidates, getVideoTopic } from '../youtube/related'
import type { YoutubeVideoMeta } from '../youtube/types'
import { assertExpandBudget } from './budget'
import { callAiForForks } from './fork-selector'

type NodeRow = InferSelectModel<typeof nodes>
type EdgeRow = InferSelectModel<typeof edges>

export async function expandNode(opts: {
  userId: string
  rabbitHoleId: string
  nodeId: string
  take: number
}) {
  await assertExpandBudget(opts.userId)
  const db = useDb()

  const hole = await db.query.rabbitHoles.findFirst({
    where: eq(rabbitHoles.id, opts.rabbitHoleId),
  })
  if (!hole || hole.userId !== opts.userId) {
    throw notFound(ErrorMessage.rabbitHoleNotFound)
  }

  const focus = await db.query.nodes.findFirst({
    where: and(eq(nodes.id, opts.nodeId), eq(nodes.rabbitHoleId, opts.rabbitHoleId)),
  })
  if (!focus) {
    throw notFound(ErrorMessage.nodeNotFound)
  }

  const seed = await db.query.nodes.findFirst({
    where: and(eq(nodes.rabbitHoleId, opts.rabbitHoleId), eq(nodes.videoId, hole.seedVideoId)),
  })

  const existing = await db.query.nodes.findMany({
    where: eq(nodes.rabbitHoleId, opts.rabbitHoleId),
  })
  const existingIds = new Set(existing.map(n => n.videoId))

  const seedVideoId = seed?.videoId || hole.seedVideoId
  const isSeedFocus = focus.videoId === seedVideoId

  const { topic: seedTopic, meta: seedMeta } = await getVideoTopic(seedVideoId)
  const pack = await getRelatedCandidates(focus.videoId, {
    seedTopic: isSeedFocus ? null : seedTopic,
    bypassCandidateCache: !isSeedFocus,
  })

  const focusTopic = pack.topic
  const focusMeta: YoutubeVideoMeta = {
    ...pack.meta,
    title: pack.meta.available ? pack.meta.title : focus.title,
    channelTitle: pack.meta.channelTitle || focus.channelTitle || null,
  }
  const seedMetaResolved: YoutubeVideoMeta = {
    ...seedMeta,
    title: seedMeta.available ? seedMeta.title : (seed?.title || hole.title),
    channelTitle: seedMeta.channelTitle || seed?.channelTitle || null,
  }

  const candidates = pack.candidates.filter(c => !existingIds.has(c.videoId) && c.available)

  if (!candidates.length) {
    await db.insert(expandLedger).values({
      userId: opts.userId,
      rabbitHoleId: opts.rabbitHoleId,
      nodeId: opts.nodeId,
      status: 'failed',
      meta: { reason: 'no_candidates' },
    })
    logError('expand_failed', { reason: 'no_candidates', rabbitHoleId: opts.rabbitHoleId, nodeId: opts.nodeId })
    throw unprocessable(ErrorMessage.noForkCandidates)
  }

  let aiResult
  try {
    aiResult = await callAiForForks({
      seedMeta: seedMetaResolved,
      focusMeta,
      seedTopic,
      focusTopic,
      candidates,
      take: opts.take,
    })
  }
  catch (e) {
    await db.insert(expandLedger).values({
      userId: opts.userId,
      rabbitHoleId: opts.rabbitHoleId,
      nodeId: opts.nodeId,
      status: 'failed',
      meta: { reason: 'ai_failed', message: e instanceof Error ? e.message : 'unknown' },
    })
    captureServerException(e, {
      reason: 'ai_failed',
      rabbitHoleId: opts.rabbitHoleId,
      nodeId: opts.nodeId,
    })
    throw badGateway(ErrorMessage.forksFailed)
  }

  const byId = new Map(candidates.map(c => [c.videoId, c]))
  const createdNodes: NodeRow[] = []
  const createdEdges: EdgeRow[] = []

  await db.transaction(async (tx) => {
    for (const fork of aiResult.forks) {
      const meta = byId.get(fork.videoId)
      if (!meta) continue

      // Step 1: try insert; onConflictDoNothing when video already on this hole.
      const [insertedNode] = await tx
        .insert(nodes)
        .values({
          rabbitHoleId: opts.rabbitHoleId,
          videoId: meta.videoId,
          title: meta.title,
          channelTitle: meta.channelTitle,
          thumbUrl: meta.thumbUrl,
          available: meta.available,
        })
        .onConflictDoNothing()
        .returning()

      // Step 2: if conflict, load the existing node for this video.
      let toNode = insertedNode
      if (!toNode) {
        toNode = await tx.query.nodes.findFirst({
          where: and(
            eq(nodes.rabbitHoleId, opts.rabbitHoleId),
            eq(nodes.videoId, meta.videoId),
          ),
        })
      }

      // Step 3: skip if we still have no target node.
      if (!toNode) continue

      const [edge] = await tx
        .insert(edges)
        .values({
          rabbitHoleId: opts.rabbitHoleId,
          fromNodeId: focus.id,
          toNodeId: toNode.id,
          phrase: fork.phrase,
        })
        .onConflictDoNothing()
        .returning()
      if (insertedNode) createdNodes.push(insertedNode)
      if (edge) createdEdges.push(edge)
    }

    await tx.insert(expandLedger).values({
      userId: opts.userId,
      rabbitHoleId: opts.rabbitHoleId,
      nodeId: opts.nodeId,
      status: 'success',
      model: aiResult.model,
      promptTokens: aiResult.promptTokens,
      completionTokens: aiResult.completionTokens,
      meta: {
        take: opts.take,
        forkCount: createdEdges.length,
        seedDomain: seedTopic.domain,
        focusDomain: focusTopic.domain,
      },
    })

    logInfo('expand_success', {
      rabbitHoleId: opts.rabbitHoleId,
      nodeId: opts.nodeId,
      forkCount: createdEdges.length,
      model: aiResult.model,
      promptTokens: aiResult.promptTokens,
      completionTokens: aiResult.completionTokens,
    })

    await tx
      .update(rabbitHoles)
      .set({ updatedAt: new Date() })
      .where(eq(rabbitHoles.id, opts.rabbitHoleId))
  })

  return { nodes: createdNodes, edges: createdEdges }
}
