<template>
  <ClientOnly>
    <div class="graph-wrap grid gap-4 lg:grid-cols-[1fr_minmax(16rem,20rem)] lg:items-start">
      <div class="relative h-[min(70vh,640px)] overflow-hidden rounded-md border border-border bg-background/80">
        <VueFlow
          v-model:nodes="flowNodes"
          v-model:edges="flowEdges"
          :node-types="nodeTypes"
          :edge-types="edgeTypes"
          :default-viewport="{ zoom: 0.85 }"
          :min-zoom="0.35"
          :max-zoom="1.75"
          fit-view-on-init
          class="h-full w-full"
          @node-click="onNodeClick"
          @node-drag-stop="onNodeDragStop"
        >
          <Background :gap="20" :size="1" color="var(--border)" />
          <Controls class="!border-border !bg-card !text-foreground" />
          <Panel position="top-right" class="flex gap-2">
            <Button size="sm" variant="secondary" type="button" @click="resetLayout">
              Reset layout
            </Button>
          </Panel>
        </VueFlow>
      </div>

      <aside v-if="focused" class="rounded-md border border-border bg-card/80 p-4">
        <img
          v-if="focused.thumbUrl"
          class="mb-3 aspect-video w-full border border-border object-cover"
          :src="focused.thumbUrl"
          :alt="focused.title"
          width="320"
          height="180"
        >
        <h2 class="font-display text-lg leading-snug text-foreground">
          {{ focused.title }}
        </h2>
        <p v-if="focused.channelTitle" class="mt-1 text-sm text-muted-foreground">
          {{ focused.channelTitle }}
        </p>
        <p v-if="!focused.available" class="mt-2 text-sm text-destructive">
          Unavailable on YouTube
        </p>
        <div class="mt-4 flex flex-col gap-2">
          <Button :disabled="busy || !focused.available" @click="emit('watch', focused.id)">
            Watch on YouTube
          </Button>
          <Button variant="outline" :disabled="busy" @click="emit('expand', focused.id)">
            Expand
          </Button>
        </div>
      </aside>
      <aside v-else class="rounded-md border border-border bg-card/50 p-4 text-sm text-muted-foreground">
        Select a node to see details, watch on YouTube, or expand.
      </aside>
    </div>
    <template #fallback>
      <p class="text-muted-foreground">Loading map…</p>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Edge, EdgeComponent, Node, NodeComponent, NodeDragEvent, NodeMouseEvent } from '@vue-flow/core'
import type { GraphEdge, GraphNode } from '#shared/types/rabbit-holes'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Panel, VueFlow } from '@vue-flow/core'
import { markRaw } from 'vue'
import PhraseEdge from '~/components/graph/PhraseEdge.vue'
import VideoNode from '~/components/graph/VideoNode.vue'
import { Button } from '@/components/ui/button'
import {
  layoutWithDagre,
  toFlowEdges,
  toFlowNodes,
} from '~/utils/graph-layout'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/controls/dist/style.css'

const props = defineProps<{
  nodes: GraphNode[]
  edges: GraphEdge[]
  pathIds: Set<string>
  seedVideoId: string
  busy?: boolean
}>()

const emit = defineEmits<{
  expand: [nodeId: string]
  watch: [nodeId: string]
}>()

const handlers = {
  onExpand: (nodeId: string) => emit('expand', nodeId),
  onWatch: (nodeId: string) => emit('watch', nodeId),
}

const nodeTypes = {
  video: markRaw(VideoNode) as NodeComponent,
}
const edgeTypes = {
  phrase: markRaw(PhraseEdge) as EdgeComponent,
}

const flowNodes = ref<Node[]>([])
const flowEdges = ref<Edge[]>([])
const draggedIds = ref(new Set<string>())
const focusedId = ref<string | null>(null)
const skipNextSync = ref(false)

const focused = computed(
  () => props.nodes.find((n) => n.id === focusedId.value) || null,
)

function rebuildFromProps(preserveDragged: boolean) {
  const positions = new Map<string, { x: number, y: number }>()
  if (preserveDragged) {
    for (const n of flowNodes.value) {
      if (draggedIds.value.has(n.id)) {
        positions.set(n.id, { ...n.position })
      }
    }
  }
  else {
    draggedIds.value = new Set()
  }

  const built = toFlowNodes(
    props.nodes,
    props.seedVideoId,
    props.pathIds,
    !!props.busy,
    handlers,
    positions,
  )
  const edges = toFlowEdges(props.edges)
  const laid = layoutWithDagre(built, edges)
  flowNodes.value = laid.map((n) => {
    const keep = positions.get(n.id)
    return keep ? { ...n, position: keep } : n
  }) as Node[]
  flowEdges.value = edges as Edge[]
}

watch(
  () => [props.nodes, props.edges, props.pathIds, props.busy, props.seedVideoId] as const,
  () => {
    if (skipNextSync.value) {
      skipNextSync.value = false
      return
    }
    rebuildFromProps(true)
    if (!focusedId.value || !props.nodes.some((n) => n.id === focusedId.value)) {
      focusedId.value = props.nodes.find((n) => n.videoId === props.seedVideoId)?.id
        || props.nodes[0]?.id
        || null
    }
  },
  { immediate: true, deep: true },
)

function onNodeClick(ev: NodeMouseEvent) {
  focusedId.value = ev.node.id
}

function onNodeDragStop(ev: NodeDragEvent) {
  const next = new Set(draggedIds.value)
  next.add(ev.node.id)
  draggedIds.value = next
}

function resetLayout() {
  rebuildFromProps(false)
}

defineExpose({
  resetLayout,
  getDraggedIds: () => draggedIds.value,
})
</script>
