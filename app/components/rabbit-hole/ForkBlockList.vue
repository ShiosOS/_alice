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
    class="mt-8"
  >
    <ul class="border-t border-border">
      <li
        v-for="fork in forks"
        :key="fork.edge.id"
      >
        <button
          type="button"
          class="channel-block-row"
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
            <p class="channel-phrase">
              {{ fork.edge.phrase }}
            </p>
            <p class="truncate text-sm font-medium text-foreground">
              {{ fork.node.title }}
            </p>
          </div>
        </button>
      </li>
    </ul>
  </section>
</template>
