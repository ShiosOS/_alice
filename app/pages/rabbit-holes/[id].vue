<template>
  <div class="relative h-full min-h-0 w-full">
    <p v-if="pending" class="absolute inset-0 z-10 flex items-center justify-center text-muted-foreground">
      Loading…
    </p>
    <p v-else-if="error" class="absolute inset-0 z-10 flex items-center justify-center text-destructive">
      {{ error }}
    </p>
    <template v-else-if="data">
      <div class="pointer-events-none absolute top-4 left-4 z-20 max-w-lg space-y-2">
        <div class="pointer-events-auto rounded-md border border-primary/30 bg-[#121820]/90 px-3 py-2 backdrop-blur">
          <div class="flex flex-wrap items-center gap-2">
            <input
              v-if="editing"
              v-model="draftTitle"
              class="min-w-48 flex-1 rounded border border-border bg-[#0c1117] px-2 py-1 font-display text-lg text-foreground"
              @keyup.enter="saveTitle"
            >
            <h1 v-else class="font-display text-xl text-[#f0e6d4]">
              {{ data.rabbitHole.title }}
            </h1>
            <button
              v-if="!editing"
              type="button"
              class="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              @click="startEdit"
            >
              Rename
            </button>
            <button
              v-else
              type="button"
              class="rounded border border-primary/50 px-2 py-1 text-xs text-primary"
              @click="saveTitle"
            >
              Save
            </button>
            <button
              type="button"
              class="rounded border border-destructive/50 px-2 py-1 text-xs text-destructive"
              @click="remove"
            >
              Delete
            </button>
          </div>
          <p class="mt-1 text-xs text-muted-foreground">
            Status: {{ data.rabbitHole.status }}
          </p>
          <button
            v-if="data.rabbitHole.status === 'incomplete'"
            type="button"
            class="mt-2 rounded border border-primary/40 px-2 py-1 text-xs text-primary"
            :disabled="busy"
            @click="retryBootstrap"
          >
            Retry bootstrap
          </button>
        </div>
      </div>

      <RabbitHoleGraph
        :nodes="data.nodes"
        :edges="data.edges"
        :path-ids="pathIds"
        :seed-video-id="data.rabbitHole.seedVideoId"
        :busy="busy"
        @expand="onExpand"
        @watch="onWatch"
      />
      <div class="absolute bottom-3 left-4 z-20">
        <YoutubeAttribution />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type {
  ExpandPatch,
  RabbitHoleGraph,
  RabbitHoleRenameResponse,
  WatchResponse,
} from '#shared/types/rabbit-holes'

definePageMeta({
  fullBleed: true,
})

const route = useRoute()
const id = computed(() => String(route.params.id))

const { loggedIn, user } = useUserSession()
if (import.meta.client) {
  watchEffect(() => {
    if (!loggedIn.value) navigateTo('/')
    else if (user.value && !user.value.termsAccepted) navigateTo('/terms-accept')
  })
}

const pending = ref(true)
const error = ref('')
const data = ref<RabbitHoleGraph | null>(null)
const busy = ref(false)
const editing = ref(false)
const draftTitle = ref('')

const pathIds = computed(() => new Set((data.value?.path || []).map((p) => p.nodeId)))

async function load() {
  pending.value = true
  error.value = ''
  try {
    data.value = await $fetch<RabbitHoleGraph>(`/api/rabbit-holes/${id.value}`)
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
    const res = await $fetch<RabbitHoleRenameResponse>(`/api/rabbit-holes/${id.value}`, {
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
    const patch = await $fetch<ExpandPatch>(
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
    const res = await $fetch<WatchResponse>(
      `/api/rabbit-holes/${id.value}/nodes/${nodeId}/watch`,
      { method: 'POST' },
    )
    if (data.value && !data.value.path.some((p) => p.nodeId === nodeId && p.kind === 'visited')) {
      data.value.path = [...data.value.path, {
        id: `local-${nodeId}`,
        rabbitHoleId: data.value.rabbitHole.id,
        nodeId,
        kind: 'visited',
        createdAt: new Date().toISOString(),
      }]
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
