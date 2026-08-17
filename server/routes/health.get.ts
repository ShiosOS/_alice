import { sql } from 'drizzle-orm'
import { useDb } from '../db'

/**
 * Platform readiness: HTTP 200 only when this instance can reach Postgres.
 * Unauthenticated; do not call YouTube or AI.
 */
export default defineEventHandler(async () => {
  try {
    const db = useDb()
    await db.execute(sql`select 1`)
    return { ok: true }
  }
  catch {
    throw createError({ statusCode: 503, statusMessage: 'unhealthy' })
  }
})
