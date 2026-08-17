<script setup lang="ts">
import type { EdgeProps } from '@vue-flow/core'
import type { PhraseEdgeData } from '~/utils/graph-layout'
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@vue-flow/core'

const props = defineProps<EdgeProps<PhraseEdgeData>>()

/** Orthogonal straight segments with rounded bends. */
const path = computed(() => getSmoothStepPath({
  ...props,
  borderRadius: 24,
  offset: 20,
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
      fill: 'none',
    }"
  />
  <EdgeLabelRenderer>
    <div
      class="graph-edge-label nodrag nopan"
      :style="{
        transform: `translate(-50%, -50%) translate(${path[1]}px, ${path[2]}px)`,
      }"
    >
      {{ data?.phrase }}
    </div>
  </EdgeLabelRenderer>
</template>
