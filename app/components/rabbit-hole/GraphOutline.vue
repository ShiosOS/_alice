<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import type { OutlineRow } from '~/utils/channel-graph'
import {
  outlineAncestorIds,
  visibleOutlineRows,
} from '~/utils/channel-graph'

const props = defineProps<{
  rows: OutlineRow[]
  focusedId: string | null
  pathIds: Set<string>
}>()

const emit = defineEmits<{
  select: [nodeId: string]
}>()

const collapsedIds = ref<Set<string>>(new Set())

const visibleRows = computed(() =>
  visibleOutlineRows(props.rows, collapsedIds.value),
)

watch(
  () => props.focusedId,
  (id) => {
    if (!id) return
    const ancestors = outlineAncestorIds(props.rows, id)
    if (!ancestors.length) return
    const next = new Set(collapsedIds.value)
    let changed = false
    for (const ancestorId of ancestors) {
      if (next.delete(ancestorId)) changed = true
    }
    if (changed) collapsedIds.value = next
  },
  { immediate: true },
)

function isCollapsed(nodeId: string): boolean {
  return collapsedIds.value.has(nodeId)
}

function toggleCollapse(nodeId: string) {
  const next = new Set(collapsedIds.value)
  if (next.has(nodeId)) next.delete(nodeId)
  else next.add(nodeId)
  collapsedIds.value = next
}

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
        v-for="row in visibleRows"
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
        <button
          v-if="row.hasChildren"
          type="button"
          class="channel-outline-toggle"
          :class="{ 'is-expanded': !isCollapsed(row.node.id) }"
          :aria-expanded="!isCollapsed(row.node.id)"
          :aria-label="isCollapsed(row.node.id) ? 'Expand branch' : 'Collapse branch'"
          @click.stop="toggleCollapse(row.node.id)"
        >
          <ChevronRight
            class="channel-outline-toggle-icon"
            aria-hidden="true"
          />
        </button>
        <span
          v-else
          class="channel-outline-toggle-spacer"
          aria-hidden="true"
        />
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
