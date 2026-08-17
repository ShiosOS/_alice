import { z } from 'zod'
import { buildTopicSearchQuery } from '../lib/youtube-topic'
import {
  fallbackTopicFromMeta,
  inferVideoTopic,
  type TopicContext,
} from './topic-context'

const YT_TTL_MS = 30 * 24 * 60 * 60 * 1000
/** Bump when candidate / topic strategy changes so stale cache is ignored. */
const CANDIDATE_STRATEGY = 'topic-v3'

const YT_CATEGORIES: Record<string, string> = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '29': 'Nonprofits & Activism',
}

export type YoutubeVideoMeta = {
  videoId: string
  title: string
  channelTitle: string | null
  thumbUrl: string | null
  available: boolean
  description?: string
  tags?: string[]
  categoryId?: string | null
  categoryLabel?: string | null
}

export type YoutubeCandidate = YoutubeVideoMeta & {
  description?: string
}

const topicContextSchema = z.object({
  domain: z.string(),
  summary: z.string(),
  themes: z.array(z.string()),
  entities: z.array(z.string()),
  searchQueries: z.array(z.string()),
  avoid: z.array(z.string()),
})

const youtubeCandidateSchema = z.object({
  videoId: z.string().min(1),
  title: z.string(),
  channelTitle: z.string().nullable(),
  thumbUrl: z.string().nullable(),
  available: z.boolean(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().nullable().optional(),
  categoryLabel: z.string().nullable().optional(),
})

const relatedCachePayloadSchema = z.object({
  strategy: z.string().optional(),
  topic: topicContextSchema.optional(),
  candidates: z.array(youtubeCandidateSchema),
})

export { buildTopicSearchQuery, descriptionTopicHints } from '../lib/youtube-topic'

export function parseYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        const v = url.searchParams.get('v')
        return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null
      }
      const parts = url.pathname.split('/').filter(Boolean)
      if ((parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') && parts[1]) {
        return /^[a-zA-Z0-9_-]{11}$/.test(parts[1]) ? parts[1] : null
      }
    }
  }
  catch {
    return null
  }
  return null
}

