import { and, eq } from 'drizzle-orm'
import type { RabbitHoleGraph, RabbitHoleRenameResponse } from '../../../shared/types/rabbit-holes'
import { renameRabbitHoleBodySchema } from '../../../shared/types/rabbit-holes'
import { rabbitHoles, useDb } from '../../db'
import { RABBIT_HOLE_TITLE_MAX } from '../../services/expand/constants'
import { loadHoleGraph } from '../../services/rabbit-holes/load-graph'
import { toRabbitHoleSummary } from '../../services/rabbit-holes/mappers'
import {
  ErrorMessage,
  badRequest,
  methodNotAllowed,
  notFound,
} from '../../utils/errors'
import { readZodBody } from '../../utils/validate'

export default defineEventHandler(async (event): Promise<RabbitHoleGraph | RabbitHoleRenameResponse | { ok: true }> => {
  const session = await requireSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw badRequest(ErrorMessage.missingId)

  if (event.method === 'GET') {
    return loadHoleGraph(id, session.user.id)
  }

  if (event.method === 'PATCH') {
    const body = await readZodBody(event, renameRabbitHoleBodySchema)
    const db = useDb()
    const [updated] = await db
      .update(rabbitHoles)
      .set({ title: body.title.slice(0, RABBIT_HOLE_TITLE_MAX), updatedAt: new Date() })
      .where(and(eq(rabbitHoles.id, id), eq(rabbitHoles.userId, session.user.id)))
      .returning()
    if (!updated) throw notFound(ErrorMessage.rabbitHoleNotFound)
    return { rabbitHole: toRabbitHoleSummary(updated) }
  }

  if (event.method === 'DELETE') {
    const db = useDb()
    const deleted = await db
      .delete(rabbitHoles)
      .where(and(eq(rabbitHoles.id, id), eq(rabbitHoles.userId, session.user.id)))
      .returning()
    if (!deleted.length) throw notFound(ErrorMessage.rabbitHoleNotFound)
    return { ok: true }
  }

  throw methodNotAllowed()
})
