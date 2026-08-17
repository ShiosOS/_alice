<template>
  <div class="relative h-full min-h-0 w-full">
    <RabbitHoleGraph
      :nodes="nodes"
      :edges="edges"
      :path-ids="pathIds"
      :seed-video-id="seedVideoId"
      :busy="false"
      @expand="onExpand"
      @watch="onWatch"
    >
      <template #toolbar>
        <button
          type="button"
          class="rounded-md border border-primary/35 bg-[#121820]/85 px-3 py-1.5 font-display text-xs text-primary backdrop-blur hover:bg-primary/10"
          @click="simulateExpand"
        >
          Simulate Expand
        </button>
      </template>
    </RabbitHoleGraph>
    <p
      v-if="status"
      class="pointer-events-none absolute top-4 left-4 z-20 rounded-md border border-primary/30 bg-[#121820]/85 px-3 py-1.5 font-display text-xs text-primary backdrop-blur"
    >
      {{ status }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { GraphEdge, GraphNode } from '#shared/types/rabbit-holes'

definePageMeta({
  fullBleed: true,
})

const seedVideoId = 'dQw4w9WgXcQ'
const now = new Date().toISOString()

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

const nodes = ref<GraphNode[]>([
  node('n0', seedVideoId, 'Down the rabbit hole: empires', 'Historia'),
  node('n1', 'jNQXAC9IVRw', 'The Golden Age of Athens', 'Historia'),
  node('n2', '9bZkp7q19f0', 'Caesar: Politics and Power', 'Historia'),
  node('n3', 'fJ9rUzIMcZQ', 'Why Empires Fall', 'Historia'),
  node('n4', 'kJQP7kiw5Fk', 'Roman Culture That Shaped the West', 'Historia'),
  node('n5', 'OPf0YbXqDm0', 'The Fall of the Mayan Empire', 'Historia'),
  node('n6', 'ZZ5LpwO-An4', 'Modern Parallels', 'Historia'),
])

const edges = ref<GraphEdge[]>([
  { id: 'e1', rabbitHoleId: 'demo', fromNodeId: 'n0', toNodeId: 'n1', phrase: 'deeper into antiquity', createdAt: now },
  { id: 'e2', rabbitHoleId: 'demo', fromNodeId: 'n0', toNodeId: 'n2', phrase: 'follow the leaders', createdAt: now },
  { id: 'e3', rabbitHoleId: 'demo', fromNodeId: 'n0', toNodeId: 'n3', phrase: 'sideways theory', createdAt: now },
  { id: 'e4', rabbitHoleId: 'demo', fromNodeId: 'n1', toNodeId: 'n4', phrase: 'curiouser culture', createdAt: now },
  { id: 'e5', rabbitHoleId: 'demo', fromNodeId: 'n1', toNodeId: 'n5', phrase: 'compare collapses', createdAt: now },
  { id: 'e6', rabbitHoleId: 'demo', fromNodeId: 'n2', toNodeId: 'n6', phrase: 'modern parallels', createdAt: now },
])

const pathIds = ref(new Set<string>(['n0', 'n1']))
const status = ref('')

function onExpand(nodeId: string) {
  status.value = `Expand requested for ${nodeId}`
}

function onWatch(nodeId: string) {
  status.value = `Watch requested for ${nodeId}`
  pathIds.value = new Set([...pathIds.value, nodeId])
}

function simulateExpand() {
  const id = `n${nodes.value.length}`
  nodes.value = [
    ...nodes.value,
    node(id, 'ZZ5LpwO-An4', `New fork ${id}`, 'Historia'),
  ]
  edges.value = [
    ...edges.value,
    {
      id: `e-${id}`,
      rabbitHoleId: 'demo',
      fromNodeId: 'n0',
      toNodeId: id,
      phrase: 'another shaft',
      createdAt: now,
    },
  ]
  status.value = 'Added a fork from the seed'
}
</script>
