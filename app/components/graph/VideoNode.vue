<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'
import type { VideoNodeData } from '~/utils/graph-layout'
import { Handle, Position } from '@vue-flow/core'
import { cn } from '@/lib/utils'

const props = defineProps<NodeProps<VideoNodeData>>()

const n = computed(() => props.data.graphNode)
</script>

<template>
  <div
    :class="cn(
      'w-[220px] overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm',
      data.isSeed ? 'border-primary' : 'border-border',
      data.onPath && 'ring-1 ring-primary/70',
      !n.available && 'opacity-50',
      selected && 'ring-2 ring-foreground/80',
    )"
  >
    <Handle id="t" type="target" :position="Position.Top" class="!h-2 !w-2 !border-0 !bg-primary" />
    <img
      v-if="n.thumbUrl"
      :src="n.thumbUrl"
      :alt="n.title"
      class="aspect-video w-full object-cover"
      width="220"
      height="124"
      draggable="false"
    >
    <div
      v-else
      class="flex aspect-video items-center justify-center bg-secondary text-xs text-muted-foreground"
    >
      No thumbnail
    </div>
    <div class="space-y-1 p-2">
      <p class="line-clamp-2 font-display text-xs leading-snug text-foreground">
        {{ n.title }}
      </p>
      <p v-if="n.channelTitle" class="truncate text-[10px] text-muted-foreground">
        {{ n.channelTitle }}
      </p>
      <div class="flex gap-1 pt-1">
        <button
          type="button"
          class="nodrag flex-1 rounded border border-primary px-1.5 py-1 text-[10px] text-primary disabled:opacity-40"
          :disabled="data.busy || !n.available"
          @click.stop="data.onWatch(n.id)"
        >
          Watch
        </button>
        <button
          type="button"
          class="nodrag flex-1 rounded border border-border px-1.5 py-1 text-[10px] text-foreground disabled:opacity-40"
          :disabled="data.busy"
          @click.stop="data.onExpand(n.id)"
        >
          Expand
        </button>
      </div>
    </div>
    <Handle id="s" type="source" :position="Position.Bottom" class="!h-2 !w-2 !border-0 !bg-primary" />
  </div>
</template>
