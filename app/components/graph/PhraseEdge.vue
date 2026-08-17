<script setup lang="ts">
import type { EdgeProps } from '@vue-flow/core'
import type { PhraseEdgeData } from '~/utils/graph-layout'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'

const props = defineProps<EdgeProps<PhraseEdgeData>>()

const path = computed(() => getBezierPath({
  ...props,
  curvature: 0.25,
}))
</script>

<template>
  <BaseEdge
    :id="id"
    :path="path[0]"
    :style="{
      stroke: 'var(--primary)',
      strokeWidth: 1.25,
      opacity: 0.85,
    }"
  />
  <EdgeLabelRenderer>
    <div
      class="nodrag nopan pointer-events-none absolute origin-center rounded bg-[#0f1419]/85 px-1.5 py-0.5 font-display text-[11px] italic tracking-wide text-primary"
      :style="{
        transform: `translate(-50%, -50%) translate(${path[1]}px, ${path[2]}px)`,
      }"
    >
      {{ data?.phrase }}
    </div>
  </EdgeLabelRenderer>
</template>
