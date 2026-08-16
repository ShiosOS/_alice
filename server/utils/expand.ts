import { and, count, eq, gte } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'
import { edges, expandLedger, nodes, rabbitHoles, useDb } from '../db'
import {
  getRelatedCandidates,
  type YoutubeCandidate,
} from './youtube'

export type ForkChoice = { videoId: string, phrase: string }
type NodeRow = InferSelectModel<typeof nodes>
type EdgeRow = InferSelectModel<typeof edges>

function expandDisabled() {
  const config = useRuntimeConfig()
  return config.expandDisabled === true || process.env.NUXT_EXPAND_DISABLED === 'true'
}

function dailyBudget() {
  const config = useRuntimeConfig()
  const n = Number(config.expandDailyBudget || process.env.NUXT_EXPAND_DAILY_BUDGET || 50)
  return Number.isFinite(n) ? n : 50
}

export async function assertExpandBudget(userId: string) {
  if (expandDisabled()) {
    throw createError({ statusCode: 503, statusMessage: 'Expand is temporarily disabled' })
  }
  const db = useDb()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [row] = await db
    .select({ c: count() })
    .from(expandLedger)
    .where(and(eq(expandLedger.userId, userId), gte(expandLedger.createdAt, since)))
  const used = Number(row?.c || 0)
  if (used >= dailyBudget()) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Daily expand budget exhausted. Try again tomorrow.',
    })
  }
}

async function callAiForForks(input: {
  seedTitle: string
  focusTitle: string
  candidates: YoutubeCandidate[]
  take: number
}): Promise<{ forks: ForkChoice[], model: string, promptTokens?: number, completionTokens?: number }> {
  const config = useRuntimeConfig()
  const apiKey = config.aiApiKey || process.env.NUXT_AI_API_KEY
  const baseUrl = (config.aiBaseUrl || process.env.NUXT_AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = config.aiModel || process.env.NUXT_AI_MODEL || 'gpt-4o-mini'
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'AI API key not configured' })
  }

  const candidateLines = input.candidates
    .slice(0, 15)
    .map((c, i) => `${i + 1}. ${c.videoId} | ${c.title} | ${c.channelTitle || ''}`)
    .join('\n')

  const system = `You help build intentional YouTube topic maps. Pick up to ${input.take} DISTINCT direction forks from candidates. Each fork needs a short phrase (max 8 words) contrasting directions (deeper / sideways / broader / contrast). Return ONLY JSON: {"forks":[{"videoId":"...","phrase":"..."}]} using only provided videoIds. Prefer diversity over similarity. No duplicates.`

  const user = `Seed topic video: ${input.seedTitle}\nFocus video: ${input.focusTitle}\nCandidates:\n${candidateLines}`

  async function once() {
    const res = await $fetch<{
      choices?: Array<{ message?: { content?: string } }>
      usage?: { prompt_tokens?: number, completion_tokens?: number }
    }>(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      },
    })
    const raw = res.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw) as { forks?: ForkChoice[] }
    const allowed = new Set(input.candidates.map((c) => c.videoId))
    const forks = (parsed.forks || [])
      .filter((f) => f?.videoId && f?.phrase && allowed.has(f.videoId))
      .slice(0, input.take)
    if (!forks.length) throw new Error('AI returned no valid forks')
    return {
      forks,
      model,
      promptTokens: res.usage?.prompt_tokens,
      completionTokens: res.usage?.completion_tokens,
    }
  }

  try {
    return await once()
  }
  catch {
    return await once()
  }
}

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
    throw createError({ statusCode: 404, statusMessage: 'Rabbit Hole not found' })
  }

  const focus = await db.query.nodes.findFirst({
    where: and(eq(nodes.id, opts.nodeId), eq(nodes.rabbitHoleId, opts.rabbitHoleId)),
  })
  if (!focus) {
    throw createError({ statusCode: 404, statusMessage: 'Node not found' })
  }

  const seed = await db.query.nodes.findFirst({
    where: and(eq(nodes.rabbitHoleId, opts.rabbitHoleId), eq(nodes.videoId, hole.seedVideoId)),
  })

  const existing = await db.query.nodes.findMany({
    where: eq(nodes.rabbitHoleId, opts.rabbitHoleId),
  })
  const existingIds = new Set(existing.map((n) => n.videoId))

  let candidates = await getRelatedCandidates(focus.videoId)
  candidates = candidates.filter((c) => !existingIds.has(c.videoId) && c.available)

  if (!candidates.length) {
    await db.insert(expandLedger).values({
      userId: opts.userId,
      rabbitHoleId: opts.rabbitHoleId,
      nodeId: opts.nodeId,
      status: 'failed',
      meta: { reason: 'no_candidates' },
    })
    logError('expand_failed', { reason: 'no_candidates', rabbitHoleId: opts.rabbitHoleId, nodeId: opts.nodeId })
    throw createError({ statusCode: 422, statusMessage: 'No new fork candidates found' })
  }

  let aiResult
  try {
    aiResult = await callAiForForks({
      seedTitle: seed?.title || hole.title,
      focusTitle: focus.title,
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
    logError('expand_failed', {
      reason: 'ai_failed',
      rabbitHoleId: opts.rabbitHoleId,
      nodeId: opts.nodeId,
      message: e instanceof Error ? e.message : 'unknown',
    })
    throw createError({ statusCode: 502, statusMessage: 'Could not generate forks. Try again.' })
  }

  const byId = new Map(candidates.map((c) => [c.videoId, c]))
  const createdNodes: NodeRow[] = []
  const createdEdges: EdgeRow[] = []

  await db.transaction(async (tx) => {
    for (const fork of aiResult.forks) {
      const meta = byId.get(fork.videoId)
      if (!meta) continue
      const [node] = await tx
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
      const toNode
        = node
          || (
            await tx.query.nodes.findFirst({
              where: and(
                eq(nodes.rabbitHoleId, opts.rabbitHoleId),
                eq(nodes.videoId, meta.videoId),
              ),
            })
          )
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
      if (node) createdNodes.push(node)
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
      meta: { take: opts.take, forkCount: createdEdges.length },
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

export async function bootstrapRabbitHole(opts: {
  userId: string
  rabbitHoleId: string
  seedNodeId: string
}) {
  // seed → 3, then each child → 2  (counts toward budget)
  await expandNode({
    userId: opts.userId,
    rabbitHoleId: opts.rabbitHoleId,
    nodeId: opts.seedNodeId,
    take: 3,
  })
  const db = useDb()
  const children = await db
    .select({ id: nodes.id })
    .from(nodes)
    .innerJoin(edges, eq(edges.toNodeId, nodes.id))
    .where(and(eq(edges.fromNodeId, opts.seedNodeId), eq(edges.rabbitHoleId, opts.rabbitHoleId)))

  for (const child of children) {
    await expandNode({
      userId: opts.userId,
      rabbitHoleId: opts.rabbitHoleId,
      nodeId: child.id,
      take: 2,
    })
  }

  await db
    .update(rabbitHoles)
    .set({ status: 'ready', updatedAt: new Date() })
    .where(eq(rabbitHoles.id, opts.rabbitHoleId))
}
