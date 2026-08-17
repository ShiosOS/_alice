<template>
  <ClientOnly>
    <div class="relative -mx-5 -mb-8 min-h-[calc(100vh-8.5rem)] overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_20%,rgba(42,31,24,0.35),transparent_65%)]"
      />
      <VueFlow
        v-model:nodes="flowNodes"
        v-model:edges="flowEdges"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :default-viewport="{ zoom: 0.8 }"
        :min-zoom="0.3"
        :max-zoom="1.6"
        :default-edge-options="{ type: 'phrase' }"
        fit-view-on-init
        class="h-[calc(100vh-8.5rem)] w-full bg-transparent"
        :elevate-edges-on-select="false"
        @node-click="onNodeClick"
        @pane-click="focusedId = null"
        @node-drag-stop="onNodeDragStop"
      >
        <Panel position="bottom-right" class="mb-4 mr-4 flex items-center gap-1 rounded-md border border-primary/40 bg-[#121820]/90 px-1 py-1 text-primary shadow-lg backdrop-blur">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded text-lg leading-none hover:bg-primary/10"
            aria-label="Zoom out"
            @click="zoomOut()"
          >
            −
          </button>
          <span class="min-w-12 text-center font-display text-xs tabular-nums text-primary/90">
            {{ zoomPct }}%
          </span>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded text-lg leading-none hover:bg-primary/10"
            aria-label="Zoom in"
            @click="zoomIn()"
          >
            +
          </button>
        </Panel>
        <Panel position="top-right" class="mt-3 mr-3 flex gap-2">
          <button
            type="button"
            class="rounded-md border border-primary/35 bg-[#121820]/85 px-3 py-1.5 font-display text-xs text-primary backdrop-blur hover:bg-primary/10"
            @click="resetLayout"
          >
            Reset layout
          </button>
        </Panel>
      </VueFlow>

      <aside
        v-if="focused"
        class="absolute bottom-6 left-1/2 z-10 w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 rounded-lg border border-primary/45 bg-[#121820]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur"
      >
        <div class="flex gap-3">
          <img
            v-if="focused.thumbUrl"
            class="h-16 w-28 shrink-0 rounded object-cover"
            :src="focused.thumbUrl"
            :alt="focused.title"
            width="112"
            height="64"
          >
          <div class="min-w-0 flex-1">
            <h2 class="font-display text-base leading-snug text-[#f0e6d4]">
              {{ focused.title }}
            </h2>
            <p v-if="focused.channelTitle" class="mt-0.5 truncate text-xs text-muted-foreground">
              {{ focused.channelTitle }}
            </p>
            <p v-if="!focused.available" class="mt-1 text-xs text-destructive">
              Unavailable on YouTube
            </p>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <Button
            class="flex-1"
            :disabled="busy || !focused.available"
            @click="emit('watch', focused.id)"
          >
            Watch on YouTube
          </Button>
          <Button
            variant="outline"
            class="flex-1 border-primary/50 text-primary hover:bg-primary/10"
            :disabled="busy"
            @click="emit('expand', focused.id)"
          >
            Expand
          </Button>
        </div>
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
import { Panel, useVueFlow, VueFlow } from '@vue-flow/core'
import { markRaw } from 'vue'
import PhraseEdge from '~/components/graph/PhraseEdge.vue'
import VideoNode from '~/components/graph/VideoNode.vue'
import { Button } from '@/components/ui/button'
import {
  layoutWithDagre,
  resolveOverlaps,
  toFlowEdges,
  toFlowNodes,
} from '~/utils/graph-layout'

import '@vue-flow/core/dist/style.css'

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

const { zoomIn, zoomOut, viewport } = useVueFlow()
const zoomPct = computed(() => Math.round((viewport.value.zoom || 1) * 100))

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
  const withDragged = laid.map((n) => {
    const keep = positions.get(n.id)
    return keep ? { ...n, position: keep } : n
  }) as Node[]
  // Never leave overlaps: keep user-dragged cards fixed when possible
  flowNodes.value = resolveOverlaps(withDragged, {
    fixedIds: preserveDragged ? draggedIds.value : new Set(),
  })
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
  // Nudge other cards away so the dragged card never sits on top of another
  flowNodes.value = resolveOverlaps([...flowNodes.value], {
    fixedIds: new Set([ev.node.id]),
  })
}

function resetLayout() {
  rebuildFromProps(false)
}

defineExpose({
  resetLayout,
  getDraggedIds: () => draggedIds.value,
})
</script>

<style>
.vue-flow__node {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}
.vue-flow__edge-path {
  stroke: var(--primary) !important;
}
.vue-flow__attribution {
  display: none !important;
}
</style>
