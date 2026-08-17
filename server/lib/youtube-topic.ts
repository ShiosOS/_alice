/** Pure topic helpers (no Nuxt runtime) for YouTube candidate search. */

export function descriptionTopicHints(description: string, limit = 6): string[] {
  const stop = new Set([
    'https', 'http', 'www', 'com', 'the', 'and', 'for', 'with', 'from', 'this', 'that',
    'your', 'you', 'are', 'was', 'have', 'will', 'sign', 'free', 'today', 'like', 'grab',
  ])
  const text = description
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/[^\p{L}\p{N}\s#-]/gu, ' ')
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of text.split(/\s+/)) {
    const w = raw.replace(/^#+/, '').trim()
    if (w.length < 4) continue
    const key = w.toLowerCase()
    if (stop.has(key) || seen.has(key)) continue
    seen.add(key)
    out.push(w)
    if (out.length >= limit) break
  }
  return out
}

export function buildTopicSearchQuery(meta: {
  title: string
  channelTitle?: string | null
  description?: string
  tags?: string[]
}): string {
  const title = (meta.title || '').trim()
  const tags = (meta.tags || []).slice(0, 6)
  const hints = descriptionTopicHints(meta.description || '', 5)
  const channel = (meta.channelTitle || '').trim()
  const titleTokens = title.split(/\s+/).filter(Boolean)
  const titleGeneric = titleTokens.length <= 3

  const parts: string[] = []
  if (title) parts.push(title)
  if (titleGeneric && channel) parts.push(channel)
  for (const t of tags) {
    if (t && !parts.some((p) => p.toLowerCase().includes(t.toLowerCase()))) parts.push(t)
  }
  if (titleGeneric || tags.length === 0) {
    for (const h of hints) {
      if (!parts.some((p) => p.toLowerCase().includes(h.toLowerCase()))) parts.push(h)
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 100) || title || 'video'
}
