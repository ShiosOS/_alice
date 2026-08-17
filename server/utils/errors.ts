/** Shared HTTP error helpers — keep messages consistent across handlers/services. */

export function badRequest(message: string) {
  return createError({ statusCode: 400, statusMessage: message })
}

export function unauthorized(message = 'Unauthorized') {
  return createError({ statusCode: 401, statusMessage: message })
}

export function forbidden(message: string) {
  return createError({ statusCode: 403, statusMessage: message })
}

export function notFound(message: string) {
  return createError({ statusCode: 404, statusMessage: message })
}

export function methodNotAllowed(message = 'Method not allowed') {
  return createError({ statusCode: 405, statusMessage: message })
}

export function unprocessable(message: string) {
  return createError({ statusCode: 422, statusMessage: message })
}

export function tooManyRequests(message: string) {
  return createError({ statusCode: 429, statusMessage: message })
}

export function badGateway(message: string) {
  return createError({ statusCode: 502, statusMessage: message })
}

export function serviceUnavailable(message: string) {
  return createError({ statusCode: 503, statusMessage: message })
}

export function serverError(message: string) {
  return createError({ statusCode: 500, statusMessage: message })
}

/** Recurring domain messages */
export const ErrorMessage = {
  rabbitHoleNotFound: 'Rabbit Hole not found',
  nodeNotFound: 'Node not found',
  missingId: 'Missing id',
  missingParams: 'Missing params',
  invalidBody: 'Invalid body',
  invalidYoutubeUrl: 'Invalid YouTube URL',
  youtubeUnavailable: 'That YouTube video is unavailable',
  acceptTermsCreate: 'Accept Terms before creating Rabbit Holes',
  acceptTermsFirst: 'Accept Terms first',
  expandDisabled: 'Expand is temporarily disabled',
  expandBudgetExhausted: 'Daily expand budget exhausted. Try again tomorrow.',
  noForkCandidates: 'No new fork candidates found',
  forksFailed: 'Could not generate forks. Try again.',
  youtubeKeyMissing: 'YouTube API key not configured',
  aiKeyMissing: 'AI API key not configured',
} as const
