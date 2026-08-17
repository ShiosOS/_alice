/**
 * Thin PR-CI e2e: public HTML surfaces + health via $fetch (no Playwright browser).
 * Signed-in create/expand against live YouTube/AI stays in scripts/e2e-smoke.mjs (promote gate).
 */
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import {
  loadTestEnv,
  requireDatabaseUrl,
  requireSessionPassword,
} from '../helpers/load-test-env'

const rootDir = fileURLToPath(new URL('../..', import.meta.url))
loadTestEnv(rootDir)

const databaseUrl = requireDatabaseUrl()
const sessionPassword = requireSessionPassword()

await setup({
  rootDir,
  browser: false,
  server: true,
  env: {
    DATABASE_URL: databaseUrl,
    NUXT_DATABASE_URL: databaseUrl,
    NUXT_SESSION_PASSWORD: sessionPassword,
    NUXT_YOUTUBE_API_KEY: process.env.NUXT_YOUTUBE_API_KEY || 'test',
    NUXT_AI_API_KEY: process.env.NUXT_AI_API_KEY || 'test',
  },
})

describe('public surfaces', () => {
  it('serves /privacy with Privacy content', async () => {
    const html = await $fetch<string>('/privacy')
    expect(html).toContain('Privacy')
  })

  it('serves /terms with Terms content', async () => {
    const html = await $fetch<string>('/terms')
    expect(html).toContain('Terms')
  })

  it('serves /about with About content', async () => {
    const html = await $fetch<string>('/about')
    expect(html).toContain('About')
  })

  it('returns healthy /health', async () => {
    const body = await $fetch<{ ok: boolean }>('/health')
    expect(body).toEqual({ ok: true })
  })
})
