<script setup lang="ts">
import type { ChannelFork } from '~/utils/channel-graph'

defineProps<{
  forks: ChannelFork[]
}>()

const emit = defineEmits<{
  select: [nodeId: string]
}>()
</script>

<template>
  <section
    v-if="forks.length"
    class="channel-forks"
  >
    <p class="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
      From here
    </p>
    <ul class="channel-forks-list">
      <li
        v-for="fork in forks"
        :key="fork.edge.id"
        class="channel-fork-item"
      >
        <p class="channel-shaft-phrase channel-fork-phrase">
          {{ fork.edge.phrase }}
        </p>
        <button
          type="button"
          class="channel-block-row channel-fork-row"
          @click="emit('select', fork.node.id)"
        >
          <img
            v-if="fork.node.thumbUrl"
            class="h-14 w-24 shrink-0 object-cover"
            :src="fork.node.thumbUrl"
            :alt="fork.node.title"
            width="96"
            height="56"
          >
          <div
            v-else
            class="flex h-14 w-24 shrink-0 items-center justify-center bg-secondary text-[10px] text-muted-foreground"
          >
            —
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-foreground">
              {{ fork.node.title }}
            </p>
            <p
              v-if="fork.node.channelTitle"
              class="truncate text-xs text-muted-foreground"
            >
              {{ fork.node.channelTitle }}
            </p>
          </div>
        </button>
      </li>
    </ul>
  </section>
</template>
