<script setup lang="ts">
import type { GraphNode } from '#shared/types/rabbit-holes'
import { Button } from '@/components/ui/button'

defineProps<{
  focused: GraphNode | null
  isMutating?: boolean
}>()

const emit = defineEmits<{
  watch: [nodeId: string]
  expand: [nodeId: string]
}>()
</script>

<template>
  <aside
    v-if="focused"
    class="graph-detail-panel"
  >
    <div class="flex gap-3">
      <img
        v-if="focused.thumbUrl"
        class="h-16 w-28 shrink-0 rounded object-cover"
        :src="focused.thumbUrl"
        :alt="focused.title"
        width="112"
        height="64"
      >
      <div class="min-w-0 flex-1">
        <h2 class="font-display text-base leading-snug text-title">
          {{ focused.title }}
        </h2>
        <p
          v-if="focused.channelTitle"
          class="mt-0.5 truncate text-xs text-muted-foreground"
        >
          {{ focused.channelTitle }}
        </p>
        <p
          v-if="!focused.available"
          class="mt-1 text-xs text-destructive"
        >
          Unavailable on YouTube
        </p>
      </div>
    </div>
    <div class="mt-3 flex gap-2">
      <Button
        class="flex-1"
        :disabled="isMutating || !focused.available"
        @click="emit('watch', focused.id)"
      >
        Watch on YouTube
      </Button>
      <Button
        variant="outline"
        class="flex-1 border-primary/50 text-primary hover:bg-primary/10"
        :disabled="isMutating"
        @click="emit('expand', focused.id)"
      >
        Expand
      </Button>
    </div>
  </aside>
</template>
