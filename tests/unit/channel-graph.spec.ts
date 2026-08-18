import { describe, expect, it } from 'vitest'
import type {
  GraphEdge,
  GraphNode,
  PathEvent,
  RabbitHoleGraph,
} from '../../shared/types/rabbit-holes'
import {
  ancestorChainToFocus,
  childForksForNode,
  findNodeById,
  inboundEdgeToNode,
  pathTrailNodes,
  resolveDefaultFocusId,
} from '../../app/utils/channel-graph'

const now = '2026-01-01T00:00:00.000Z'

function node(id: string, videoId: string, title: string): GraphNode {
  return {
    id,
    rabbitHoleId: 'hole-1',
    videoId,
    title,
    channelTitle: 'Ch',
    thumbUrl: null,
    available: true,
    createdAt: now,
  }
}

function edge(id: string, from: string, to: string, phrase: string): GraphEdge {
  return {
    id,
    rabbitHoleId: 'hole-1',
    fromNodeId: from,
    toNodeId: to,
    phrase,
    createdAt: now,
  }
}

function path(id: string, nodeId: string, createdAt: string): PathEvent {
  return {
    id,
    rabbitHoleId: 'hole-1',
    nodeId,
    kind: 'visited',
    createdAt,
  }
}

function graph(partial: Partial<RabbitHoleGraph> & Pick<RabbitHoleGraph, 'nodes' | 'edges' | 'path'>): RabbitHoleGraph {
  return {
    rabbitHole: {
      id: 'hole-1',
      userId: 'u1',
      title: 'Empires',
      seedVideoId: 'seed-yt',
      status: 'ready',
      createdAt: now,
      updatedAt: now,
    },
    ...partial,
  }
}

describe('channel-graph helpers', () => {
  const seed = node('n0', 'seed-yt', 'Seed')
  const a = node('n1', 'a', 'A')
  const b = node('n2', 'b', 'B')

  it('finds nodes by id', () => {
    expect(findNodeById([seed, a], 'n1')?.title).toBe('A')
    expect(findNodeById([seed, a], 'missing')).toBeNull()
  })

  it('defaults focus to seed when Path is empty', () => {
    const g = graph({
      nodes: [seed, a],
      edges: [edge('e1', 'n0', 'n1', 'deeper')],
      path: [],
    })
    expect(resolveDefaultFocusId(g)).toBe('n0')
  })

  it('defaults focus to last Path node when present', () => {
    const g = graph({
      nodes: [seed, a, b],
      edges: [],
      path: [
        path('p1', 'n1', '2026-01-01T01:00:00.000Z'),
        path('p2', 'n2', '2026-01-01T02:00:00.000Z'),
      ],
    })
    expect(resolveDefaultFocusId(g)).toBe('n2')
  })

  it('lists child forks with phrases', () => {
    const g = graph({
      nodes: [seed, a, b],
      edges: [
        edge('e1', 'n0', 'n1', 'deeper into economics'),
        edge('e2', 'n0', 'n2', 'sideways theory'),
        edge('e3', 'n1', 'n2', 'ignore'),
      ],
      path: [],
    })
    const forks = childForksForNode(g, 'n0')
    expect(forks).toHaveLength(2)
    expect(forks[0]?.edge.phrase).toBe('deeper into economics')
    expect(forks[0]?.node.id).toBe('n1')
    expect(forks[1]?.node.id).toBe('n2')
  })

  it('builds Path trail with seed then visit order', () => {
    const g = graph({
      nodes: [seed, a, b],
      edges: [],
      path: [
        path('p2', 'n2', '2026-01-01T02:00:00.000Z'),
        path('p1', 'n1', '2026-01-01T01:00:00.000Z'),
      ],
    })
    expect(pathTrailNodes(g).map(n => n.id)).toEqual(['n0', 'n1', 'n2'])
  })

  it('walks ancestor chain with inbound phrases', () => {
    const g = graph({
      nodes: [seed, a, b],
      edges: [
        edge('e1', 'n0', 'n1', 'deeper into antiquity'),
        edge('e2', 'n1', 'n2', 'compare collapses'),
      ],
      path: [],
    })
    expect(inboundEdgeToNode(g, 'n2')?.phrase).toBe('compare collapses')
    const chain = ancestorChainToFocus(g, 'n2')
    expect(chain.map(s => s.node.id)).toEqual(['n0', 'n1', 'n2'])
    expect(chain[0]?.inboundPhrase).toBeNull()
    expect(chain[1]?.inboundPhrase).toBe('deeper into antiquity')
    expect(chain[2]?.inboundPhrase).toBe('compare collapses')
  })
})
