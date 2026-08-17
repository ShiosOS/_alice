/**
 * YouTube video ids are always 11 characters from [A-Za-z0-9_-].
 * `\w` in JS includes underscore, so `[\w-]` matches that alphabet.
 */
export const YOUTUBE_VIDEO_ID_RE = /^[\w-]{11}$/

/** Strip a leading `www.` before host comparisons. */
const WWW_PREFIX_RE = /^www\./

export function parseYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (YOUTUBE_VIDEO_ID_RE.test(trimmed)) return trimmed
  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(WWW_PREFIX_RE, '')
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id && YOUTUBE_VIDEO_ID_RE.test(id) ? id : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        const v = url.searchParams.get('v')
        return v && YOUTUBE_VIDEO_ID_RE.test(v) ? v : null
      }
      const parts = url.pathname.split('/').filter(Boolean)
      const kind = parts[0]
      const id = parts[1]
      if ((kind === 'embed' || kind === 'shorts' || kind === 'live') && id) {
        return YOUTUBE_VIDEO_ID_RE.test(id) ? id : null
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
