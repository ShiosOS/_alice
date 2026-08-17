import { z } from 'zod'
import { ErrorMessage, serverError } from '../../utils/errors'
import { formatTopicContext, type TopicContext } from '../youtube/topic'
import type { YoutubeCandidate, YoutubeVideoMeta } from '../youtube/types'

export type ForkChoice = { videoId: string, phrase: string }

const forkChoiceSchema = z.object({
  videoId: z.string().min(1),
  phrase: z.string().min(1),
})
const aiForksSchema = z.object({
  forks: z.array(forkChoiceSchema),
})

function metaBrief(
  meta: Pick<YoutubeVideoMeta, 'title' | 'channelTitle' | 'description' | 'tags' | 'categoryLabel'>,
  label: string,
) {
  const tags = (meta.tags || []).slice(0, 8).join(', ')
  const desc = (meta.description || '').replace(/\s+/g, ' ').trim().slice(0, 500)
  return [
    `${label} title: ${meta.title}`,
    meta.channelTitle ? `${label} channel: ${meta.channelTitle}` : null,
    meta.categoryLabel ? `${label} category: ${meta.categoryLabel}` : null,
    tags ? `${label} tags: ${tags}` : null,
    desc ? `${label} description: ${desc}` : null,
  ].filter(Boolean).join('\n')
}

/** One numbered candidate line for the AI prompt (id, title, channel, tags, blurb). */
function formatCandidateLine(candidate: YoutubeCandidate, index: number): string {
  const tags = (candidate.tags || []).slice(0, 5).join(', ')
  const blurb = (candidate.description || '').replace(/\s+/g, ' ').trim().slice(0, 160)
  return [
    `${index + 1}. ${candidate.videoId}`,
    `title=${candidate.title}`,
    `channel=${candidate.channelTitle || ''}`,
    tags ? `tags=${tags}` : null,
    blurb ? `desc=${blurb}` : null,
  ].filter(Boolean).join(' | ')
}

export async function callAiForForks(input: {
  seedMeta: YoutubeVideoMeta
  focusMeta: YoutubeVideoMeta
  seedTopic: TopicContext
  focusTopic: TopicContext
  candidates: YoutubeCandidate[]
  take: number
}): Promise<{ forks: ForkChoice[], model: string, promptTokens?: number, completionTokens?: number }> {
  const config = useRuntimeConfig()
  const apiKey = config.aiApiKey || process.env.NUXT_AI_API_KEY
  const baseUrl = (config.aiBaseUrl || process.env.NUXT_AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = config.aiModel || process.env.NUXT_AI_MODEL || 'gpt-4o-mini'
  if (!apiKey) {
    throw serverError(ErrorMessage.aiKeyMissing)
  }

  const candidateLines = input.candidates
    .slice(0, 18)
    .map((c, i) => formatCandidateLine(c, i))
    .join('\n')

  const system = `You grow a topical YouTube rabbit-hole graph with DEEP accuracy.
The rabbit hole's throughline is the SEED topic. The FOCUS is the current node.
Titles are often clickbait — trust domain/summary/themes/entities over titles.
Pick up to ${input.take} DISTINCT candidate videoIds that:
1) stay inside the seed domain (or a meaningful in-domain contrast), and
2) make a clear directional move from the focus (deeper / sideways / broader / contrast).
Reject candidates that match only meme titles, brand names, or avoid-list traps.
Each fork needs a short phrase (max 8 words) naming the direction accurately.
Return ONLY JSON: {"forks":[{"videoId":"...","phrase":"..."}]} using only provided videoIds. No duplicates.`

  const user = [
    formatTopicContext(input.seedTopic, 'SEED'),
    metaBrief(input.seedMeta, 'SEED_META'),
    formatTopicContext(input.focusTopic, 'FOCUS'),
    metaBrief(input.focusMeta, 'FOCUS_META'),
    'Candidates:',
    candidateLines,
  ].join('\n')

  async function once() {
    const res = await $fetch<{
      choices?: Array<{ message?: { content?: string } }>
      usage?: { prompt_tokens?: number, completion_tokens?: number }
    }>(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
    let json: unknown
    try {
      json = JSON.parse(raw)
    }
    catch {
      throw new Error('AI returned no valid forks')
    }
    const parsed = aiForksSchema.safeParse(json)
    if (!parsed.success) throw new Error('AI returned no valid forks')
    const allowed = new Set(input.candidates.map(c => c.videoId))
    const forks = parsed.data.forks
      .filter(f => allowed.has(f.videoId))
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
