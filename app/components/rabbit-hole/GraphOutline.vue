<script setup lang="ts">
import type { OutlineRow } from '~/utils/channel-graph'

defineProps<{
  rows: OutlineRow[]
  focusedId: string | null
  pathIds: Set<string>
}>()

const emit = defineEmits<{
  select: [nodeId: string]
}>()
</script>

<template>
  <nav
    v-if="rows.length"
    class="channel-outline"
    aria-label="Hole outline"
  >
    <p class="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
      All connections
    </p>
    <ul class="channel-outline-list">
      <li
        v-for="row in rows"
        :key="row.node.id"
        class="channel-outline-row"
        :style="{ '--outline-depth': row.depth }"
      >
        <p
          v-if="row.inboundPhrase"
          class="channel-outline-phrase"
        >
          {{ row.inboundPhrase }}
        </p>
        <button
          type="button"
          class="channel-outline-node"
          :class="{
            'is-current': row.node.id === focusedId,
            'is-on-path': pathIds.has(row.node.id),
          }"
          @click="emit('select', row.node.id)"
        >
          {{ row.node.title }}
        </button>
      </li>
    </ul>
  </nav>
</template>
