/**
 * Signed-in create → expand → watch with NUXT_TEST_FIXTURES (no live YouTube/AI).
 */
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import postgres from 'postgres'
import { beforeAll, describe, expect, it } from 'vitest'
import type { ExpandPatch, RabbitHoleGraph, WatchResponse } from '../../shared/types/rabbit-holes'
import {
  loadTestEnv,
  requireDatabaseUrl,
  requireSessionPassword,
} from '../helpers/load-test-env'
import { sealNuxtSessionCookie } from '../helpers/seal-session'

const rootDir = fileURLToPath(new URL('../..', import.meta.url))
loadTestEnv(rootDir)

const databaseUrl = requireDatabaseUrl()
const sessionPassword = requireSessionPassword()
const seedUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

await setup({
  rootDir,
  browser: false,
  server: true,
  env: {
    DATABASE_URL: databaseUrl,
    NUXT_DATABASE_URL: databaseUrl,
    NUXT_SESSION_PASSWORD: sessionPassword,
    NUXT_YOUTUBE_API_KEY: 'test',
    NUXT_AI_API_KEY: 'test',
    NUXT_EXPAND_DISABLED: 'false',
    NUXT_TEST_FIXTURES: '1',
  },
})

describe('Rabbit Hole create / expand / watch (fixtures)', () => {
  let sql: ReturnType<typeof postgres>
  let cookie: string
  let userId: string

  beforeAll(async () => {
    sql = postgres(databaseUrl, {
      max: 1,
      ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
        ? false
        : 'prefer',
    })
    const email = `flow+${Date.now()}@alice.local`
    const googleSub = `flow-${randomUUID()}`
    const [user] = await sql`
      insert into users (email, name, google_sub, terms_accepted_at)
      values (${email}, ${'Flow Tester'}, ${googleSub}, now())
      returning id, email, name, image, terms_accepted_at
    `
    if (!user?.id) throw new Error('failed to insert flow test user')
    userId = user.id
    cookie = await sealNuxtSessionCookie(sessionPassword, {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      termsAccepted: Boolean(user.terms_accepted_at),
    })
  })

  it('creates a hole, expands a node, and records a watch path event', async () => {
    const created = await $fetch<RabbitHoleGraph>('/api/rabbit-holes', {
      method: 'POST',
      headers: { cookie },
      body: { url: seedUrl, title: 'Fixture hole' },
    })

    expect(created.rabbitHole.userId).toBe(userId)
    expect(created.rabbitHole.status).toBe('ready')
    expect(created.nodes.length).toBeGreaterThan(1)
    expect(created.edges.length).toBeGreaterThan(0)

    const seedNode = created.nodes.find(n => n.videoId === created.rabbitHole.seedVideoId)
    expect(seedNode).toBeTruthy()

    const frontier = created.nodes.find(n => n.id !== seedNode!.id)
    expect(frontier).toBeTruthy()

    const beforeExpandCount = created.nodes.length
    const patch = await $fetch<ExpandPatch>(
      `/api/rabbit-holes/${created.rabbitHole.id}/nodes/${frontier!.id}/expand`,
      {
        method: 'POST',
        headers: { cookie },
      },
    )
    expect(patch.nodes.length + patch.edges.length).toBeGreaterThan(0)

    const after = await $fetch<RabbitHoleGraph>(`/api/rabbit-holes/${created.rabbitHole.id}`, {
      headers: { cookie },
    })
    expect(after.nodes.length).toBeGreaterThanOrEqual(beforeExpandCount)

    const watched = await $fetch<WatchResponse>(
      `/api/rabbit-holes/${created.rabbitHole.id}/nodes/${frontier!.id}/watch`,
      {
        method: 'POST',
        headers: { cookie },
      },
    )
    expect(watched.videoId).toBe(frontier!.videoId)
    expect(watched.watchUrl).toContain(frontier!.videoId)

    const reopened = await $fetch<RabbitHoleGraph>(`/api/rabbit-holes/${created.rabbitHole.id}`, {
      headers: { cookie },
    })
    expect(reopened.path.some(p => p.nodeId === frontier!.id)).toBe(true)

    const listRes = await fetch('/api/rabbit-holes', { headers: { cookie } })
    expect(listRes.status).toBe(200)
    const listBody = await listRes.json() as { rabbitHoles: { id: string }[] }
    expect(listBody.rabbitHoles.some(h => h.id === created.rabbitHole.id)).toBe(true)
  }, 120_000)
})
