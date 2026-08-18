<template>
  <div>
    <p
      v-if="pending"
      class="text-muted-foreground"
    >
      Loading…
    </p>
    <p
      v-else-if="error"
      class="text-destructive"
    >
      {{ error }}
    </p>
    <template v-else-if="holeGraph">
      <RabbitHoleChannel
        :hole-graph="holeGraph"
        :is-mutating="isMutating"
        :editing="editing"
        :draft-title="draftTitle"
        @expand="onExpand"
        @watch="onWatch"
        @update:draft-title="draftTitle = $event"
        @start-edit="startEdit"
        @save-title="saveTitle"
        @delete="deleteRabbitHole"
        @retry-bootstrap="retryBootstrap"
      />
      <div class="mt-8">
        <YoutubeAttribution />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import RabbitHoleChannel from '~/components/rabbit-hole/RabbitHoleChannel.vue'

definePageMeta({
  middleware: ['auth', 'terms'],
})

const route = useRoute()
const id = computed(() => String(route.params.id))

const {
  pending,
  error,
  holeGraph,
  isMutating,
  editing,
  draftTitle,
  startEdit,
  saveTitle,
  deleteRabbitHole,
  retryBootstrap,
  onExpand,
  onWatch,
} = useHoleGraph(id)
</script>