export function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`
}

function apiKey() {
  const config = useRuntimeConfig()
  const key = config.youtubeApiKey || process.env.NUXT_YOUTUBE_API_KEY
  if (!key) throw createError({ statusCode: 500, statusMessage: 'YouTube API key not configured' })
  return key
}

export async function fetchVideoMeta(videoId: string): Promise<YoutubeVideoMeta> {
  const key = apiKey()
  const data = await $fetch<{
    items?: Array<{
      id: string
      snippet?: {
        title?: string
        channelTitle?: string
        description?: string
        tags?: string[]
        categoryId?: string
        thumbnails?: { medium?: { url?: string }, default?: { url?: string } }
      }
    }>
  }>('https://www.googleapis.com/youtube/v3/videos', {
    query: {
      part: 'snippet',
      id: videoId,
      key,
    },
  })
  const item = data.items?.[0]
  if (!item?.snippet) {
    return {
      videoId,
      title: 'Unavailable video',
      channelTitle: null,
      thumbUrl: null,
      available: false,
      description: '',
      tags: [],
      categoryId: null,
      categoryLabel: null,
    }
  }
  const categoryId = item.snippet.categoryId || null
  return {
    videoId,
    title: item.snippet.title || 'Untitled',
    channelTitle: item.snippet.channelTitle || null,
    thumbUrl:
      item.snippet.thumbnails?.medium?.url
      || item.snippet.thumbnails?.default?.url
      || null,
    available: true,
    description: item.snippet.description || '',
    tags: item.snippet.tags || [],
    categoryId,
    categoryLabel: categoryId ? (YT_CATEGORIES[categoryId] || null) : null,
  }
}

type RelatedCachePayload = z.infer<typeof relatedCachePayloadSchema>

async function readCache(videoId: string) {
  const { useDb, youtubeCache } = await import('../db')
  const { eq } = await import('drizzle-orm')
  const db = useDb()
  const cached = await db.query.youtubeCache.findFirst({
    where: eq(youtubeCache.videoId, videoId),
  })
  if (!cached) return null
  if (Date.now() - cached.fetchedAt.getTime() >= YT_TTL_MS) {
    await db.delete(youtubeCache).where(eq(youtubeCache.videoId, videoId))
    return null
  }
  const parsed = relatedCachePayloadSchema.safeParse(cached.relatedPayload)
  if (!parsed.success || parsed.data.strategy !== CANDIDATE_STRATEGY) {
    await db.delete(youtubeCache).where(eq(youtubeCache.videoId, videoId))
    return null
  }
  return parsed.data
}

async function writeCache(videoId: string, payload: RelatedCachePayload) {
  const { useDb, youtubeCache } = await import('../db')
  const db = useDb()
  await db
    .insert(youtubeCache)
    .values({
      videoId,
      relatedPayload: payload,
      fetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: youtubeCache.videoId,
      set: {
        relatedPayload: payload,
        fetchedAt: new Date(),
      },
    })
}

async function searchVideos(q: string, excludeId: string, maxResults = 10): Promise<YoutubeCandidate[]> {
  const key = apiKey()
  const data = await $fetch<{
    items?: Array<{
      id?: { videoId?: string }
      snippet?: {
        title?: string
        channelTitle?: string
        description?: string
        thumbnails?: { medium?: { url?: string }, default?: { url?: string } }
      }
    }>
  }>('https://www.googleapis.com/youtube/v3/search', {
    query: {
      part: 'snippet',
      type: 'video',
      maxResults,
      q,
      key,
    },
  })
  const out: YoutubeCandidate[] = []
  for (const item of data.items || []) {
    const id = item.id?.videoId
    if (!id || id === excludeId) continue
    out.push({
      videoId: id,
      title: item.snippet?.title || 'Untitled',
      channelTitle: item.snippet?.channelTitle || null,
      thumbUrl:
        item.snippet?.thumbnails?.medium?.url
        || item.snippet?.thumbnails?.default?.url
        || null,
      description: item.snippet?.description,
      available: true,
    })
  }
  return out
}

/** Enrich candidates with full snippets (tags/description) via videos.list batch. */
async function enrichCandidates(candidates: YoutubeCandidate[]): Promise<YoutubeCandidate[]> {
  if (!candidates.length) return candidates
  const key = apiKey()
  const ids = candidates.map((c) => c.videoId).slice(0, 20)
  const data = await $fetch<{
    items?: Array<{
      id: string
      snippet?: {
        title?: string
        channelTitle?: string
        description?: string
        tags?: string[]
        categoryId?: string
        thumbnails?: { medium?: { url?: string }, default?: { url?: string } }
      }
    }>
  }>('https://www.googleapis.com/youtube/v3/videos', {
    query: {
      part: 'snippet',
      id: ids.join(','),
      key,
    },
  })
  const byId = new Map((data.items || []).map((item) => [item.id, item]))
  return candidates.map((c) => {
    const item = byId.get(c.videoId)
    if (!item?.snippet) return c
    const categoryId = item.snippet.categoryId || null
    return {
      ...c,
      title: item.snippet.title || c.title,
      channelTitle: item.snippet.channelTitle || c.channelTitle,
      description: item.snippet.description || c.description,
      tags: item.snippet.tags || [],
      categoryId,
      categoryLabel: categoryId ? (YT_CATEGORIES[categoryId] || null) : null,
      thumbUrl:
        item.snippet.thumbnails?.medium?.url
        || item.snippet.thumbnails?.default?.url
        || c.thumbUrl,
      available: true,
    }
  })
}

function mergeQueries(focus: TopicContext, seed?: TopicContext | null): string[] {
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
    if (out.length >= 4) break
  }
  return out
}

/** Infer + cache deep topic for a video. */
export async function getVideoTopic(videoId: string): Promise<{ meta: YoutubeVideoMeta, topic: TopicContext }> {
  const cached = await readCache(videoId)
  const meta = await fetchVideoMeta(videoId)
  if (!meta.available) {
    return { meta, topic: fallbackTopicFromMeta(meta) }
  }
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

  const cached = await readCache(videoId)
  if (!opts?.bypassCandidateCache && !opts?.seedTopic && cached?.candidates?.length) {
    return { topic: cached.topic || focusTopic, meta, candidates: cached.candidates }
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
  let candidates = [...byId.values()].slice(0, 24)
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
