import type {
  GraphEdge,
  GraphNode,
  PathEvent,
  RabbitHoleGraph,
} from '#shared/types/rabbit-holes'

export type ChannelFork = {
  edge: GraphEdge
  node: GraphNode
}

/** One step on the structural shaft from seed toward focus. */
export type ChainStep = {
  node: GraphNode
  /** Phrase on the edge into this node; null for the seed. */
  inboundPhrase: string | null
}

/** Prefer last Path node when present; otherwise the seed node. */
export function resolveDefaultFocusId(graph: RabbitHoleGraph): string | null {
  const path = graph.path
  if (path.length > 0) {
    const lastPath = path[path.length - 1]
    if (lastPath && graph.nodes.some(n => n.id === lastPath.nodeId)) {
      return lastPath.nodeId
    }
  }

  const seedNode = graph.nodes.find(n => n.videoId === graph.rabbitHole.seedVideoId)
  if (seedNode) return seedNode.id

  const first = graph.nodes[0]
  return first?.id ?? null
}

export function findNodeById(
  nodes: GraphNode[],
  nodeId: string,
): GraphNode | null {
  return nodes.find(n => n.id === nodeId) ?? null
}

/** First inbound edge to `nodeId` (tree parent), if any. */
export function inboundEdgeToNode(
  graph: RabbitHoleGraph,
  nodeId: string,
): GraphEdge | null {
  return graph.edges.find(e => e.toNodeId === nodeId) ?? null
}

/**
 * Structural chain from seed (or root) down to `focusId`, with inbound phrases.
 * Walks parent edges; stops if a cycle appears.
 */
export function ancestorChainToFocus(
  graph: RabbitHoleGraph,
  focusId: string,
): ChainStep[] {
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const focus = byId.get(focusId)
  if (!focus) return []

  const upward: ChainStep[] = []
  const seen = new Set<string>()
  let currentId: string | null = focusId

  while (currentId) {
    if (seen.has(currentId)) break
    seen.add(currentId)

    const node = byId.get(currentId)
    if (!node) break

    const inbound = inboundEdgeToNode(graph, currentId)
    upward.push({
      node,
      inboundPhrase: inbound?.phrase ?? null,
    })
    currentId = inbound?.fromNodeId ?? null
  }

  return upward.reverse()
}

/** Outbound forks from `fromNodeId`, with phrase + child node. */
export function childForksForNode(
  graph: RabbitHoleGraph,
  fromNodeId: string,
): ChannelFork[] {
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const forks: ChannelFork[] = []

  for (const edge of graph.edges) {
    if (edge.fromNodeId !== fromNodeId) continue
    const node = byId.get(edge.toNodeId)
    if (!node) continue
    forks.push({ edge, node })
  }

  return forks
}

/**
 * Path trail in visit order (first occurrence of each nodeId).
 * Seed is prepended when it is not already on the Path.
 */
export function pathTrailNodes(graph: RabbitHoleGraph): GraphNode[] {
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const seen = new Set<string>()
  const trail: GraphNode[] = []

  function push(nodeId: string) {
    if (seen.has(nodeId)) return
    const node = byId.get(nodeId)
    if (!node) return
    seen.add(nodeId)
    trail.push(node)
  }

  const seedNode = graph.nodes.find(n => n.videoId === graph.rabbitHole.seedVideoId)
  if (seedNode) push(seedNode.id)

  const orderedPath: PathEvent[] = [...graph.path].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt),
  )
  for (const event of orderedPath) {
    push(event.nodeId)
  }

  return trail
}

export type OutlineRow = {
  node: GraphNode
  depth: number
  inboundPhrase: string | null
  parentId: string | null
  hasChildren: boolean
  /**
   * Tree guide flags, length === depth.
   * For columns 0..depth-2: true draws a continuing vertical rail.
   * For the last column: true means ├ (more siblings below), false means └.
   */
  guides: boolean[]
}

/**
 * Depth-first outline of the whole hole from the seed (or first root).
 * Orphan nodes with no path from seed are appended at depth 0.
 */
export function graphOutlineRows(graph: RabbitHoleGraph): OutlineRow[] {
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const children = new Map<string, ChannelFork[]>()

  for (const edge of graph.edges) {
    const list = children.get(edge.fromNodeId) || []
    const node = byId.get(edge.toNodeId)
    if (!node) continue
    list.push({ edge, node })
    children.set(edge.fromNodeId, list)
  }

  const rows: OutlineRow[] = []
  const visited = new Set<string>()

  function walk(
    nodeId: string,
    depth: number,
    inboundPhrase: string | null,
    parentId: string | null,
    guides: boolean[],
  ) {
    if (visited.has(nodeId)) return
    const node = byId.get(nodeId)
    if (!node) return
    visited.add(nodeId)
    const forks = children.get(nodeId) || []
    rows.push({
      node,
      depth,
      inboundPhrase,
      parentId,
      hasChildren: forks.length > 0,
      guides,
    })
    for (let i = 0; i < forks.length; i++) {
      const fork = forks[i]!
      const hasMoreSiblings = i < forks.length - 1
      walk(fork.node.id, depth + 1, fork.edge.phrase, nodeId, [...guides, hasMoreSiblings])
    }
  }

  const seedNode = graph.nodes.find(n => n.videoId === graph.rabbitHole.seedVideoId)
  if (seedNode) {
    walk(seedNode.id, 0, null, null, [])
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      walk(node.id, 0, null, null, [])
    }
  }

  return rows
}

/** Hide descendants of collapsed branch nodes. */
export function visibleOutlineRows(
  rows: OutlineRow[],
  collapsedIds: ReadonlySet<string>,
): OutlineRow[] {
  if (collapsedIds.size === 0) return rows
  const hidden = new Set<string>()
  const visible: OutlineRow[] = []
  for (const row of rows) {
    if (row.parentId && hidden.has(row.parentId)) {
      hidden.add(row.node.id)
      continue
    }
    if (collapsedIds.has(row.node.id)) {
      hidden.add(row.node.id)
    }
    visible.push(row)
  }
  return visible
}

/** Ancestor node ids from root down to (but not including) the focus. */
export function outlineAncestorIds(
  rows: OutlineRow[],
  nodeId: string,
): string[] {
  const byId = new Map(rows.map(r => [r.node.id, r]))
  const chain: string[] = []
  let current = byId.get(nodeId)
  while (current?.parentId) {
    chain.unshift(current.parentId)
    current = byId.get(current.parentId)
  }
  return chain
}
