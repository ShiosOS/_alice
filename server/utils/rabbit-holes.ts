import { and, eq } from 'drizzle-orm'
import { edges, nodes, pathEvents, rabbitHoles, useDb } from '../db'

export async function loadHoleGraph(holeId: string, userId: string) {
  const db = useDb()
  const hole = await db.query.rabbitHoles.findFirst({
    where: and(eq(rabbitHoles.id, holeId), eq(rabbitHoles.userId, userId)),
  })
  if (!hole) {
    throw createError({ statusCode: 404, statusMessage: 'Rabbit Hole not found' })
  }
  const holeNodes = await db.select().from(nodes).where(eq(nodes.rabbitHoleId, holeId))
  const holeEdges = await db.select().from(edges).where(eq(edges.rabbitHoleId, holeId))
  const path = await db.select().from(pathEvents).where(eq(pathEvents.rabbitHoleId, holeId))
  return { rabbitHole: hole, nodes: holeNodes, edges: holeEdges, path }
}
