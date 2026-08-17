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
      'box-border flex h-[210px] w-[260px] flex-col overflow-hidden rounded-lg border bg-[#121820]/95 text-card-foreground shadow-[0_0_0_1px_rgba(196,165,116,0.08)]',
      'border-primary/55',
      data.isSeed && 'border-primary shadow-[0_0_24px_rgba(196,165,116,0.18)]',
      data.onPath && 'border-primary',
      selected && 'border-primary ring-1 ring-primary/80',
      !n.available && 'opacity-45',
    )"
  >
    <Handle
      id="t"
      type="target"
      :position="Position.Top"
      class="!h-1.5 !w-1.5 !border-0 !bg-primary !opacity-0"
    />
    <div class="relative shrink-0">
      <img
        v-if="n.thumbUrl"
        :src="n.thumbUrl"
        :alt="n.title"
        class="aspect-[16/9] h-[146px] w-full object-cover"
        width="260"
        height="146"
        draggable="false"
      >
      <div
        v-else
        class="flex h-[146px] w-full items-center justify-center bg-[#1a2433] text-xs text-muted-foreground"
      >
        No thumbnail
      </div>
      <span
        v-if="data.onPath"
        class="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
        aria-label="On Path"
      >
        ✓
      </span>
    </div>
    <div class="space-y-1 px-3 py-2.5">
      <p class="line-clamp-2 font-display text-[13px] leading-snug text-[#f0e6d4]">
        {{ n.title }}
      </p>
      <p v-if="n.channelTitle" class="truncate text-[11px] text-muted-foreground">
        {{ n.channelTitle }}
      </p>
    </div>
    <Handle
      id="s"
      type="source"
      :position="Position.Bottom"
      class="!h-1.5 !w-1.5 !border-0 !bg-primary !opacity-0"
    />
  </div>
</template>
