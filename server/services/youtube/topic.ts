import { ErrorMessage, serverError } from '../../utils/errors'

export type TopicContext = {
  /** Short domain label, e.g. "computer security / privacy" */
  domain: string
  /** 1–2 sentence accurate summary of what the video is about */
  summary: string
  /** Concrete themes (not marketing fluff) */
  themes: string[]
  /** Named entities: tools, orgs, people, tech */
  entities: string[]
  /** 2–4 YouTube search queries that stay on-domain */
  searchQueries: string[]
  /** Off-topic traps to avoid (memes, brand-only matches, etc.) */
  avoid: string[]
}

export function formatTopicContext(topic: TopicContext, label: string): string {
  return [
    `${label} domain: ${topic.domain}`,
    `${label} summary: ${topic.summary}`,
    topic.themes.length ? `${label} themes: ${topic.themes.join('; ')}` : null,
    topic.entities.length ? `${label} entities: ${topic.entities.join(', ')}` : null,
    topic.avoid.length ? `${label} avoid: ${topic.avoid.join(', ')}` : null,
  ].filter(Boolean).join('\n')
}

export function fallbackTopicFromMeta(meta: {
  title: string
  channelTitle?: string | null
  description?: string
  tags?: string[]
}): TopicContext {
  const tags = (meta.tags || []).slice(0, 8)
  const desc = (meta.description || '').replace(/\s+/g, ' ').trim().slice(0, 400)
  const channel = meta.channelTitle || ''
  const domain = tags.slice(0, 3).join(' / ')
    || (channel ? `${channel} topics` : 'general YouTube')
  const queries = [
    [meta.title, channel, ...tags.slice(0, 3)].filter(Boolean).join(' '),
    [...tags.slice(0, 4), channel].filter(Boolean).join(' '),
    [domain, ...tags.slice(0, 2)].filter(Boolean).join(' '),
  ].map(q => q.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 3)

  return {
    domain,
    summary: desc || `${meta.title}${channel ? ` by ${channel}` : ''}`,
    themes: tags.slice(0, 6),
    entities: channel ? [channel] : [],
    searchQueries: queries.length ? queries : [meta.title],
    avoid: [],
  }
}

function aiConfig() {
  const config = useRuntimeConfig()
  const apiKey = config.aiApiKey || process.env.NUXT_AI_API_KEY
  const baseUrl = (config.aiBaseUrl || process.env.NUXT_AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = config.aiModel || process.env.NUXT_AI_MODEL || 'gpt-4o-mini'
  if (!apiKey) {
    throw serverError(ErrorMessage.aiKeyMissing)
  }
  return { apiKey, baseUrl, model }
}

/** Deep topic inference from full YouTube metadata (not title alone). */
export async function inferVideoTopic(meta: {
  title: string
  channelTitle?: string | null
  description?: string
  tags?: string[]
  categoryLabel?: string | null
}): Promise<TopicContext> {
  const fallback = fallbackTopicFromMeta(meta)
  try {
    const { apiKey, baseUrl, model } = aiConfig()
    const system = `You extract DEEP, ACCURATE topic context for a YouTube video used to grow a topical rabbit-hole graph.
Titles are often vague, meme-like, or clickbait — do NOT treat the title as the topic.
Use channel niche, tags, and description (including what the video teaches/claims) to infer the real subject.
Return ONLY JSON:
{
  "domain": "short subject-matter label (e.g. computer security / privacy — NOT a website or channel URL)",
  "summary": "1-2 accurate sentences of what this video is about",
  "themes": ["concrete theme", "..."],
  "entities": ["tools/orgs/people/tech mentioned or implied"],
  "searchQueries": ["2-4 YouTube search queries that find ON-TOPIC related videos"],
  "avoid": ["off-topic traps to reject, e.g. pure reaction memes if this is a security explainer"]
}
domain must describe the intellectual topic, never a hostname or brand site alone. searchQueries must be specific enough to stay in-domain. Prefer educational / same-niche results over title-word matches.`

    const user = [
      `Title: ${meta.title}`,
      meta.channelTitle ? `Channel: ${meta.channelTitle}` : null,
      meta.categoryLabel ? `YouTube category: ${meta.categoryLabel}` : null,
      meta.tags?.length ? `Tags: ${meta.tags.join(', ')}` : null,
      `Description:\n${(meta.description || '').slice(0, 3500)}`,
    ].filter(Boolean).join('\n')

    const res = await $fetch<{
      choices?: Array<{ message?: { content?: string } }>
    }>(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NUXT_PUBLIC_APP_URL || 'https://alice.shiosos.dev',
        'X-Title': 'alice-topic',
      },
      body: {
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      },
    })

    const raw = res.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw) as Partial<TopicContext>
    const searchQueries = (parsed.searchQueries || [])
      .map(q => String(q || '').trim())
      .filter(Boolean)
      .slice(0, 4)
    const topic: TopicContext = {
      domain: String(parsed.domain || fallback.domain).slice(0, 120),
      summary: String(parsed.summary || fallback.summary).slice(0, 600),
      themes: (parsed.themes || fallback.themes).map(String).slice(0, 10),
      entities: (parsed.entities || fallback.entities).map(String).slice(0, 12),
      searchQueries: searchQueries.length ? searchQueries : fallback.searchQueries,
      avoid: (parsed.avoid || fallback.avoid).map(String).slice(0, 8),
    }
    return topic
  }
  catch {
    return fallback
  }
}
