<template>
  <section v-if="pending">Loading…</section>
  <section v-else-if="error" class="error">{{ error }}</section>
  <section v-else-if="data" class="hole">
    <header class="head">
      <div class="title-row">
        <input
          v-if="editing"
          v-model="draftTitle"
          class="title-input"
          @keyup.enter="saveTitle"
        >
        <h1 v-else>{{ data.rabbitHole.title }}</h1>
        <div class="actions">
          <button v-if="!editing" type="button" @click="startEdit">Rename</button>
          <button v-else type="button" @click="saveTitle">Save</button>
          <button type="button" class="danger" @click="remove">Delete</button>
        </div>
      </div>
      <p class="meta">Status: {{ data.rabbitHole.status }}</p>
      <button
        v-if="data.rabbitHole.status === 'incomplete'"
        type="button"
        :disabled="busy"
        @click="retryBootstrap"
      >
        Retry bootstrap
      </button>
    </header>

    <RabbitHoleGraph
      :nodes="data.nodes"
      :edges="data.edges"
      :path-ids="pathIds"
      :seed-video-id="data.rabbitHole.seedVideoId"
      :busy="busy"
      @expand="onExpand"
      @watch="onWatch"
    />
    <YoutubeAttribution />
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => String(route.params.id))

const { loggedIn, user } = useUserSession()
if (import.meta.client) {
  watchEffect(() => {
    if (!loggedIn.value) navigateTo('/')
    else if (user.value && !user.value.termsAccepted) navigateTo('/terms-accept')
  })
}

type Node = {
  id: string
  videoId: string
  title: string
  thumbUrl: string | null
  available: boolean
}
type Edge = {
  id: string
  fromNodeId: string
  toNodeId: string
  phrase: string
}
type PathEvent = { nodeId: string, kind: string }
type HolePayload = {
  rabbitHole: { id: string, title: string, status: string, seedVideoId: string }
  nodes: Node[]
  edges: Edge[]
  path: PathEvent[]
}

const pending = ref(true)
const error = ref('')
const data = ref<HolePayload | null>(null)
const busy = ref(false)
const editing = ref(false)
const draftTitle = ref('')

const pathIds = computed(() => new Set((data.value?.path || []).map((p) => p.nodeId)))

async function load() {
  pending.value = true
  error.value = ''
  try {
    data.value = await $fetch<HolePayload>(`/api/rabbit-holes/${id.value}`)
    draftTitle.value = data.value.rabbitHole.title
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load'
  }
  finally {
    pending.value = false
  }
}

onMounted(load)
watch(id, load)

function startEdit() {
  editing.value = true
  draftTitle.value = data.value?.rabbitHole.title || ''
}

async function saveTitle() {
  if (!data.value) return
  busy.value = true
  try {
    const res = await $fetch<{ rabbitHole: { title: string } }>(`/api/rabbit-holes/${id.value}`, {
      method: 'PATCH',
      body: { title: draftTitle.value },
    })
    data.value.rabbitHole.title = res.rabbitHole.title
    editing.value = false
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Rename failed'
  }
  finally {
    busy.value = false
  }
}

async function remove() {
  if (!confirm('Delete this Rabbit Hole?')) return
  busy.value = true
  try {
    await $fetch(`/api/rabbit-holes/${id.value}`, { method: 'DELETE' })
    await navigateTo('/rabbit-holes')
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Delete failed'
  }
  finally {
    busy.value = false
  }
}

async function retryBootstrap() {
  busy.value = true
  error.value = ''
  try {
    await $fetch(`/api/rabbit-holes/${id.value}/bootstrap`, { method: 'POST' })
    await load()
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Bootstrap retry failed'
  }
  finally {
    busy.value = false
  }
}

async function onExpand(nodeId: string) {
  busy.value = true
  error.value = ''
  try {
    const patch = await $fetch<{ nodes: Node[], edges: Edge[] }>(
      `/api/rabbit-holes/${id.value}/nodes/${nodeId}/expand`,
      { method: 'POST' },
    )
    if (!data.value) return
    const nodeMap = new Map(data.value.nodes.map((n) => [n.id, n]))
    for (const n of patch.nodes) nodeMap.set(n.id, n)
    data.value.nodes = [...nodeMap.values()]
    const edgeMap = new Map(data.value.edges.map((e) => [e.id, e]))
    for (const e of patch.edges) edgeMap.set(e.id, e)
    data.value.edges = [...edgeMap.values()]
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Expand failed'
  }
  finally {
    busy.value = false
  }
}

async function onWatch(nodeId: string) {
  busy.value = true
  error.value = ''
  try {
    const res = await $fetch<{ watchUrl: string }>(
      `/api/rabbit-holes/${id.value}/nodes/${nodeId}/watch`,
      { method: 'POST' },
    )
    if (data.value && !data.value.path.some((p) => p.nodeId === nodeId && p.kind === 'visited')) {
      data.value.path = [...data.value.path, { nodeId, kind: 'visited' }]
    }
    window.open(res.watchUrl, '_blank', 'noopener,noreferrer')
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Watch failed'
  }
  finally {
    busy.value = false
  }
}
</script>

<style scoped>
.head {
  margin-bottom: 1.25rem;
}
.title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
}
.title-input {
  flex: 1;
  min-width: 12rem;
  font: inherit;
  font-size: 1.5rem;
  padding: 0.35rem 0.5rem;
  background: #121820;
  border: 1px solid var(--line);
  color: var(--fg);
}
.actions {
  display: flex;
  gap: 0.5rem;
}
button {
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--fg);
  font: inherit;
  cursor: pointer;
}
.danger {
  border-color: #e08888;
  color: #e08888;
}
.meta {
  color: var(--muted);
}
.error {
  color: #e08888;
}
</style>
