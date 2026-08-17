import { describe, expect, it } from 'vitest'
import {
  buildTopicSearchQuery,
  descriptionTopicHints,
} from '../../server/lib/youtube-topic'

describe('descriptionTopicHints', () => {
  it('extracts meaningful words and skips stop words / urls', () => {
    const hints = descriptionTopicHints(
      'Switch to encrypted email and storage before AI can see your data. Sign up to Proton... https://example.com/x',
    )
    expect(hints.length).toBeGreaterThan(0)
    expect(hints.some(h => /encrypted|email|storage|proton/i.test(h))).toBe(true)
    expect(hints.every(h => h.toLowerCase() !== 'https')).toBe(true)
  })
})

describe('buildTopicSearchQuery', () => {
  it('includes security tags and channel for a short generic title', () => {
    const query = buildTopicSearchQuery({
      title: 'dude wtf',
      channelTitle: 'Low Level',
      tags: ['hacking', 'cybersecurity', 'computers', 'hackers', 'apple', 'microsoft'],
      description: 'Switch to encrypted email and storage before AI can see your data. Sign up to Proton...',
    })

    expect(/cybersecurity|hacking/i.test(query)).toBe(true)
    expect(/low level/i.test(query)).toBe(true)
  })

  it('falls back to title or video when nothing else is available', () => {
    expect(buildTopicSearchQuery({ title: '' })).toBe('video')
    expect(buildTopicSearchQuery({ title: 'Only Title Here' })).toContain('Only Title Here')
  })
})
