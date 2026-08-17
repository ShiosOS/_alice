export default defineNitroPlugin((nitroApp) => {
  const dsn = process.env.NUXT_SENTRY_DSN || process.env.SENTRY_DSN
  if (!dsn) return

  nitroApp.hooks.hook('error', (error, context) => {
    const path = context?.event ? String(context.event.path || '') : undefined
    logError('server_error', {
      message: error instanceof Error ? error.message : String(error),
      path,
      sentryDsnConfigured: true,
    })
  })
})
