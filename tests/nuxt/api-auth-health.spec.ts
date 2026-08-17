/**
 * API integration against a real Nuxt server + Postgres.
 * Live YouTube/AI are avoided; create/expand/watch fixtures live in rabbit-hole-flow.spec.ts.
 */
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import postgres from 'postgres'
import { beforeAll, describe, expect, it } from 'vitest'
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

await setup({
  rootDir,
  browser: false,
  server: true,
  env: {
    DATABASE_URL: databaseUrl,
    NUXT_DATABASE_URL: databaseUrl,
    NUXT_SESSION_PASSWORD: sessionPassword,
    // Dummy keys so runtime config resolves; these suites must not call live APIs.
    NUXT_YOUTUBE_API_KEY: process.env.NUXT_YOUTUBE_API_KEY || 'test',
    NUXT_AI_API_KEY: process.env.NUXT_AI_API_KEY || 'test',
    NUXT_EXPAND_DISABLED: 'true',
  },
})

describe('protected Rabbit Hole API (unauthenticated)', () => {
  it('rejects GET /api/rabbit-holes with 401', async () => {
    const res = await fetch('/api/rabbit-holes')
    expect(res.status).toBe(401)
  })

  it('rejects POST /api/rabbit-holes with 401 and creates nothing', async () => {
    const before = await countRabbitHoles()
    const res = await fetch('/api/rabbit-holes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
    })
    expect(res.status).toBe(401)
    const after = await countRabbitHoles()
    expect(after).toBe(before)
  })
})

describe('terms gate on create', () => {
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
    const email = `nuxt-int+${Date.now()}@alice.local`
    const googleSub = `nuxt-int-${randomUUID()}`
    const [user] = await sql`
      insert into users (email, name, google_sub, terms_accepted_at)
      values (${email}, ${'Integration Tester'}, ${googleSub}, null)
      returning id, email, name, image
    `
    if (!user?.id) {
      throw new Error('failed to insert integration test user')
    }
    userId = user.id
    cookie = await sealNuxtSessionCookie(sessionPassword, {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      termsAccepted: false,
    })
  })

  it('rejects POST /api/rabbit-holes with 403 when terms are not accepted', async () => {
    const before = await countRabbitHolesForUser(userId)
    const res = await fetch('/api/rabbit-holes', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie,
      },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
    })
    expect(res.status).toBe(403)
    const body = await res.json() as { statusMessage?: string }
    expect(body.statusMessage || '').toMatch(/terms/i)
    const after = await countRabbitHolesForUser(userId)
    expect(after).toBe(before)
  })
})

describe('health', () => {
  it('returns 200 with ok when Postgres is reachable', async () => {
    const body = await $fetch<{ ok: boolean }>('/health')
    expect(body).toEqual({ ok: true })
  })
})

async function countRabbitHoles(): Promise<number> {
  const sql = postgres(databaseUrl, {
    max: 1,
    ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
      ? false
      : 'prefer',
  })
  try {
    const [row] = await sql`select count(*)::int as n from rabbit_holes`
    return row?.n ?? 0
  }
  finally {
    await sql.end({ timeout: 1 })
  }
}

async function countRabbitHolesForUser(userId: string): Promise<number> {
  const sql = postgres(databaseUrl, {
    max: 1,
    ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
      ? false
      : 'prefer',
  })
  try {
    const [row] = await sql`
      select count(*)::int as n from rabbit_holes where user_id = ${userId}
    `
    return row?.n ?? 0
  }
  finally {
    await sql.end({ timeout: 1 })
  }
}
