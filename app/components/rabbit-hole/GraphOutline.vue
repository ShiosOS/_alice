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

/** Ancestor rail columns (everything before the elbow). */
function ancestorGuides(row: OutlineRow): boolean[] {
  if (row.depth <= 1) return []
  return row.guides.slice(0, -1)
}

function isLastSibling(row: OutlineRow): boolean {
  if (row.depth === 0) return true
  return !row.guides[row.guides.length - 1]
}
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
        :data-depth="row.depth"
        :style="{ '--outline-depth': row.depth }"
      >
        <div
          class="channel-outline-gutter"
          aria-hidden="true"
        >
          <span
            v-for="(continues, level) in ancestorGuides(row)"
            :key="level"
            class="channel-outline-rail"
            :class="{ 'has-line': continues }"
          />
          <span
            v-if="row.depth === 0"
            class="channel-outline-root-mark"
          />
          <span
            v-else
            class="channel-outline-elbow"
            :class="{ 'is-last': isLastSibling(row) }"
          />
        </div>
        <div class="channel-outline-body">
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
              'is-root': row.depth === 0,
              'is-current': row.node.id === focusedId,
              'is-on-path': pathIds.has(row.node.id),
            }"
            @click="emit('select', row.node.id)"
          >
            {{ row.node.title }}
          </button>
        </div>
      </li>
    </ul>
  </nav>
</template>
