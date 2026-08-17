import { describe, expect, it } from 'vitest'
import {
  parseYoutubeVideoId,
  youtubeWatchUrl,
  YOUTUBE_VIDEO_ID_RE,
} from '../../server/services/youtube/video-id'

const SAMPLE_ID = 'dQw4w9WgXcQ'

describe('YOUTUBE_VIDEO_ID_RE', () => {
  it('matches an 11-character video id', () => {
    expect(YOUTUBE_VIDEO_ID_RE.test(SAMPLE_ID)).toBe(true)
  })

  it('rejects shorter or longer strings', () => {
    expect(YOUTUBE_VIDEO_ID_RE.test('short')).toBe(false)
    expect(YOUTUBE_VIDEO_ID_RE.test(`${SAMPLE_ID}x`)).toBe(false)
  })
})

describe('parseYoutubeVideoId', () => {
  it('accepts a bare 11-character id', () => {
    expect(parseYoutubeVideoId(SAMPLE_ID)).toBe(SAMPLE_ID)
  })

  it('parses watch URLs', () => {
    expect(parseYoutubeVideoId(`https://www.youtube.com/watch?v=${SAMPLE_ID}`)).toBe(SAMPLE_ID)
    expect(parseYoutubeVideoId(`https://youtube.com/watch?v=${SAMPLE_ID}&t=10`)).toBe(SAMPLE_ID)
  })

  it('parses youtu.be short links', () => {
    expect(parseYoutubeVideoId(`https://youtu.be/${SAMPLE_ID}`)).toBe(SAMPLE_ID)
  })

  it('parses shorts and embed paths', () => {
    expect(parseYoutubeVideoId(`https://www.youtube.com/shorts/${SAMPLE_ID}`)).toBe(SAMPLE_ID)
    expect(parseYoutubeVideoId(`https://www.youtube.com/embed/${SAMPLE_ID}`)).toBe(SAMPLE_ID)
  })

  it('parses music.youtube.com watch URLs', () => {
    expect(parseYoutubeVideoId(`https://music.youtube.com/watch?v=${SAMPLE_ID}`)).toBe(SAMPLE_ID)
  })

  it('strips www before host matching', () => {
    expect(parseYoutubeVideoId(`https://www.youtu.be/${SAMPLE_ID}`)).toBe(SAMPLE_ID)
  })

  it('rejects invalid and empty input', () => {
    expect(parseYoutubeVideoId('')).toBeNull()
    expect(parseYoutubeVideoId('   ')).toBeNull()
    expect(parseYoutubeVideoId('not-a-url')).toBeNull()
    expect(parseYoutubeVideoId('https://example.com/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(parseYoutubeVideoId('https://youtube.com/watch?v=too-short')).toBeNull()
  })
})

describe('youtubeWatchUrl', () => {
  it('builds a canonical watch URL', () => {
    expect(youtubeWatchUrl(SAMPLE_ID)).toBe(`https://www.youtube.com/watch?v=${SAMPLE_ID}`)
  })
})
