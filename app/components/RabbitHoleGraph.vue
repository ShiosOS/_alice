<template>
  <div class="graph-wrap">
    <div
      ref="viewportEl"
      class="viewport"
      @pointerdown="onPanDown"
      @pointermove="onPanMove"
      @pointerup="onPanUp"
      @pointercancel="onPanUp"
      @lostpointercapture="onPanUp"
    >
      <svg class="canvas" :viewBox="`${view.x} ${view.y} ${view.w} ${view.h}`">
        <g v-for="edge in layout.edges" :key="edge.id">
          <line
            :x1="edge.x1"
            :y1="edge.y1"
            :x2="edge.x2"
            :y2="edge.y2"
            class="edge-line"
          />
          <text :x="edge.mx" :y="edge.my" class="phrase">{{ edge.phrase }}</text>
        </g>
        <g
          v-for="node in layout.nodes"
          :key="node.id"
          class="node"
          :class="{
            path: pathIds.has(node.id),
            seed: node.videoId === seedVideoId,
            focused: focusedId === node.id,
            unavailable: !node.available,
          }"
          @pointerdown.stop="onNodePointerDown($event, node.id)"
        >
          <!-- Larger invisible hit target -->
          <circle class="hit" :cx="node.x" :cy="node.y" r="36" />
          <circle class="dot" :cx="node.x" :cy="node.y" r="28" />
          <text :x="node.x" :y="node.y + 4" text-anchor="middle">{{ shortTitle(node.title) }}</text>
        </g>
      </svg>
    </div>

    <aside v-if="focused" ref="panelEl" class="panel">
      <img
        v-if="focused.thumbUrl"
        class="thumb"
        :src="focused.thumbUrl"
        :alt="focused.title"
        width="320"
        height="180"
      >
      <h2>{{ focused.title }}</h2>
      <p v-if="focused.channelTitle" class="channel">{{ focused.channelTitle }}</p>
      <p v-if="!focused.available" class="warn">Unavailable on YouTube</p>
      <div class="panel-actions">
        <button type="button" :disabled="busy || !focused.available" @click="$emit('watch', focused.id)">
          Watch on YouTube
        </button>
        <button type="button" :disabled="busy" @click="$emit('expand', focused.id)">
          Expand
        </button>
      </div>
    </aside>
    <aside v-else class="panel muted-panel">
      <p>Select a node to see details, watch on YouTube, or expand.</p>
    </aside>
  </div>
</template>

<script setup lang="ts">
type GNode = {
  id: string
  videoId: string
  title: string
  channelTitle?: string | null
  thumbUrl: string | null
  available: boolean
}
type GEdge = {
  id: string
  fromNodeId: string
  toNodeId: string
  phrase: string
}

const props = defineProps<{
  nodes: GNode[]
  edges: GEdge[]
  pathIds: Set<string>
  seedVideoId: string
  busy?: boolean
}>()

defineEmits<{
  expand: [nodeId: string]
  watch: [nodeId: string]
}>()

const focusedId = ref<string | null>(null)
const focused = computed(() => props.nodes.find((n) => n.id === focusedId.value) || null)
const panelEl = ref<HTMLElement | null>(null)
const viewportEl = ref<HTMLElement | null>(null)

const view = reactive({ x: -40, y: -40, w: 900, h: 640 })
const panning = ref(false)
const panMoved = ref(false)
const last = reactive({ x: 0, y: 0 })

const layout = computed(() => {
  const children = new Map<string, string[]>()
  for (const e of props.edges) {
    const list = children.get(e.fromNodeId) || []
    list.push(e.toNodeId)
    children.set(e.fromNodeId, list)
  }
  const seed = props.nodes.find((n) => n.videoId === props.seedVideoId) || props.nodes[0]
  const pos = new Map<string, { x: number, y: number }>()
  if (!seed) {
    return { nodes: [] as Array<GNode & { x: number, y: number }>, edges: [] as Array<GEdge & { x1: number, y1: number, x2: number, y2: number, mx: number, my: number }> }
  }

  const depth = new Map<string, number>()
  const queue = [seed.id]
  depth.set(seed.id, 0)
  while (queue.length) {
    const id = queue.shift()!
    for (const child of children.get(id) || []) {
      if (!depth.has(child)) {
        depth.set(child, (depth.get(id) || 0) + 1)
        queue.push(child)
      }
    }
  }
  const layers = new Map<number, string[]>()
  for (const n of props.nodes) {
    const d = depth.get(n.id) ?? 1
    const list = layers.get(d) || []
    list.push(n.id)
    layers.set(d, list)
  }
  for (const [d, ids] of layers) {
    ids.forEach((id, i) => {
      const count = ids.length
      const x = 120 + (d * 220)
      const y = 80 + (i - (count - 1) / 2) * 110 + 280
      pos.set(id, { x, y })
    })
  }
  for (const n of props.nodes) {
    if (!pos.has(n.id)) pos.set(n.id, { x: 80, y: 80 + pos.size * 40 })
  }

  const laidNodes = props.nodes.map((n) => ({ ...n, ...pos.get(n.id)! }))
  const laidEdges = props.edges.map((e) => {
    const a = pos.get(e.fromNodeId) || { x: 0, y: 0 }
    const b = pos.get(e.toNodeId) || { x: 0, y: 0 }
    return {
      ...e,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      mx: (a.x + b.x) / 2,
      my: (a.y + b.y) / 2 - 8,
    }
  })
  return { nodes: laidNodes, edges: laidEdges }
})

