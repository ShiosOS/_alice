import { z } from 'zod'

export const holeStatuses = ['ready', 'incomplete'] as const
export type HoleStatus = (typeof holeStatuses)[number]

export const pathKinds = ['visited', 'watched'] as const
export type PathKind = (typeof pathKinds)[number]

export const ledgerStatuses = ['success', 'failed', 'rejected'] as const
export type LedgerStatus = (typeof ledgerStatuses)[number]

export type RabbitHoleSummary = {
  id: string
  userId: string
  title: string
  seedVideoId: string
  status: HoleStatus
  createdAt: string
  updatedAt: string
}

export type GraphNode = {
  id: string
  rabbitHoleId: string
  videoId: string
  title: string
  channelTitle: string | null
  thumbUrl: string | null
  available: boolean
  createdAt: string
}

export type GraphEdge = {
  id: string
  rabbitHoleId: string
  fromNodeId: string
  toNodeId: string
  phrase: string
  createdAt: string
}

export type PathEvent = {
  id: string
  rabbitHoleId: string
  nodeId: string
  kind: PathKind
  createdAt: string
}

export type RabbitHoleGraph = {
  rabbitHole: RabbitHoleSummary
  nodes: GraphNode[]
  edges: GraphEdge[]
  path: PathEvent[]
}

export type RabbitHoleList = {
  rabbitHoles: RabbitHoleSummary[]
}

export type RabbitHoleRenameResponse = {
  rabbitHole: RabbitHoleSummary
}

export type ExpandPatch = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export type WatchResponse = {
  watchUrl: string
  videoId: string
}

export const createRabbitHoleBodySchema = z.object({
  url: z.string().trim().min(1),
  title: z.string().max(200).optional(),
})

export type CreateRabbitHoleBody = z.infer<typeof createRabbitHoleBodySchema>

export const renameRabbitHoleBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
})

export type RenameRabbitHoleBody = z.infer<typeof renameRabbitHoleBodySchema>
