import type { ExpandPatch, RabbitHoleGraph } from '#shared/types/rabbit-holes'

export function mergeExpandPatch(
  graph: RabbitHoleGraph,
  patch: ExpandPatch,
): RabbitHoleGraph {
  const nodeMap = new Map(graph.nodes.map(node => [node.id, node]))
  for (const node of patch.nodes) {
    nodeMap.set(node.id, node)
  }

  const edgeMap = new Map(graph.edges.map(edge => [edge.id, edge]))
  for (const edge of patch.edges) {
    edgeMap.set(edge.id, edge)
  }

  return {
    ...graph,
    nodes: [...nodeMap.values()],
    edges: [...edgeMap.values()],
  }
}
