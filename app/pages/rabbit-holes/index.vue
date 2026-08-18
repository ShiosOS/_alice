<template>
  <section>
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-display text-3xl text-foreground">
        Rabbit Holes
      </h1>
      <Button
        v-if="showHeaderCta"
        as-child
      >
        <NuxtLink to="/rabbit-holes/new">Start a new Rabbit Hole</NuxtLink>
      </Button>
    </header>

    <p
      v-if="pending"
      class="text-muted-foreground"
    >
      Loading…
    </p>
    <p
      v-else-if="error"
      class="text-destructive"
    >
      {{ error }}
    </p>
    <EmptyState
      v-else-if="!holes.length"
      title="No Rabbit Holes yet"
      description="Start from a YouTube seed and grow a map of intentional forks."
    >
      <template #action>
        <Button as-child>
          <NuxtLink to="/rabbit-holes/new">Start a new Rabbit Hole</NuxtLink>
        </Button>
      </template>
    </EmptyState>
    <ul
      v-else
      class="divide-y divide-border"
    >
      <li
        v-for="hole in holes"
        :key="hole.id"
      >
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
import { Button } from '@/components/ui/button'
import { showRabbitHoleListHeaderCta } from '~/utils/rabbit-hole-list-chrome'

definePageMeta({
  middleware: ['auth', 'terms'],
})

const { pending, error, holes } = useRabbitHoleList()

const showHeaderCta = computed(() => showRabbitHoleListHeaderCta({
  pending: pending.value,
  error: error.value,
  holeCount: holes.value.length,
}))

function formatDate(v: string) {
  try {
    return new Date(v).toLocaleString()
  }
  catch {
    return v
  }
}
</script>
