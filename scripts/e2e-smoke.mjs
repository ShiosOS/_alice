#!/usr/bin/env node
/**
 * Staging API smoke for alice (promote gate).
 * Creates a sealed nuxt-session for a DB user and walks:
 * list → create hole → graph size → expand → watch → list/get again.
 *
 * Requires env:
 *   DATABASE_URL (staging TCP proxy — not production)
 *   NUXT_SESSION_PASSWORD (staging)
 *   SMOKE_BASE_URL (default https://alice-staging.shiosos.dev)
 *   SMOKE_YOUTUBE_URL (default security video)
 */
import { randomUUID, webcrypto } from 'node:crypto'
import postgres from 'postgres'
import { seal, defaults as ironDefaults } from 'iron-webcrypto'

const base = (process.env.SMOKE_BASE_URL || 'https://alice-staging.shiosos.dev').replace(/\/$/, '')
const password = process.env.NUXT_SESSION_PASSWORD
const dbUrl = process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL
const youtubeUrl = process.env.SMOKE_YOUTUBE_URL || 'https://www.youtube.com/watch?v=rHwNz_HEVNw'

if (!password || password.length < 32) {
  console.error('NUXT_SESSION_PASSWORD missing or too short')
  process.exit(1)
}
if (!dbUrl) {
  console.error('DATABASE_URL missing')
  process.exit(1)
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const sql = postgres(dbUrl, { max: 1, ssl: dbUrl.includes('localhost') ? false : 'require' })

const email = `smoke+${Date.now()}@alice.local`
const googleSub = `smoke-${randomUUID()}`

try {
  console.log('1) upsert smoke user')
  const [user] = await sql`
    insert into users (email, name, google_sub, terms_accepted_at)
    values (${email}, ${'Smoke Tester'}, ${googleSub}, now())
    on conflict (email) do update set terms_accepted_at = now(), updated_at = now()
    returning id, email, name, image, terms_accepted_at
  `
  assert(user?.id, 'user create failed')

  const sessionObj = {
    id: randomUUID(),
    createdAt: Date.now(),
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        termsAccepted: Boolean(user.terms_accepted_at),
      },
      loggedInAt: new Date().toISOString(),
    },
  }
  const sealed = await seal(webcrypto, sessionObj, password, {
    ...ironDefaults,
    ttl: 60 * 60 * 24 * 1000,
  })
  const cookie = `nuxt-session=${encodeURIComponent(sealed)}`

  async function api(path, opts = {}) {
    const res = await fetch(`${base}${path}`, {
      ...opts,
      headers: {
        cookie,
        'content-type': 'application/json',
        ...(opts.headers || {}),
      },
    })
    const text = await res.text()
    let body
    try { body = JSON.parse(text) }
    catch { body = text }
    return { status: res.status, body }
  }

  console.log('2) GET /api/rabbit-holes')
  const list1 = await api('/api/rabbit-holes')
  assert(list1.status === 200, `list failed: ${list1.status} ${JSON.stringify(list1.body)}`)

  console.log('3) POST /api/rabbit-holes (bootstrap)')
  const created = await api('/api/rabbit-holes', {
    method: 'POST',
    body: JSON.stringify({ url: youtubeUrl }),
  })
  assert(created.status === 200, `create failed: ${created.status} ${JSON.stringify(created.body)}`)
  const holeId = created.body?.rabbitHole?.id
  const nodes = created.body?.nodes || []
  const edges = created.body?.edges || []
  console.log('   nodes', nodes.length, 'edges', edges.length, 'status', created.body?.rabbitHole?.status)
  assert(holeId, 'missing hole id')
  assert(created.body?.rabbitHole?.status === 'ready', `hole not ready: ${created.body?.rabbitHole?.status}`)
  assert(nodes.length >= 4, `bootstrap too small: ${nodes.length}`)
  if (nodes.length < 8) {
    console.warn(`   note: bootstrap returned ${nodes.length} nodes (target ~10); continuing with Expand`)
  }
  assert(edges.length >= 3, `expected fork edges, got ${edges.length}`)

  // Prefer a non-seed frontier node for expand
  const seedVideoId = created.body.rabbitHole.seedVideoId
  let expandTarget = nodes.find((n) => n.videoId !== seedVideoId) || nodes[0]
  assert(expandTarget, 'no expand target')

  console.log('4) POST expand on', expandTarget.id)
  const expanded = await api(`/api/rabbit-holes/${holeId}/nodes/${expandTarget.id}/expand`, {
    method: 'POST',
  })
  assert(expanded.status === 200, `expand failed: ${expanded.status} ${JSON.stringify(expanded.body)}`)
  const newNodes = expanded.body?.nodes || []
  const newEdges = expanded.body?.edges || []
  console.log('   added nodes', newNodes.length, 'edges', newEdges.length)
  assert(newEdges.length >= 1, 'expand returned no new edges')

  // Grow toward ~10 if bootstrap undershot
  let totalNodes = nodes.length + newNodes.filter((n) => !nodes.some((o) => o.id === n.id)).length
  const frontier = [...nodes, ...newNodes].filter((n) => n.videoId !== seedVideoId)
  for (const n of frontier) {
    if (totalNodes >= 10) break
    if (n.id === expandTarget.id) continue
    const more = await api(`/api/rabbit-holes/${holeId}/nodes/${n.id}/expand`, { method: 'POST' })
    if (more.status !== 200) {
      console.warn('   extra expand soft-fail', n.id, more.status)
      continue
    }
    const added = (more.body?.nodes || []).length
    totalNodes += added
    console.log('   extra expand', n.id, '+', added, 'total~', totalNodes)
  }
  console.log('   graph size after expands ~', totalNodes)

  console.log('5) POST watch')
  const watched = await api(`/api/rabbit-holes/${holeId}/nodes/${expandTarget.id}/watch`, {
    method: 'POST',
  })
  assert(watched.status === 200, `watch failed: ${watched.status} ${JSON.stringify(watched.body)}`)
  assert(String(watched.body?.watchUrl || '').includes('youtube.com'), 'watchUrl missing')

  console.log('6) reopen hole (second client)')
  const reopen = await api(`/api/rabbit-holes/${holeId}`)
  assert(reopen.status === 200, `reopen failed: ${reopen.status}`)
  assert((reopen.body?.nodes || []).length >= nodes.length, 'reopen lost nodes')
  const path = reopen.body?.path || []
  assert(path.some((p) => p.nodeId === expandTarget.id), 'path missing visited node')

  console.log('7) public policy pages')
  for (const path of ['/privacy', '/terms', '/about']) {
    const res = await fetch(`${base}${path}`)
    assert(res.status === 200, `${path} => ${res.status}`)
  }

  console.log('SMOKE_OK', { holeId, nodes: nodes.length, expandEdges: newEdges.length, watchUrl: watched.body.watchUrl })
}
catch (e) {
  console.error('SMOKE_FAIL', e)
  process.exitCode = 1
}
finally {
  await sql.end({ timeout: 5 })
}
