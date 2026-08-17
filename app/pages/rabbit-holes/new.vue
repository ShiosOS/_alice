<template>
  <section class="max-w-lg space-y-6">
    <div class="space-y-2">
      <h1 class="font-display text-3xl text-foreground">
        Start a new Rabbit Hole
      </h1>
      <p class="text-muted-foreground">
        Paste a YouTube URL as your seed. We’ll grow a first map of named forks.
      </p>
    </div>
    <form
      class="space-y-4"
      @submit.prevent="create"
    >
      <div class="space-y-2">
        <Label for="seed-url">YouTube URL</Label>
        <Input
          id="seed-url"
          v-model="url"
          type="url"
          required
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </div>
      <div class="space-y-2">
        <Label for="hole-title">Title (optional)</Label>
        <Input
          id="hole-title"
          v-model="title"
          type="text"
          placeholder="Defaults to the video title"
        />
      </div>
      <Button
        type="submit"
        :disabled="isMutating"
      >
        {{ isMutating ? 'Growing the first graph…' : 'Start Rabbit Hole' }}
      </Button>
    </form>
    <p
      v-if="status"
      class="text-sm text-muted-foreground"
    >
      {{ status }}
    </p>
    <p
      v-if="error"
      class="text-sm text-destructive"
    >
      {{ error }}
    </p>
    <p
      v-if="incompleteId"
      class="space-x-2 text-sm text-muted-foreground"
    >
      <span>Bootstrap incomplete.</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="isMutating"
        @click="retry(incompleteId)"
      >
        Retry bootstrap
      </Button>
    </p>
  </section>
</template>

<script setup lang="ts">
import type { RabbitHoleGraph } from '#shared/types/rabbit-holes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({
  middleware: ['auth', 'terms'],
})

const url = ref('')
const title = ref('')
const isMutating = ref(false)
const status = ref('')
const error = ref('')
const incompleteId = ref('')

function incompleteHoleId(err: unknown): string | undefined {
  if (typeof err !== 'object' || err === null || !('data' in err)) return undefined
  const data = err.data
  if (typeof data !== 'object' || data === null || !('data' in data)) return undefined
  const inner = data.data
  if (typeof inner !== 'object' || inner === null || !('rabbitHoleId' in inner)) return undefined
  return typeof inner.rabbitHoleId === 'string' ? inner.rabbitHoleId : undefined
}

function fetchErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err !== null && 'data' in err) {
    const data = err.data
    if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
      return data.message
    }
  }
  if (err instanceof Error) return err.message
  return fallback
}

async function create() {
  isMutating.value = true
  error.value = ''
  status.value = 'Resolving seed and expanding forks…'
  incompleteId.value = ''
  try {
    const res = await $fetch<RabbitHoleGraph>('/api/rabbit-holes', {
      method: 'POST',
      body: { url: url.value, title: title.value || undefined },
    })
    await navigateTo(`/rabbit-holes/${res.rabbitHole.id}`)
  }
  catch (e: unknown) {
    const id = incompleteHoleId(e)
    if (id) incompleteId.value = id
    error.value = fetchErrorMessage(e, 'Could not start Rabbit Hole')
    status.value = ''
  }
  finally {
    isMutating.value = false
  }
}

async function retry(id: string) {
  isMutating.value = true
  error.value = ''
  status.value = 'Retrying bootstrap…'
  try {
    await $fetch(`/api/rabbit-holes/${id}/bootstrap`, { method: 'POST' })
    await navigateTo(`/rabbit-holes/${id}`)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Retry failed'
  }
  finally {
    isMutating.value = false
  }
}
</script>
