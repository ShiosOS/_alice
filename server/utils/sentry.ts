import * as Sentry from '@sentry/node'
import { logError } from './log'

let initialized = false

export function initSentry() {
  if (initialized) return
  const dsn = process.env.NUXT_SENTRY_DSN || process.env.SENTRY_DSN
  if (!dsn) return
  Sentry.init({
    dsn,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV || 'development',
    tracesSampleRate: 0,
  })
  initialized = true
}

export function captureServerException(
  error: unknown,
  context: Record<string, unknown> = {},
) {
  initSentry()
  const message = error instanceof Error ? error.message : String(error)
  logError('server_exception', { message, ...context })
  if (!initialized) return
  Sentry.withScope((scope) => {
    for (const [k, v] of Object.entries(context)) {
      scope.setExtra(k, v)
    }
    Sentry.captureException(error instanceof Error ? error : new Error(message))
  })
}
