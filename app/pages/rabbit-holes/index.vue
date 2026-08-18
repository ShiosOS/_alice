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
        <NuxtLink to="/rabbit-holes/new">New Rabbit Hole</NuxtLink>
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
      description="Paste a YouTube link to start. You’ll get a few next steps from that video."
    >
      <template #action>
        <Button as-child>
          <NuxtLink to="/rabbit-holes/new">Start from a video</NuxtLink>
        </Button>
      </template>
    </EmptyState>
    <ul
      v-else
      class="ink-list-panel"
    >
      <li
        v-for="hole in holes"
        :key="hole.id"
      >
        <NuxtLink
          :to="`/rabbit-holes/${hole.id}`"
          class="ink-list-row"
        >
          <span class="min-w-0">
            <strong class="block font-medium text-foreground">{{ hole.title }}</strong>
            <span class="text-sm text-muted-foreground">
              {{ hole.status }} · updated {{ formatDate(hole.updatedAt) }}
            </span>
          </span>
          <ChevronRight
            class="ink-list-row-chevron"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
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
