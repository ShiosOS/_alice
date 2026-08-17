const YT_TTL_MS = 30 * 24 * 60 * 60 * 1000

export type YoutubeVideoMeta = {
  videoId: string
  title: string
  channelTitle: string | null
  thumbUrl: string | null
  available: boolean
}

export type YoutubeCandidate = YoutubeVideoMeta & {
  description?: string
}

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
    }
  }
  return {
    videoId,
    title: item.snippet.title || 'Untitled',
    channelTitle: item.snippet.channelTitle || null,
    thumbUrl:
      item.snippet.thumbnails?.medium?.url
      || item.snippet.thumbnails?.default?.url
      || null,
    available: true,
  }
}

type RelatedCachePayload = {
  candidates: YoutubeCandidate[]
}

export async function getRelatedCandidates(videoId: string): Promise<YoutubeCandidate[]> {
  const { useDb, youtubeCache } = await import('../db')
  const { eq } = await import('drizzle-orm')
  const db = useDb()
  const cached = await db.query.youtubeCache.findFirst({
    where: eq(youtubeCache.videoId, videoId),
  })
  const now = Date.now()
  if (cached && now - cached.fetchedAt.getTime() < YT_TTL_MS) {
    return (cached.relatedPayload as RelatedCachePayload).candidates || []
  }
  if (cached) {
    await db.delete(youtubeCache).where(eq(youtubeCache.videoId, videoId))
  }

  const key = apiKey()
  // search.list relatedToVideoId was deprecated; use search by topic from seed title as fallback
  const meta = await fetchVideoMeta(videoId)
  const q = meta.available ? meta.title : videoId
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
      maxResults: 15,
      q,
      key,
    },
  })

  const candidates: YoutubeCandidate[] = []
  for (const item of data.items || []) {
    const id = item.id?.videoId
    if (!id || id === videoId) continue
    candidates.push({
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

  await db
    .insert(youtubeCache)
    .values({
      videoId,
      relatedPayload: { candidates } satisfies RelatedCachePayload,
      fetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: youtubeCache.videoId,
      set: {
        relatedPayload: { candidates },
        fetchedAt: new Date(),
      },
    })

  return candidates
}
