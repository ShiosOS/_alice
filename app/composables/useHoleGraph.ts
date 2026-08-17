import type {
  ExpandPatch,
  RabbitHoleGraph,
  RabbitHoleRenameResponse,
  WatchResponse,
} from '#shared/types/rabbit-holes'
import type { ComputedRef, Ref } from 'vue'
import { mergeExpandPatch } from '~/utils/merge-expand-patch'

export function useHoleGraph(id: Ref<string> | ComputedRef<string>) {
  const pending = ref(true)
  const error = ref('')
  const holeGraph = ref<RabbitHoleGraph | null>(null)
  const isMutating = ref(false)
  const editing = ref(false)
  const draftTitle = ref('')

  const pathIds = computed(
    () => new Set((holeGraph.value?.path || []).map(entry => entry.nodeId)),
  )

  async function load() {
    pending.value = true
    error.value = ''
    try {
      holeGraph.value = await $fetch<RabbitHoleGraph>(`/api/rabbit-holes/${id.value}`)
      draftTitle.value = holeGraph.value.rabbitHole.title
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load'
    }
    finally {
      pending.value = false
    }
  }

  function startEdit() {
    editing.value = true
    draftTitle.value = holeGraph.value?.rabbitHole.title || ''
  }

  async function saveTitle() {
    if (!holeGraph.value) return
    isMutating.value = true
    try {
      const res = await $fetch<RabbitHoleRenameResponse>(`/api/rabbit-holes/${id.value}`, {
        method: 'PATCH',
        body: { title: draftTitle.value },
      })
      holeGraph.value.rabbitHole.title = res.rabbitHole.title
      editing.value = false
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Rename failed'
    }
    finally {
      isMutating.value = false
    }
  }

  async function deleteRabbitHole() {
    if (!confirm('Delete this Rabbit Hole?')) return
    isMutating.value = true
    try {
      await $fetch(`/api/rabbit-holes/${id.value}`, { method: 'DELETE' })
      await navigateTo('/rabbit-holes')
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Delete failed'
    }
    finally {
      isMutating.value = false
    }
  }

  async function retryBootstrap() {
    isMutating.value = true
    error.value = ''
    try {
      await $fetch(`/api/rabbit-holes/${id.value}/bootstrap`, { method: 'POST' })
      await load()
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Bootstrap retry failed'
    }
    finally {
      isMutating.value = false
    }
  }

  async function onExpand(nodeId: string) {
    isMutating.value = true
    error.value = ''
    try {
      const patch = await $fetch<ExpandPatch>(
        `/api/rabbit-holes/${id.value}/nodes/${nodeId}/expand`,
        { method: 'POST' },
      )
      if (!holeGraph.value) return
      holeGraph.value = mergeExpandPatch(holeGraph.value, patch)
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Expand failed'
    }
    finally {
      isMutating.value = false
    }
  }

  async function onWatch(nodeId: string) {
    isMutating.value = true
    error.value = ''
    try {
      const res = await $fetch<WatchResponse>(
        `/api/rabbit-holes/${id.value}/nodes/${nodeId}/watch`,
        { method: 'POST' },
      )

      const graph = holeGraph.value
      if (graph) {
        const alreadyVisited = graph.path.some(
          entry => entry.nodeId === nodeId && entry.kind === 'visited',
        )
        if (!alreadyVisited) {
          graph.path = [
            ...graph.path,
            {
              id: `local-${nodeId}`,
              rabbitHoleId: graph.rabbitHole.id,
              nodeId,
              kind: 'visited',
              createdAt: new Date().toISOString(),
            },
          ]
        }
      }

      window.open(res.watchUrl, '_blank', 'noopener,noreferrer')
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Watch failed'
    }
    finally {
      isMutating.value = false
    }
  }

  onMounted(load)
  watch(id, load)

  return {
    pending,
    error,
    holeGraph,
    isMutating,
    editing,
    draftTitle,
    pathIds,
    load,
    startEdit,
    saveTitle,
    deleteRabbitHole,
    retryBootstrap,
    onExpand,
    onWatch,
  }
}
