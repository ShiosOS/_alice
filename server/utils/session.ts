/**
 * Nitro and nuxt-auth-utils type `H3Event` from different h3 copies.
 * Call sites must use these helpers instead of `as never`.
 */
type SessionEvent = Parameters<typeof requireUserSession>[0]
type SetSessionEvent = Parameters<typeof setUserSession>[0]
type ClearSessionEvent = Parameters<typeof clearUserSession>[0]
type RedirectEvent = Parameters<typeof sendRedirect>[0]

export function requireSession(event: object) {
  return requireUserSession(event as SessionEvent)
}

export function saveSession(event: object, data: Parameters<typeof setUserSession>[1]) {
  return setUserSession(event as SetSessionEvent, data)
}

export function dropSession(event: object) {
  return clearUserSession(event as ClearSessionEvent)
}

export function redirect(event: object, location: string) {
  return sendRedirect(event as RedirectEvent, location)
}
