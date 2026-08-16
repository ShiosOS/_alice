export default defineNitroPlugin((nitroApp) => {
  const dsn = process.env.NUXT_SENTRY_DSN || process.env.SENTRY_DSN
  if (!dsn) return

  nitroApp.hooks.hook('error', (error, { event }) => {
    logError('server_error', {
      message: error instanceof Error ? error.message : String(error),
      path: event ? getRequestURL(event).pathname : undefined,
      // Wire a real Sentry SDK when NUXT_SENTRY_DSN is set in a follow-up;
      // structured logs still capture Expand/bootstrap failures today.
      sentryDsnConfigured: true,
    })
  })
})
