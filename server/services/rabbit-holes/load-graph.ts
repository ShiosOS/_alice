import { and, eq } from 'drizzle-orm'
import type { RabbitHoleGraph } from '../../../shared/types/rabbit-holes'
import { edges, nodes, pathEvents, rabbitHoles, useDb } from '../../db'
import { ErrorMessage, notFound } from '../../utils/errors'
import {
  toGraphEdge,
  toGraphNode,
  toPathEvent,
  toRabbitHoleSummary,
} from './mappers'

export async function loadHoleGraph(holeId: string, userId: string): Promise<RabbitHoleGraph> {
  const db = useDb()
  const hole = await db.query.rabbitHoles.findFirst({
    where: and(eq(rabbitHoles.id, holeId), eq(rabbitHoles.userId, userId)),
  })
  if (!hole) {
    throw notFound(ErrorMessage.rabbitHoleNotFound)
  }
  const holeNodes = await db.select().from(nodes).where(eq(nodes.rabbitHoleId, holeId))
  const holeEdges = await db.select().from(edges).where(eq(edges.rabbitHoleId, holeId))
  const path = await db.select().from(pathEvents).where(eq(pathEvents.rabbitHoleId, holeId))
  return {
    rabbitHole: toRabbitHoleSummary(hole),
    nodes: holeNodes.map(toGraphNode),
    edges: holeEdges.map(toGraphEdge),
    path: path.map(toPathEvent),
  }
}
