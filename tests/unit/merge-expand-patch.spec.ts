import { describe, expect, it } from 'vitest'
import { mergeExpandPatch } from '../../app/utils/merge-expand-patch'
import type { ExpandPatch, GraphEdge, GraphNode, RabbitHoleGraph } from '../../shared/types/rabbit-holes'

function node(partial: Partial<GraphNode> & Pick<GraphNode, 'id'>): GraphNode {
  return {
    rabbitHoleId: 'hole-1',
    videoId: `vid-${partial.id}`,
    title: `Node ${partial.id}`,
    channelTitle: null,
    thumbUrl: null,
    available: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...partial,
  }
}

function edge(partial: Partial<GraphEdge> & Pick<GraphEdge, 'id' | 'fromNodeId' | 'toNodeId'>): GraphEdge {
  return {
    rabbitHoleId: 'hole-1',
    phrase: 'fork',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...partial,
  }
}

function emptyGraph(): RabbitHoleGraph {
  return {
    rabbitHole: {
      id: 'hole-1',
      userId: 'user-1',
      title: 'Test',
      seedVideoId: 'dQw4w9WgXcQ',
      status: 'ready',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    nodes: [node({ id: 'n1', title: 'Seed' })],
    edges: [],
    path: [],
  }
}

describe('mergeExpandPatch', () => {
  it('appends new nodes and edges by id', () => {
    const graph = emptyGraph()
    const patch: ExpandPatch = {
      nodes: [node({ id: 'n2', title: 'Child' })],
      edges: [edge({ id: 'e1', fromNodeId: 'n1', toNodeId: 'n2' })],
    }

    const merged = mergeExpandPatch(graph, patch)

    expect(merged.nodes.map(n => n.id).sort()).toEqual(['n1', 'n2'])
    expect(merged.edges).toHaveLength(1)
    expect(merged.edges[0]?.id).toBe('e1')
  })

  it('replaces existing nodes and edges with the same id', () => {
    const graph = emptyGraph()
    graph.nodes.push(node({ id: 'n2', title: 'Old child' }))
    graph.edges.push(edge({ id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', phrase: 'old' }))

    const patch: ExpandPatch = {
      nodes: [node({ id: 'n2', title: 'Updated child' })],
      edges: [edge({ id: 'e1', fromNodeId: 'n1', toNodeId: 'n2', phrase: 'new' })],
    }

    const merged = mergeExpandPatch(graph, patch)

    expect(merged.nodes.find(n => n.id === 'n2')?.title).toBe('Updated child')
    expect(merged.edges.find(e => e.id === 'e1')?.phrase).toBe('new')
    expect(merged.nodes).toHaveLength(2)
    expect(merged.edges).toHaveLength(1)
  })
})
