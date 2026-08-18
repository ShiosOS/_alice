<script setup lang="ts">
import type { GraphNode } from '#shared/types/rabbit-holes'

withDefaults(defineProps<{
  trail: GraphNode[]
  focusedId: string | null
  stacked?: boolean
}>(), {
  stacked: false,
})

const emit = defineEmits<{
  select: [nodeId: string]
}>()
</script>

<template>
  <nav
    v-if="trail.length"
    aria-label="Path watched"
  >
    <p class="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
      Path watched
    </p>
    <div
      class="channel-path-trail"
      :class="{ 'is-stack': stacked }"
    >
      <template
        v-for="(node, index) in trail"
        :key="node.id"
      >
        <span
          v-if="!stacked && index > 0"
          aria-hidden="true"
        >/</span>
        <button
          type="button"
          class="channel-path-segment text-left"
          :class="{ 'is-current': node.id === focusedId }"
          @click="emit('select', node.id)"
        >
          {{ node.title }}
        </button>
      </template>
    </div>
  </nav>
</template>
