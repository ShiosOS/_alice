<script setup lang="ts">
import type { ChainStep } from '~/utils/channel-graph'

defineProps<{
  /** Ancestor steps only (not the focused node). */
  chain: ChainStep[]
}>()

const emit = defineEmits<{
  select: [nodeId: string]
}>()
</script>

<template>
  <nav
    v-if="chain.length"
    class="channel-shaft"
    aria-label="Connections"
  >
    <p class="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
      How you got here
    </p>
    <ol class="channel-shaft-list">
      <li
        v-for="(step, index) in chain"
        :key="step.node.id"
        class="channel-shaft-step"
      >
        <p
          v-if="step.inboundPhrase"
          class="channel-shaft-phrase"
        >
          {{ step.inboundPhrase }}
        </p>
        <button
          type="button"
          class="channel-shaft-node"
          :class="{ 'is-seed': index === 0 }"
          @click="emit('select', step.node.id)"
        >
          <span
            class="channel-shaft-dot"
            aria-hidden="true"
          />
          <span class="min-w-0 truncate">{{ step.node.title }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>