watch(
  () => props.nodes,
  (nodes) => {
    if (!nodes.length) {
      focusedId.value = null
      return
    }
    const stillThere = focusedId.value && nodes.some((n) => n.id === focusedId.value)
    if (!stillThere) {
      focusedId.value = nodes.find((n) => n.videoId === props.seedVideoId)?.id || nodes[0]?.id || null
    }
  },
  { immediate: true },
)

watch(focusedId, async () => {
  if (!import.meta.client) return
  await nextTick()
  panelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})

function shortTitle(title: string) {
  return title.length > 18 ? `${title.slice(0, 16)}…` : title
}

function onNodePointerDown(ev: PointerEvent, id: string) {
  // Nodes never start a pan; selection is immediate.
  if (ev.button !== undefined && ev.button !== 0) return
  focusedId.value = id
}

function onPanDown(ev: PointerEvent) {
  if (ev.button !== undefined && ev.button !== 0) return
  panning.value = true
  panMoved.value = false
  last.x = ev.clientX
  last.y = ev.clientY
  ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
}
function onPanMove(ev: PointerEvent) {
  if (!panning.value) return
  const dxPx = ev.clientX - last.x
  const dyPx = ev.clientY - last.y
  if (Math.abs(dxPx) + Math.abs(dyPx) > 3) panMoved.value = true
  if (!panMoved.value) return
  const dx = dxPx * (view.w / 600)
  const dy = dyPx * (view.h / 420)
  view.x -= dx
  view.y -= dy
  last.x = ev.clientX
  last.y = ev.clientY
}
function onPanUp() {
  panning.value = false
  panMoved.value = false
}
</script>

<style scoped>
.graph-wrap {
  display: grid;
  gap: 1rem;
}
@media (min-width: 900px) {
  .graph-wrap {
    grid-template-columns: 1fr minmax(16rem, 20rem);
    align-items: start;
  }
}
.viewport {
  border: 1px solid var(--line);
  background: rgba(8, 12, 18, 0.65);
  height: min(70vh, 640px);
  overflow: hidden;
  touch-action: none;
  cursor: grab;
}
.viewport:active {
  cursor: grabbing;
}
.canvas {
  width: 100%;
  height: 100%;
}
.edge-line {
  stroke: #3a4b61;
  stroke-width: 2;
}
.phrase {
  fill: var(--muted);
  font-size: 11px;
  text-anchor: middle;
  pointer-events: none;
}
.node {
  cursor: pointer;
}
.node .hit {
  fill: transparent;
  stroke: none;
}
.node .dot {
  fill: #1a2433;
  stroke: #6b7c90;
  stroke-width: 2;
  pointer-events: none;
}
.node text {
  fill: var(--fg);
  font-size: 10px;
  pointer-events: none;
}
.node.path .dot {
  stroke: var(--accent);
  stroke-width: 3;
}
.node.seed .dot {
  fill: #2a2118;
  stroke: var(--accent);
}
.node.focused .dot {
  stroke: #e8eef4;
  stroke-width: 3;
}
.node.unavailable {
  opacity: 0.45;
}
.panel {
  border: 1px solid var(--line);
  padding: 1rem;
  background: rgba(8, 12, 18, 0.55);
}
.muted-panel {
  color: var(--muted);
}
.thumb {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  margin-bottom: 0.75rem;
  border: 1px solid var(--line);
}
.panel h2 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  line-height: 1.3;
}
.channel {
  margin: 0 0 0.75rem;
  color: var(--muted);
  font-size: 0.9rem;
}
.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.panel button {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font: inherit;
  cursor: pointer;
}
.panel button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.warn {
  color: #e08888;
}
</style>
