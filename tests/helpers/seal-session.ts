import { randomUUID, webcrypto } from 'node:crypto'
import { seal, defaults as ironDefaults } from 'iron-webcrypto'

export type SmokeSessionUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  termsAccepted: boolean
}

/** Seal a nuxt-auth-utils session cookie (same pattern as scripts/e2e-smoke.mjs). */
export async function sealNuxtSessionCookie(
  password: string,
  user: SmokeSessionUser,
): Promise<string> {
  const sessionObj = {
    id: randomUUID(),
    createdAt: Date.now(),
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        termsAccepted: user.termsAccepted,
      },
      loggedInAt: new Date().toISOString(),
    },
  }
  const sealed = await seal(webcrypto, sessionObj, password, {
    ...ironDefaults,
    ttl: 60 * 60 * 24 * 1000,
  })
  return `nuxt-session=${encodeURIComponent(sealed)}`
}
