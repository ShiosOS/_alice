import dagre from '@dagrejs/dagre'
import type { Edge, Node } from '@vue-flow/core'
import type { ExpandPatch, GraphEdge, GraphNode } from '#shared/types/rabbit-holes'

export type VideoNodeData = {
  graphNode: GraphNode
  isSeed: boolean
  onPath: boolean
  busy: boolean
  onExpand: (nodeId: string) => void
  onWatch: (nodeId: string) => void
}

export type PhraseEdgeData = {
  phrase: string
}

const NODE_WIDTH = 220
const NODE_HEIGHT = 112

type Handlers = {
  onExpand: (nodeId: string) => void
  onWatch: (nodeId: string) => void
}

export function toFlowNodes(
  nodes: GraphNode[],
  seedVideoId: string,
  pathIds: Set<string>,
  busy: boolean,
  handlers: Handlers,
  positions?: Map<string, { x: number, y: number }>,
): Node<VideoNodeData>[] {
  return nodes.map((n) => {
    const pos = positions?.get(n.id)
    return {
      id: n.id,
      type: 'video',
      position: pos ?? { x: 0, y: 0 },
      data: {
        graphNode: n,
        isSeed: n.videoId === seedVideoId,
        onPath: pathIds.has(n.id),
        busy,
        onExpand: handlers.onExpand,
        onWatch: handlers.onWatch,
      },
      draggable: true,
    }
  })
}

export function toFlowEdges(edges: GraphEdge[]): Edge<PhraseEdgeData>[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.fromNodeId,
    target: e.toNodeId,
    type: 'phrase',
    data: { phrase: e.phrase },
    animated: false,
  }))
}

/** Full-graph dagre layout (top → bottom). */
export function layoutWithDagre(
  nodes: Node<VideoNodeData>[],
  edges: Edge<PhraseEdgeData>[],
): Node<VideoNodeData>[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 48, ranksep: 72, marginx: 24, marginy: 24 })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id) as { x: number, y: number } | undefined
    if (!pos) return node
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    }
  })
}

/**
 * Apply Expand patch: keep positions for nodes the user already dragged;
 * place everyone else (including new nodes) via dagre, then restore dragged positions.
 */
export function applyExpandKeepingDragged(
  currentNodes: Node<VideoNodeData>[],
  currentEdges: Edge<PhraseEdgeData>[],
  patch: ExpandPatch,
  seedVideoId: string,
  pathIds: Set<string>,
  busy: boolean,
  handlers: Handlers,
  draggedIds: Set<string>,
): { nodes: Node<VideoNodeData>[], edges: Edge<PhraseEdgeData>[] } {
  const byId = new Map(currentNodes.map((n) => [n.id, n]))
  for (const n of patch.nodes) {
    if (!byId.has(n.id)) {
      byId.set(n.id, {
        id: n.id,
        type: 'video',
        position: { x: 0, y: 0 },
        data: {
          graphNode: n,
          isSeed: n.videoId === seedVideoId,
          onPath: pathIds.has(n.id),
          busy,
          onExpand: handlers.onExpand,
          onWatch: handlers.onWatch,
        },
        draggable: true,
      })
    }
    else {
      const existing = byId.get(n.id)
      if (!existing?.data) continue
      byId.set(n.id, {
        ...existing,
        data: {
          graphNode: n,
          isSeed: existing.data.isSeed,
          onPath: pathIds.has(n.id),
          busy,
          onExpand: handlers.onExpand,
          onWatch: handlers.onWatch,
        },
      })
    }
  }

  const edgeById = new Map(currentEdges.map((e) => [e.id, e]))
  for (const e of toFlowEdges(patch.edges)) {
    edgeById.set(e.id, e)
  }

  const nextNodes = [...byId.values()]
  const nextEdges = [...edgeById.values()]
  const saved = new Map<string, { x: number, y: number }>()
  for (const n of nextNodes) {
    if (draggedIds.has(n.id)) {
      saved.set(n.id, { ...n.position })
    }
  }

  const laid = layoutWithDagre(nextNodes, nextEdges)
  return {
    nodes: laid.map((n) => {
      const keep = saved.get(n.id)
      return keep ? { ...n, position: keep } : n
    }),
    edges: nextEdges,
  }
}
