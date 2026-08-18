<script setup lang="ts">
import type { GraphNode } from '#shared/types/rabbit-holes'

defineProps<{
  node: GraphNode
  isMutating?: boolean
}>()

const emit = defineEmits<{
  watch: []
  expand: []
}>()
</script>

<template>
  <section class="space-y-3">
    <img
      v-if="node.thumbUrl"
      class="channel-focus-thumb"
      :src="node.thumbUrl"
      :alt="node.title"
    >
    <div
      v-else
      class="channel-focus-thumb-fallback"
    >
      No thumbnail
    </div>
    <div class="space-y-1">
      <h2 class="text-xl font-semibold tracking-tight text-title">
        {{ node.title }}
      </h2>
      <p
        v-if="node.channelTitle"
        class="text-sm text-muted-foreground"
      >
        {{ node.channelTitle }}
      </p>
      <p
        v-if="!node.available"
        class="text-sm text-destructive"
      >
        Unavailable on YouTube
      </p>
    </div>
    <div class="flex flex-wrap gap-4 text-sm">
      <button
        type="button"
        class="channel-link"
        :disabled="isMutating || !node.available"
        @click="emit('watch')"
      >
        Watch on YouTube
      </button>
      <button
        type="button"
        class="channel-link"
        :disabled="isMutating"
        @click="emit('expand')"
      >
        Expand
      </button>
    </div>
  </section>
</template>
