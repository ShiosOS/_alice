#!/usr/bin/env node
/**
 * Apply SQL migrations at deploy time without drizzle-kit (devDependency).
 * Tracks applied files in __alice_migrations.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const url = process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL
if (!url) {
  console.error('DATABASE_URL / NUXT_DATABASE_URL is not set')
  process.exit(1)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'server', 'db', 'migrations')
const files = readdirSync(root)
  .filter(f => f.endsWith('.sql'))
  .sort()

const sql = postgres(url, { max: 1, ssl: url.includes('localhost') ? false : 'prefer' })

try {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "__alice_migrations" (
      id serial PRIMARY KEY,
      filename text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  const applied = new Set(
    (await sql`select filename from "__alice_migrations"`).map(r => r.filename),
  )

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip ${file}`)
      continue
    }
    const body = readFileSync(join(root, file), 'utf8')
    console.log(`apply ${file}`)
    await sql.begin(async (tx) => {
      await tx.unsafe(body)
      await tx`insert into "__alice_migrations" (filename) values (${file})`
    })
  }
  console.log('migrations complete')
}
finally {
  await sql.end({ timeout: 5 })
}
