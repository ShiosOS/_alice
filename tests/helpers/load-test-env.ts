import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Load repo `.env` into `process.env` without overwriting existing vars.
 * Fails loudly when a database URL is missing so integration suites never false-green.
 */
export function loadTestEnv(rootDir: string) {
  const envPath = resolve(rootDir, '.env')
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath)
  }
}

export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL / NUXT_DATABASE_URL is required for Nuxt integration tests. '
      + 'Copy .env.example, set a Postgres URL, and run `npm run db:migrate`.',
    )
  }
  return url
}

export function requireSessionPassword(): string {
  const password = process.env.NUXT_SESSION_PASSWORD
  if (!password || password.length < 32) {
    throw new Error(
      'NUXT_SESSION_PASSWORD (≥32 chars) is required for session-sealed integration tests.',
    )
  }
  return password
}
