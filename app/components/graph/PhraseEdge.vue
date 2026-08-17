<script setup lang="ts">
import type { EdgeProps } from '@vue-flow/core'
import type { PhraseEdgeData } from '~/utils/graph-layout'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'

const props = defineProps<EdgeProps<PhraseEdgeData>>()

const path = computed(() => getBezierPath(props))
</script>

<template>
  <BaseEdge
    :id="id"
    :path="path[0]"
    :marker-end="markerEnd"
    :style="{ stroke: 'var(--border)', strokeWidth: 2 }"
  />
  <EdgeLabelRenderer>
    <div
      class="nodrag nopan pointer-events-none absolute origin-center px-1 text-[10px] italic text-muted-foreground"
      :style="{
        transform: `translate(-50%, -50%) translate(${path[1]}px, ${path[2]}px)`,
      }"
    >
      {{ data?.phrase }}
    </div>
  </EdgeLabelRenderer>
</template>
