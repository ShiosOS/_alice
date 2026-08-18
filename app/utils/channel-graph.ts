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
