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
  <section class="channel-focus space-y-3 lg:space-y-0">
    <div class="channel-focus-media">
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
    </div>
    <div class="space-y-3">
      <div class="space-y-1">
        <h2 class="text-xl font-semibold tracking-tight text-title lg:text-2xl">
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
    </div>
  </section>
</template>
