<template>
  <div class="relative h-full min-h-0 w-full">
    <p
      v-if="pending"
      class="absolute inset-0 z-10 flex items-center justify-center text-muted-foreground"
    >
      Loading…
    </p>
    <p
      v-else-if="error"
      class="absolute inset-0 z-10 flex items-center justify-center text-destructive"
    >
      {{ error }}
    </p>
    <template v-else-if="holeGraph">
      <div class="pointer-events-none absolute top-4 left-4 z-20 max-w-lg space-y-2">
        <div class="pointer-events-auto rounded-md border border-primary/30 bg-surface-panel/90 px-3 py-2 backdrop-blur">
          <div class="flex flex-wrap items-center gap-2">
            <input
              v-if="editing"
              v-model="draftTitle"
              class="min-w-48 flex-1 rounded border border-border bg-surface-deep px-2 py-1 font-display text-lg text-foreground"
              @keyup.enter="saveTitle"
            >
            <h1
              v-else
              class="font-display text-xl text-title"
            >
              {{ holeGraph.rabbitHole.title }}
            </h1>
            <button
              v-if="!editing"
              type="button"
              class="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              @click="startEdit"
            >
              Rename
            </button>
            <button
              v-else
              type="button"
              class="rounded border border-primary/50 px-2 py-1 text-xs text-primary"
              @click="saveTitle"
            >
              Save
            </button>
            <button
              type="button"
              class="rounded border border-destructive/50 px-2 py-1 text-xs text-destructive"
              @click="deleteRabbitHole"
            >
              Delete
            </button>
          </div>
          <p class="mt-1 text-xs text-muted-foreground">
            Status: {{ holeGraph.rabbitHole.status }}
          </p>
          <button
            v-if="holeGraph.rabbitHole.status === 'incomplete'"
            type="button"
            class="mt-2 rounded border border-primary/40 px-2 py-1 text-xs text-primary"
            :disabled="isMutating"
            @click="retryBootstrap"
          >
            Retry bootstrap
          </button>
        </div>
      </div>

      <RabbitHoleGraph
        :nodes="holeGraph.nodes"
        :edges="holeGraph.edges"
        :path-ids="pathIds"
        :seed-video-id="holeGraph.rabbitHole.seedVideoId"
        :is-mutating="isMutating"
        @expand="onExpand"
        @watch="onWatch"
      />
      <div class="absolute bottom-3 left-4 z-20">
        <YoutubeAttribution />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  fullBleed: true,
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
  pathIds,
  startEdit,
  saveTitle,
  deleteRabbitHole,
  retryBootstrap,
  onExpand,
  onWatch,
} = useHoleGraph(id)
</script>
