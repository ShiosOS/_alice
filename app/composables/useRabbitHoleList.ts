import type { RabbitHoleList, RabbitHoleSummary } from '#shared/types/rabbit-holes'

export function useRabbitHoleList() {
  const pending = ref(true)
  const error = ref('')
  const holes = ref<RabbitHoleSummary[]>([])

  async function load() {
    pending.value = true
    error.value = ''
    try {
      const res = await $fetch<RabbitHoleList>('/api/rabbit-holes')
      holes.value = res.rabbitHoles
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load'
    }
    finally {
      pending.value = false
    }
  }

  onMounted(load)

  return {
    pending,
    error,
    holes,
    load,
  }
}
