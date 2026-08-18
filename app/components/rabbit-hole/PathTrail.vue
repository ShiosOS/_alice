<script setup lang="ts">
import type { GraphNode } from '#shared/types/rabbit-holes'

defineProps<{
  trail: GraphNode[]
  focusedId: string | null
}>()

const emit = defineEmits<{
  select: [nodeId: string]
}>()
</script>

<template>
  <nav
    v-if="trail.length"
    class="mt-10 border-t border-border pt-4"
    aria-label="Path"
  >
    <p class="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
      Path
    </p>
    <div class="channel-path-trail">
      <template
        v-for="(node, index) in trail"
        :key="node.id"
      >
        <span
          v-if="index > 0"
          aria-hidden="true"
        >/</span>
        <button
          type="button"
          class="channel-path-segment"
          :class="{ 'is-current': node.id === focusedId }"
          @click="emit('select', node.id)"
        >
          {{ node.title }}
        </button>
      </template>
    </div>
  </nav>
</template>
