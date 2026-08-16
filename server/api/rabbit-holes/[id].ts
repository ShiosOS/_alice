import { and, eq } from 'drizzle-orm'
import { rabbitHoles, useDb } from '../../db'
import { loadHoleGraph } from '../../utils/rabbit-holes'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event as never)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  if (event.method === 'GET') {
    return loadHoleGraph(id, session.user.id)
  }

  if (event.method === 'PATCH') {
    const body = await readBody<{ title?: string }>(event)
    if (!body.title?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Title required' })
    }
    const db = useDb()
    const [updated] = await db
      .update(rabbitHoles)
      .set({ title: body.title.trim().slice(0, 200), updatedAt: new Date() })
      .where(and(eq(rabbitHoles.id, id), eq(rabbitHoles.userId, session.user.id)))
      .returning()
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Rabbit Hole not found' })
    return { rabbitHole: updated }
  }

  if (event.method === 'DELETE') {
    const db = useDb()
    const deleted = await db
      .delete(rabbitHoles)
      .where(and(eq(rabbitHoles.id, id), eq(rabbitHoles.userId, session.user.id)))
      .returning()
    if (!deleted.length) throw createError({ statusCode: 404, statusMessage: 'Rabbit Hole not found' })
    return { ok: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
