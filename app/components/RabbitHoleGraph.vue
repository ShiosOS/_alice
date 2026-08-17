<template>
  <ClientOnly>
    <div class="relative h-full min-h-0 w-full overflow-hidden bg-[#0c1117]">
      <div
        class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(1200px_700px_at_50%_10%,rgba(42,31,24,0.45),transparent_70%)]"
      />
      <VueFlow
        id="alice-graph"
        v-model:nodes="flowNodes"
        v-model:edges="flowEdges"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :default-viewport="{ zoom: 0.7 }"
        :min-zoom="0.25"
        :max-zoom="1.6"
        :default-edge-options="{ type: 'phrase' }"
        fit-view-on-init
        :fit-view-options="{ padding: 0.2 }"
        class="absolute inset-0 h-full w-full bg-transparent"
        :elevate-edges-on-select="false"
        @node-click="onNodeClick"
        @pane-click="focusedId = null"
        @node-drag-stop="onNodeDragStop"
      >
        <Panel
          position="bottom-right"
          class="mb-5 mr-5 flex items-center gap-1 rounded-md border border-primary/40 bg-[#121820]/90 px-1 py-1 text-primary shadow-lg backdrop-blur"
        >
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
        <Panel
          position="top-right"
          class="mt-4 mr-4 flex gap-2"
        >
          <slot name="toolbar" />
          <button
            type="button"
            class="rounded-md border border-primary/35 bg-[#121820]/85 px-3 py-1.5 font-display text-xs text-primary backdrop-blur hover:bg-primary/10"
            @click="resetLayout"
          >
            Reset layout
          </button>
        </Panel>
      </VueFlow>

      <NodeDetailPanel
        :focused="focused"
        :is-mutating="isMutating"
        @watch="emit('watch', $event)"
        @expand="emit('expand', $event)"
      />
    </div>
    <template #fallback>
      <div class="flex h-full items-center justify-center text-muted-foreground">
        Loading map…
      </div>
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
import NodeDetailPanel from '~/components/rabbit-hole/NodeDetailPanel.vue'
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
  isMutating?: boolean
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

const { zoomIn, zoomOut, viewport } = useVueFlow('alice-graph')
const zoomPct = computed(() => Math.round((viewport.value.zoom || 1) * 100))

const flowNodes = ref<Node[]>([])
const flowEdges = ref<Edge[]>([])
const draggedIds = ref(new Set<string>())
const focusedId = ref<string | null>(null)
const skipNextSync = ref(false)

const focused = computed(
  () => props.nodes.find(n => n.id === focusedId.value) || null,
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
    !!props.isMutating,
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

function resolveDefaultFocusedId() {
  const seedNode = props.nodes.find(n => n.videoId === props.seedVideoId)
  if (seedNode) return seedNode.id

  const firstNode = props.nodes[0]
  if (firstNode) return firstNode.id

  return null
}

watch(
  () => ({
    nodeKey: props.nodes.map(n => n.id).join('|'),
    edgeKey: props.edges.map(e => e.id).join('|'),
    pathKey: [...props.pathIds].sort().join('|'),
    isMutating: !!props.isMutating,
    seedVideoId: props.seedVideoId,
  }),
  () => {
    if (skipNextSync.value) {
      skipNextSync.value = false
      return
    }
    rebuildFromProps(true)

    const focusedStillExists = props.nodes.some(n => n.id === focusedId.value)
    if (!focusedId.value || !focusedStillExists) {
      focusedId.value = resolveDefaultFocusedId()
    }
  },
  { immediate: true },
)

function onNodeClick(ev: NodeMouseEvent) {
  focusedId.value = ev.node.id
}

function onNodeDragStop(ev: NodeDragEvent) {
  const next = new Set(draggedIds.value)
  next.add(ev.node.id)
  draggedIds.value = next
  // Nudge other cards away so the dragged card never sits on top of another
  const input: { id: string, position: { x: number, y: number } }[] = []
  for (const n of flowNodes.value) {
    input.push({ id: n.id, position: { x: n.position.x, y: n.position.y } })
  }
  const positions = resolveOverlaps(input, { fixedIds: new Set([ev.node.id]) })
  const byId = new Map(positions.map(p => [p.id, p.position]))
  for (const n of flowNodes.value) {
    const pos = byId.get(n.id)
    if (pos) {
      n.position.x = pos.x
      n.position.y = pos.y
    }
  }
  // trigger Vue Flow reactivity without cloning deep Node generics
  flowNodes.value = flowNodes.value.slice()
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
