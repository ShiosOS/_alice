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
      'graph-video-node',
      data.isSeed && 'is-seed',
      data.onPath && 'is-on-path',
      selected && 'is-selected',
      !n.available && 'is-unavailable',
    )"
  >
    <Handle
      id="t"
      type="target"
      :position="Position.Top"
      class="graph-handle"
    />
    <div class="relative shrink-0">
      <img
        v-if="n.thumbUrl"
        :src="n.thumbUrl"
        :alt="n.title"
        class="graph-video-thumb"
        width="260"
        height="146"
        draggable="false"
      >
      <div
        v-else
        class="graph-video-thumb-fallback"
      >
        No thumbnail
      </div>
      <span
        v-if="data.onPath"
        class="graph-path-badge"
        aria-label="On Path"
      >
        ✓
      </span>
    </div>
    <div class="space-y-1 px-3 py-2.5">
      <p class="graph-node-title">
        {{ n.title }}
      </p>
      <p
        v-if="n.channelTitle"
        class="graph-node-channel"
      >
        {{ n.channelTitle }}
      </p>
    </div>
    <Handle
      id="s"
      type="source"
      :position="Position.Bottom"
      class="graph-handle"
    />
  </div>
</template>
