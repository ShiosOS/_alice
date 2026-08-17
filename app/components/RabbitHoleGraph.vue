<template>
  <div class="graph-wrap">
    <div ref="viewport" class="viewport" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp">
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
          :class="{ path: pathIds.has(node.id), seed: node.videoId === seedVideoId, focused: focusedId === node.id, unavailable: !node.available }"
          @click.stop="focusedId = node.id"
        >
          <circle :cx="node.x" :cy="node.y" r="28" />
          <text :x="node.x" :y="node.y + 4" text-anchor="middle">{{ shortTitle(node.title) }}</text>
        </g>
      </svg>
    </div>

    <aside v-if="focused" class="panel">
      <h2>{{ focused.title }}</h2>
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
  </div>
</template>

<script setup lang="ts">
type GNode = {
  id: string
  videoId: string
  title: string
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

const view = reactive({ x: -40, y: -40, w: 900, h: 640 })
const dragging = ref(false)
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

  // Tree layout: depth rows
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
  // orphans
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
    if (!focusedId.value && nodes[0]) focusedId.value = nodes.find((n) => n.videoId === props.seedVideoId)?.id || nodes[0].id
  },
  { immediate: true },
)

function shortTitle(title: string) {
  return title.length > 18 ? `${title.slice(0, 16)}…` : title
}

function onPointerDown(ev: PointerEvent) {
  dragging.value = true
  last.x = ev.clientX
  last.y = ev.clientY
  ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
}
function onPointerMove(ev: PointerEvent) {
  if (!dragging.value) return
  const dx = (ev.clientX - last.x) * (view.w / 600)
  const dy = (ev.clientY - last.y) * (view.h / 420)
  view.x -= dx
  view.y -= dy
  last.x = ev.clientX
  last.y = ev.clientY
}
function onPointerUp() {
  dragging.value = false
}
</script>

<style scoped>
.graph-wrap {
  display: grid;
  gap: 1rem;
}
@media (min-width: 900px) {
  .graph-wrap {
    grid-template-columns: 1fr 16rem;
  }
}
.viewport {
  border: 1px solid var(--line);
  background: rgba(8, 12, 18, 0.65);
  height: min(70vh, 640px);
  overflow: hidden;
  touch-action: none;
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
}
.node circle {
  fill: #1a2433;
  stroke: #6b7c90;
  stroke-width: 2;
  cursor: pointer;
}
.node text {
  fill: var(--fg);
  font-size: 10px;
  pointer-events: none;
}
.node.path circle {
  stroke: var(--accent);
  stroke-width: 3;
}
.node.seed circle {
  fill: #2a2118;
  stroke: var(--accent);
}
.node.focused circle {
  stroke: #e8eef4;
}
.node.unavailable circle {
  opacity: 0.45;
}
.panel {
  border: 1px solid var(--line);
  padding: 1rem;
}
.panel h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
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
.warn {
  color: #e08888;
}
</style>
