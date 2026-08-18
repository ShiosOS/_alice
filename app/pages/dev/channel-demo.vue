<template>
  <div class="py-2">
    <p class="mb-4 text-xs text-muted-foreground">
      Dev fixture — channel surface (no API)
    </p>
    <RabbitHoleChannel
      :hole-graph="holeGraph"
      :is-mutating="false"
      :editing="false"
      :draft-title="holeGraph.rabbitHole.title"
      @expand="onExpand"
      @watch="onWatch"
      @start-edit="() => {}"
      @save-title="() => {}"
      @delete="() => {}"
      @retry-bootstrap="() => {}"
    />
    <p
      v-if="status"
      class="mt-4 text-sm text-muted-foreground"
    >
      {{ status }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { GraphEdge, GraphNode, RabbitHoleGraph } from '#shared/types/rabbit-holes'
import RabbitHoleChannel from '~/components/rabbit-hole/RabbitHoleChannel.vue'

const now = new Date().toISOString()
const seedVideoId = 'dQw4w9WgXcQ'

function node(
  id: string,
  videoId: string,
  title: string,
  channel: string,
): GraphNode {
  return {
    id,
    rabbitHoleId: 'demo',
    videoId,
    title,
    channelTitle: channel,
    thumbUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    available: true,
    createdAt: now,
  }
}

const nodes = [
  node('n0', seedVideoId, 'Down the rabbit hole: empires', 'Historia'),
  node('n1', 'aaaaaaaaaaa', 'The fall of ancient empires', 'Historia'),
  node('n2', 'bbbbbbbbbbb', 'Follow the leaders', 'Historia'),
  node('n3', 'ccccccccccc', 'Sideways theory', 'Historia'),
]

const edges: GraphEdge[] = [
  { id: 'e1', rabbitHoleId: 'demo', fromNodeId: 'n0', toNodeId: 'n1', phrase: 'deeper into antiquity', createdAt: now },
  { id: 'e2', rabbitHoleId: 'demo', fromNodeId: 'n0', toNodeId: 'n2', phrase: 'follow the leaders', createdAt: now },
  { id: 'e3', rabbitHoleId: 'demo', fromNodeId: 'n0', toNodeId: 'n3', phrase: 'sideways theory', createdAt: now },
]

const holeGraph = ref<RabbitHoleGraph>({
  rabbitHole: {
    id: 'demo',
    userId: 'demo',
    title: 'Empires collapse',
    seedVideoId,
    status: 'ready',
    createdAt: now,
    updatedAt: now,
  },
  nodes,
  edges,
  path: [],
})

const status = ref('')

function onExpand(nodeId: string) {
  status.value = `Expand ${nodeId}`
}

function onWatch(nodeId: string) {
  status.value = `Watch ${nodeId}`
  const already = holeGraph.value.path.some(p => p.nodeId === nodeId)
  if (!already) {
    holeGraph.value = {
      ...holeGraph.value,
      path: [
        ...holeGraph.value.path,
        {
          id: `p-${nodeId}`,
          rabbitHoleId: 'demo',
          nodeId,
          kind: 'visited',
          createdAt: new Date().toISOString(),
        },
      ],
    }
  }
}
</script>
