import { and, eq } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'
import type {
  ExpandPatch,
  GraphEdge,
  GraphNode,
  PathEvent,
  RabbitHoleGraph,
  RabbitHoleSummary,
} from '../../shared/types/rabbit-holes'
import { edges, nodes, pathEvents, rabbitHoles, useDb } from '../db'

type HoleRow = InferSelectModel<typeof rabbitHoles>
type NodeRow = InferSelectModel<typeof nodes>
type EdgeRow = InferSelectModel<typeof edges>
type PathRow = InferSelectModel<typeof pathEvents>

function toIso(value: Date) {
  return value.toISOString()
}

export function toRabbitHoleSummary(row: HoleRow): RabbitHoleSummary {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    seedVideoId: row.seedVideoId,
    status: row.status,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  }
}

export function toGraphNode(row: NodeRow): GraphNode {
  return {
    id: row.id,
    rabbitHoleId: row.rabbitHoleId,
    videoId: row.videoId,
    title: row.title,
    channelTitle: row.channelTitle,
    thumbUrl: row.thumbUrl,
    available: row.available,
    createdAt: toIso(row.createdAt),
  }
}

export function toGraphEdge(row: EdgeRow): GraphEdge {
  return {
    id: row.id,
    rabbitHoleId: row.rabbitHoleId,
    fromNodeId: row.fromNodeId,
    toNodeId: row.toNodeId,
    phrase: row.phrase,
    createdAt: toIso(row.createdAt),
  }
}

export function toPathEvent(row: PathRow): PathEvent {
  return {
    id: row.id,
    rabbitHoleId: row.rabbitHoleId,
    nodeId: row.nodeId,
    kind: row.kind,
    createdAt: toIso(row.createdAt),
  }
}

export function toExpandPatch(created: { nodes: NodeRow[], edges: EdgeRow[] }): ExpandPatch {
  return {
    nodes: created.nodes.map(toGraphNode),
    edges: created.edges.map(toGraphEdge),
  }
}

export async function loadHoleGraph(holeId: string, userId: string): Promise<RabbitHoleGraph> {
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
  return {
    rabbitHole: toRabbitHoleSummary(hole),
    nodes: holeNodes.map(toGraphNode),
    edges: holeEdges.map(toGraphEdge),
    path: path.map(toPathEvent),
  }
}
