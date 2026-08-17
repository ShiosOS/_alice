import dagre from '@dagrejs/dagre'
import type { Edge, Node } from '@vue-flow/core'
import type { ExpandPatch, GraphEdge, GraphNode } from '#shared/types/rabbit-holes'

export type VideoNodeData = {
  graphNode: GraphNode
  isSeed: boolean
  onPath: boolean
  isMutating: boolean
  onExpand: (nodeId: string) => void
  onWatch: (nodeId: string) => void
}

export type PhraseEdgeData = {
  phrase: string
}

/** Must match CSS --graph-node-w / --graph-node-h in app/assets/css/tailwind.css */
export const NODE_WIDTH = 260
export const NODE_HEIGHT = 210
/** Minimum gap between card edges after layout / drag. */
export const NODE_GAP = 96

type Handlers = {
  onExpand: (nodeId: string) => void
  onWatch: (nodeId: string) => void
}

type Rect = { id: string, x: number, y: number, w: number, h: number }

export function toFlowNodes(
  nodes: GraphNode[],
  seedVideoId: string,
  pathIds: Set<string>,
  isMutating: boolean,
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
        isMutating,
        onExpand: handlers.onExpand,
        onWatch: handlers.onWatch,
      },
      draggable: true,
      style: { width: `${NODE_WIDTH}px`, height: `${NODE_HEIGHT}px` },
    }
  })
}

export function toFlowEdges(edges: GraphEdge[]): Edge<PhraseEdgeData>[] {
  return edges.map(e => ({
    id: e.id,
    source: e.fromNodeId,
    target: e.toNodeId,
    type: 'phrase',
    data: { phrase: e.phrase },
    animated: false,
  }))
}

function overlaps(a: Rect, b: Rect, gap: number): boolean {
  return !(
    a.x + a.w + gap <= b.x
    || b.x + b.w + gap <= a.x
    || a.y + a.h + gap <= b.y
    || b.y + b.h + gap <= a.y
  )
}

type LaidPosition = { id: string, position: { x: number, y: number } }

function pushPairApart(
  a: LaidPosition,
  b: LaidPosition,
  gap: number,
  fixed: Set<string>,
): boolean {
  const ra: Rect = { id: a.id, x: a.position.x, y: a.position.y, w: NODE_WIDTH, h: NODE_HEIGHT }
  const rb: Rect = { id: b.id, x: b.position.x, y: b.position.y, w: NODE_WIDTH, h: NODE_HEIGHT }
  if (!overlaps(ra, rb, gap)) return false

  const aFixed = fixed.has(a.id)
  const bFixed = fixed.has(b.id)
  if (aFixed && bFixed) return false

  const overlapX = Math.min(ra.x + ra.w + gap - rb.x, rb.x + rb.w + gap - ra.x)
  const overlapY = Math.min(ra.y + ra.h + gap - rb.y, rb.y + rb.h + gap - ra.y)
  const divisor = aFixed || bFixed ? 1 : 2
  let moved = false

  if (overlapX < overlapY) {
    const aCenterX = ra.x + ra.w / 2
    const bCenterX = rb.x + rb.w / 2
    const dir = aCenterX <= bCenterX ? -1 : 1
    const push = overlapX / divisor
    if (!aFixed) {
      a.position.x += dir * push
      moved = true
    }
    if (!bFixed) {
      b.position.x -= dir * push
      moved = true
    }
    return moved
  }

  const aCenterY = ra.y + ra.h / 2
  const bCenterY = rb.y + rb.h / 2
  const dir = aCenterY <= bCenterY ? -1 : 1
  const push = overlapY / divisor
  if (!aFixed) {
    a.position.y += dir * push
    moved = true
  }
  if (!bFixed) {
    b.position.y -= dir * push
    moved = true
  }
  return moved
}

/**
 * Push overlapping cards apart until none intersect (with NODE_GAP).
 * Prefer moving along the shallower penetration axis.
 */
export function resolveOverlaps<T extends LaidPosition>(
  nodes: T[],
  options?: { fixedIds?: Set<string>, gap?: number, maxPasses?: number },
): T[] {
  const gap = options?.gap ?? NODE_GAP
  const maxPasses = options?.maxPasses ?? 40
  const fixed = options?.fixedIds ?? new Set<string>()
  const next = nodes.map(n => ({
    ...n,
    position: { x: n.position.x, y: n.position.y },
  }))

  for (let pass = 0; pass < maxPasses; pass++) {
    let moved = false
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        const a = next[i]
        const b = next[j]
        if (!a || !b) continue
        if (pushPairApart(a, b, gap, fixed)) moved = true
      }
    }
    if (!moved) break
  }

  return next
}

/** Full-graph dagre layout (top → bottom), then hard non-overlap pass. */
export function layoutWithDagre(
  nodes: Node<VideoNodeData>[],
  edges: Edge<PhraseEdgeData>[],
): Node<VideoNodeData>[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  // nodesep/ranksep are edge-to-edge gaps once width/height are correct
  g.setGraph({
    rankdir: 'TB',
    nodesep: NODE_GAP + 48,
    ranksep: NODE_GAP + 72,
    marginx: 48,
    marginy: 48,
  })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  const laid = nodes.map((node) => {
    const pos = g.node(node.id) as { x: number, y: number } | undefined
    if (!pos) return node
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      style: { width: `${NODE_WIDTH}px`, height: `${NODE_HEIGHT}px` },
    }
  })

  return resolveOverlaps(laid)
}

/**
 * Apply Expand patch: keep positions for nodes the user already dragged;
 * place everyone else via dagre, restore dragged positions, then resolve overlaps
 * without moving dragged cards when possible.
 */
export function applyExpandKeepingDragged(
  currentNodes: Node<VideoNodeData>[],
  currentEdges: Edge<PhraseEdgeData>[],
  patch: ExpandPatch,
  seedVideoId: string,
  pathIds: Set<string>,
  isMutating: boolean,
  handlers: Handlers,
  draggedIds: Set<string>,
): { nodes: Node<VideoNodeData>[], edges: Edge<PhraseEdgeData>[] } {
  const byId = new Map(currentNodes.map(n => [n.id, n]))
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
          isMutating,
          onExpand: handlers.onExpand,
          onWatch: handlers.onWatch,
        },
        draggable: true,
        style: { width: `${NODE_WIDTH}px`, height: `${NODE_HEIGHT}px` },
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
          isMutating,
          onExpand: handlers.onExpand,
          onWatch: handlers.onWatch,
        },
      })
    }
  }

  const edgeById = new Map(currentEdges.map(e => [e.id, e]))
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
  const withDragged = laid.map((n) => {
    const keep = saved.get(n.id)
    return keep ? { ...n, position: keep } : n
  })

  return {
    nodes: resolveOverlaps(withDragged, { fixedIds: draggedIds }),
    edges: nextEdges,
  }
}
