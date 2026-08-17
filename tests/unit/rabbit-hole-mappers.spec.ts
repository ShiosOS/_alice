import { describe, expect, it } from 'vitest'
import {
  toExpandPatch,
  toGraphEdge,
  toGraphNode,
  toPathEvent,
  toRabbitHoleSummary,
} from '../../server/services/rabbit-holes/mappers'

const createdAt = new Date('2024-06-15T12:00:00.000Z')
const updatedAt = new Date('2024-06-16T12:00:00.000Z')

describe('rabbit-hole mappers', () => {
  it('maps a rabbit hole row to a summary with ISO dates', () => {
    const summary = toRabbitHoleSummary({
      id: 'hole-1',
      userId: 'user-1',
      title: 'Wonderland',
      seedVideoId: 'dQw4w9WgXcQ',
      status: 'ready',
      createdAt,
      updatedAt,
    })

    expect(summary).toEqual({
      id: 'hole-1',
      userId: 'user-1',
      title: 'Wonderland',
      seedVideoId: 'dQw4w9WgXcQ',
      status: 'ready',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  })

  it('maps a node row to a graph node', () => {
    const graphNode = toGraphNode({
      id: 'node-1',
      rabbitHoleId: 'hole-1',
      videoId: 'dQw4w9WgXcQ',
      title: 'Seed',
      channelTitle: 'Channel',
      thumbUrl: 'https://example.com/t.jpg',
      available: true,
      createdAt,
    })

    expect(graphNode.createdAt).toBe(createdAt.toISOString())
    expect(graphNode.title).toBe('Seed')
    expect(graphNode.channelTitle).toBe('Channel')
  })

  it('maps edge and path rows', () => {
    const graphEdge = toGraphEdge({
      id: 'edge-1',
      rabbitHoleId: 'hole-1',
      fromNodeId: 'n1',
      toNodeId: 'n2',
      phrase: 'related',
      createdAt,
    })
    const path = toPathEvent({
      id: 'path-1',
      rabbitHoleId: 'hole-1',
      nodeId: 'n1',
      kind: 'visited',
      createdAt,
    })

    expect(graphEdge.phrase).toBe('related')
    expect(path.kind).toBe('visited')
    expect(path.createdAt).toBe(createdAt.toISOString())
  })

  it('maps created nodes/edges into an expand patch', () => {
    const patch = toExpandPatch({
      nodes: [{
        id: 'node-1',
        rabbitHoleId: 'hole-1',
        videoId: 'dQw4w9WgXcQ',
        title: 'Seed',
        channelTitle: null,
        thumbUrl: null,
        available: true,
        createdAt,
      }],
      edges: [{
        id: 'edge-1',
        rabbitHoleId: 'hole-1',
        fromNodeId: 'n1',
        toNodeId: 'n2',
        phrase: 'related',
        createdAt,
      }],
    })

    expect(patch.nodes).toHaveLength(1)
    expect(patch.edges).toHaveLength(1)
    expect(patch.nodes[0]?.id).toBe('node-1')
    expect(patch.edges[0]?.id).toBe('edge-1')
  })
})
