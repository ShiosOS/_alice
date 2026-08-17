/**
 * Require auth for Rabbit Hole / Expand / account mutation APIs.
 * Public: privacy/terms pages, auth routes, session endpoint.
 */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const protectedPrefixes = [
    '/api/rabbit-holes',
    '/api/auth/account',
    '/api/auth/accept-terms',
  ]
  const needsAuth = protectedPrefixes.some(
    (p) => path === p || path.startsWith(`${p}/`),
  )
  if (!needsAuth) return
  await requireUserSession(event as never)
})
