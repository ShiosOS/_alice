import type { InferSelectModel } from 'drizzle-orm'
import type {
  ExpandPatch,
  GraphEdge,
  GraphNode,
  PathEvent,
  RabbitHoleSummary,
} from '../../../shared/types/rabbit-holes'
import { edges, nodes, pathEvents, rabbitHoles } from '../../db'

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
