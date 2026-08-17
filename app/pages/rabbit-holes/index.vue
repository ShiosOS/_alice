<template>
  <section>
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-display text-3xl text-foreground">Rabbit Holes</h1>
      <Button as-child>
        <NuxtLink to="/rabbit-holes/new">Start a new Rabbit Hole</NuxtLink>
      </Button>
    </header>

    <p v-if="pending" class="text-muted-foreground">Loading…</p>
    <p v-else-if="error" class="text-destructive">{{ error }}</p>
    <EmptyState v-else-if="!holes.length">
      <template #title>No Rabbit Holes yet</template>
      <template #description>
        Start from a YouTube seed and grow a map of intentional forks.
      </template>
      <template #action>
        <Button as-child>
          <NuxtLink to="/rabbit-holes/new">Start a new Rabbit Hole</NuxtLink>
        </Button>
      </template>
    </EmptyState>
    <ul v-else class="divide-y divide-border">
      <li v-for="hole in holes" :key="hole.id">
        <NuxtLink
          :to="`/rabbit-holes/${hole.id}`"
          class="flex flex-col gap-1 py-3.5 transition-colors hover:text-primary"
        >
          <strong class="font-medium text-foreground">{{ hole.title }}</strong>
          <span class="text-sm text-muted-foreground">
            {{ hole.status }} · updated {{ formatDate(hole.updatedAt) }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { RabbitHoleList, RabbitHoleSummary } from '#shared/types/rabbit-holes'
import { Button } from '@/components/ui/button'

const { loggedIn, user } = useUserSession()

if (import.meta.client) {
  watchEffect(() => {
    if (!loggedIn.value) navigateTo('/')
    else if (user.value && !user.value.termsAccepted) navigateTo('/terms-accept')
  })
}

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

function formatDate(v: string) {
  try {
    return new Date(v).toLocaleString()
  }
  catch {
    return v
  }
}
</script>
