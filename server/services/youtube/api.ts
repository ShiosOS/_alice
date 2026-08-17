import { z } from 'zod'
import { ErrorMessage, serverError } from '../../utils/errors'
import { useTestFixtures } from '../test-fixtures'
import type { YoutubeCandidate, YoutubeVideoMeta } from './types'

export type { YoutubeCandidate, YoutubeVideoMeta } from './types'

/** Cache TTL for related/topic payloads (30 days). */
export const YT_TTL_MS = 30 * 24 * 60 * 60 * 1000

/** Bump when candidate / topic strategy changes so stale cache is ignored. */
export const CANDIDATE_STRATEGY = 'topic-v3'

export const YT_CATEGORIES: Record<string, string> = {
  1: 'Film & Animation',
  2: 'Autos & Vehicles',
  10: 'Music',
  15: 'Pets & Animals',
  17: 'Sports',
  19: 'Travel & Events',
  20: 'Gaming',
  22: 'People & Blogs',
  23: 'Comedy',
  24: 'Entertainment',
  25: 'News & Politics',
  26: 'Howto & Style',
  27: 'Education',
  28: 'Science & Technology',
  29: 'Nonprofits & Activism',
}

export const topicContextSchema = z.object({
  domain: z.string(),
  summary: z.string(),
  themes: z.array(z.string()),
  entities: z.array(z.string()),
  searchQueries: z.array(z.string()),
  avoid: z.array(z.string()),
})

export const youtubeCandidateSchema = z.object({
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

export const relatedCachePayloadSchema = z.object({
  strategy: z.string().optional(),
  topic: topicContextSchema.optional(),
  candidates: z.array(youtubeCandidateSchema),
})

export type RelatedCachePayload = z.infer<typeof relatedCachePayloadSchema>

function youtubeApiKey() {
  const config = useRuntimeConfig()
  const key = config.youtubeApiKey || process.env.NUXT_YOUTUBE_API_KEY
  if (!key) throw serverError(ErrorMessage.youtubeKeyMissing)
  return key
}

export async function fetchVideoMeta(videoId: string): Promise<YoutubeVideoMeta> {
  if (useTestFixtures()) {
    return {
      videoId,
      title: `Fixture video ${videoId}`,
      channelTitle: 'Fixture Channel',
      thumbUrl: null,
      available: true,
      description: 'Deterministic fixture description for integration tests.',
      tags: ['fixture', 'security', 'testing'],
      categoryId: '28',
      categoryLabel: YT_CATEGORIES['28'] || null,
    }
  }

  const key = youtubeApiKey()
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

export async function readCache(videoId: string): Promise<RelatedCachePayload | null> {
  const { useDb, youtubeCache } = await import('../../db')
  const { eq } = await import('drizzle-orm')
  const db = useDb()
  const cached = await db.query.youtubeCache.findFirst({
    where: eq(youtubeCache.videoId, videoId),
  })
  if (!cached) return null

  const cacheExpired = Date.now() - cached.fetchedAt.getTime() >= YT_TTL_MS
  if (cacheExpired) {
    await db.delete(youtubeCache).where(eq(youtubeCache.videoId, videoId))
    return null
  }

  const parsed = relatedCachePayloadSchema.safeParse(cached.relatedPayload)
  const strategyMismatch = !parsed.success || parsed.data.strategy !== CANDIDATE_STRATEGY
  if (strategyMismatch) {
    await db.delete(youtubeCache).where(eq(youtubeCache.videoId, videoId))
    return null
  }
  return parsed.data
}

export async function writeCache(videoId: string, payload: RelatedCachePayload) {
  const { useDb, youtubeCache } = await import('../../db')
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

export async function searchVideos(
  q: string,
  excludeId: string,
  maxResults = 10,
): Promise<YoutubeCandidate[]> {
  const key = youtubeApiKey()
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
export async function enrichCandidates(candidates: YoutubeCandidate[]): Promise<YoutubeCandidate[]> {
  if (!candidates.length) return candidates
  const key = youtubeApiKey()
  const ids = candidates.map(c => c.videoId).slice(0, 20)
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
  const byId = new Map((data.items || []).map(item => [item.id, item]))
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
