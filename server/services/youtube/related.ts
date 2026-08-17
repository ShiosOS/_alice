import { buildTopicSearchQuery } from '../../lib/youtube-topic'
import { useTestFixtures } from '../test-fixtures'
import {
  enrichCandidates,
  fetchVideoMeta,
  readCache,
  searchVideos,
  writeCache,
  CANDIDATE_STRATEGY,
} from './api'
import {
  fallbackTopicFromMeta,
  inferVideoTopic,
  type TopicContext,
} from './topic'
import type { YoutubeCandidate, YoutubeVideoMeta } from './types'

export { buildTopicSearchQuery, descriptionTopicHints } from '../../lib/youtube-topic'
export type { YoutubeCandidate, YoutubeVideoMeta } from './types'

/** Max distinct search queries when merging focus + seed topic. */
const MAX_MERGED_QUERIES = 4

/** Cap stored / returned related candidates per pack. */
const MAX_RELATED_CANDIDATES = 24

export function mergeQueries(focus: TopicContext, seed?: TopicContext | null): string[] {
  const qs = [...focus.searchQueries]
  if (seed?.domain) {
    const theme = focus.themes[0] || focus.entities[0] || ''
    qs.push([seed.domain, theme].filter(Boolean).join(' '))
    if (focus.entities[0]) qs.push(`${seed.domain} ${focus.entities[0]}`)
  }
  const seen = new Set<string>()
  const out: string[] = []
  for (const q of qs) {
    const norm = q.replace(/\s+/g, ' ').trim().toLowerCase()
    if (!norm || seen.has(norm)) continue
    seen.add(norm)
    out.push(q.replace(/\s+/g, ' ').trim().slice(0, 100))
    if (out.length >= MAX_MERGED_QUERIES) break
  }
  return out
}

/** Infer + cache deep topic for a video. */
export async function getVideoTopic(
  videoId: string,
): Promise<{ meta: YoutubeVideoMeta, topic: TopicContext }> {
  const meta = await fetchVideoMeta(videoId)
  if (!meta.available) {
    return { meta, topic: fallbackTopicFromMeta(meta) }
  }

  if (useTestFixtures()) {
    return { meta, topic: fallbackTopicFromMeta(meta) }
  }

  const cached = await readCache(videoId)
  if (cached?.topic) {
    return { meta, topic: cached.topic }
  }
  const topic = await inferVideoTopic({
    title: meta.title,
    channelTitle: meta.channelTitle,
    description: meta.description,
    tags: meta.tags,
    categoryLabel: meta.categoryLabel,
  })
  await writeCache(videoId, {
    strategy: CANDIDATE_STRATEGY,
    topic,
    candidates: cached?.candidates || [],
  })
  return { meta, topic }
}

/**
 * Deep related candidates: AI topic → multi-query YouTube search → enrich snippets.
 * Optional seedTopic keeps the rabbit hole's throughline when expanding children.
 */
export async function getRelatedCandidates(
  videoId: string,
  opts?: { seedTopic?: TopicContext | null, bypassCandidateCache?: boolean },
): Promise<{ topic: TopicContext, meta: YoutubeVideoMeta, candidates: YoutubeCandidate[] }> {
  const { meta, topic: focusTopic } = await getVideoTopic(videoId)
  if (!meta.available) {
    return { topic: focusTopic, meta, candidates: [] }
  }

  if (useTestFixtures()) {
    const candidates: YoutubeCandidate[] = []
    for (let i = 1; i <= 8; i++) {
      const raw = `f${i}${videoId}xxxxxxxxxxx`
      const id = raw.replace(/[^\w-]/g, 'x').slice(0, 11)
      candidates.push({
        videoId: id,
        title: `Fixture fork ${i} from ${videoId}`,
        channelTitle: 'Fixture Channel',
        thumbUrl: null,
        available: true,
        description: `Fixture candidate ${i}`,
        tags: ['fixture'],
      })
    }
    return { topic: focusTopic, meta, candidates }
  }

  const cached = await readCache(videoId)
  const hasCachedCandidates = Boolean(cached?.candidates?.length)
  const seedAwareSearch = Boolean(opts?.seedTopic)
  const forceFreshCandidates = Boolean(opts?.bypassCandidateCache)
  const canReuseCachedCandidates
    = !forceFreshCandidates
      && !seedAwareSearch
      && hasCachedCandidates

  if (canReuseCachedCandidates && cached?.candidates) {
    return {
      topic: cached.topic || focusTopic,
      meta,
      candidates: cached.candidates,
    }
  }

  let queries = mergeQueries(focusTopic, opts?.seedTopic)
  if (!queries.length) {
    queries = [buildTopicSearchQuery(meta)]
  }

  const byId = new Map<string, YoutubeCandidate>()
  for (const q of queries) {
    const batch = await searchVideos(q, videoId, 10)
    for (const c of batch) {
      if (!byId.has(c.videoId)) byId.set(c.videoId, c)
    }
  }
  let candidates = [...byId.values()].slice(0, MAX_RELATED_CANDIDATES)
  candidates = await enrichCandidates(candidates)

  // Persist focus-only packs (seed-aware packs vary by hole).
  if (!opts?.seedTopic) {
    await writeCache(videoId, {
      strategy: CANDIDATE_STRATEGY,
      topic: focusTopic,
      candidates,
    })
  }

  return { topic: focusTopic, meta, candidates }
}
