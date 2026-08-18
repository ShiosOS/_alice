<script setup lang="ts">
import type { HoleStatus } from '#shared/types/rabbit-holes'

defineProps<{
  title: string
  status: HoleStatus
  editing: boolean
  draftTitle: string
  isMutating?: boolean
}>()

const emit = defineEmits<{
  'update:draftTitle': [value: string]
  'startEdit': []
  'saveTitle': []
  'delete': []
  'retryBootstrap': []
}>()
</script>

<template>
  <header class="mb-6 space-y-2">
    <div class="flex flex-wrap items-center gap-2">
      <input
        v-if="editing"
        class="ink-title-input"
        :value="draftTitle"
        @input="emit('update:draftTitle', ($event.target as HTMLInputElement).value)"
        @keyup.enter="emit('saveTitle')"
      >
      <h1
        v-else
        class="text-2xl font-semibold tracking-tight text-title"
      >
        {{ title }}
      </h1>
      <button
        v-if="!editing"
        type="button"
        class="ink-chip-btn"
        @click="emit('startEdit')"
      >
        Rename
      </button>
      <button
        v-else
        type="button"
        class="ink-chip-btn-primary"
        @click="emit('saveTitle')"
      >
        Save
      </button>
      <button
        type="button"
        class="ink-chip-btn-danger"
        @click="emit('delete')"
      >
        Delete
      </button>
    </div>
    <p class="text-xs text-muted-foreground">
      Status: {{ status }}
    </p>
    <button
      v-if="status === 'incomplete'"
      type="button"
      class="ink-chip-btn-primary"
      :disabled="isMutating"
      @click="emit('retryBootstrap')"
    >
      Retry bootstrap
    </button>
  </header>
</template>
