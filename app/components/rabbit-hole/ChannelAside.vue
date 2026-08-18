<script setup lang="ts">
import type { GraphNode } from '#shared/types/rabbit-holes'
import type { OutlineRow } from '~/utils/channel-graph'
import GraphOutline from '~/components/rabbit-hole/GraphOutline.vue'
import PathTrail from '~/components/rabbit-hole/PathTrail.vue'

defineProps<{
  outlineRows: OutlineRow[]
  trail: GraphNode[]
  focusedId: string | null
  pathIds: Set<string>
}>()

const emit = defineEmits<{
  select: [nodeId: string]
}>()
</script>

<template>
  <aside class="channel-aside mt-10 border-t border-border pt-4 lg:mt-0">
    <GraphOutline
      :rows="outlineRows"
      :focused-id="focusedId"
      :path-ids="pathIds"
      @select="emit('select', $event)"
    />
    <PathTrail
      class="mt-8"
      :trail="trail"
      :focused-id="focusedId"
      stacked
      @select="emit('select', $event)"
    />
  </aside>
</template>
