import { and, eq } from 'drizzle-orm'
import { edges, nodes, rabbitHoles, useDb } from '../../db'
import { BOOTSTRAP_CHILD_TAKE, BOOTSTRAP_SEED_TAKE } from './constants'
import { expandNode } from './expand-node'

const HOLE_STATUS_READY = 'ready' as const

export async function bootstrapRabbitHole(opts: {
  userId: string
  rabbitHoleId: string
  seedNodeId: string
}) {
  try {
    // seed → BOOTSTRAP_SEED_TAKE, then each child → BOOTSTRAP_CHILD_TAKE (counts toward budget)
    await expandNode({
      userId: opts.userId,
      rabbitHoleId: opts.rabbitHoleId,
      nodeId: opts.seedNodeId,
      take: BOOTSTRAP_SEED_TAKE,
    })
    const db = useDb()
    const children = await db
      .select({ id: nodes.id })
      .from(nodes)
      .innerJoin(edges, eq(edges.toNodeId, nodes.id))
      .where(and(eq(edges.fromNodeId, opts.seedNodeId), eq(edges.rabbitHoleId, opts.rabbitHoleId)))

    for (const child of children) {
      await expandNode({
        userId: opts.userId,
        rabbitHoleId: opts.rabbitHoleId,
        nodeId: child.id,
        take: BOOTSTRAP_CHILD_TAKE,
      })
    }

    await db
      .update(rabbitHoles)
      .set({ status: HOLE_STATUS_READY, updatedAt: new Date() })
      .where(eq(rabbitHoles.id, opts.rabbitHoleId))
  }
  catch (e) {
    captureServerException(e, {
      reason: 'bootstrap_failed',
      rabbitHoleId: opts.rabbitHoleId,
      seedNodeId: opts.seedNodeId,
    })
    throw e
  }
}
