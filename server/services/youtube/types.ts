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
