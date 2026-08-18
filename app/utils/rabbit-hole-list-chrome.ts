/** Header “Start a new Rabbit Hole” only when the library has holes to browse. */
export function showRabbitHoleListHeaderCta(input: {
  pending: boolean
  error: string
  holeCount: number
}): boolean {
  return !input.pending && !input.error && input.holeCount > 0
}
