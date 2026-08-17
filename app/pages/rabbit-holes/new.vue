<template>
  <section class="create">
    <h1>Start a new Rabbit Hole</h1>
    <p>Paste a YouTube URL as your seed. We’ll grow a first map of named forks.</p>
    <form @submit.prevent="create">
      <label>
        YouTube URL
        <input v-model="url" type="url" required placeholder="https://www.youtube.com/watch?v=…">
      </label>
      <label>
        Title (optional)
        <input v-model="title" type="text" placeholder="Defaults to the video title">
      </label>
      <button type="submit" :disabled="busy">
        {{ busy ? 'Growing the first graph…' : 'Start Rabbit Hole' }}
      </button>
    </form>
    <p v-if="status" class="status">{{ status }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="incompleteId">
      Bootstrap incomplete.
      <button type="button" :disabled="busy" @click="retry(incompleteId)">Retry bootstrap</button>
    </p>
  </section>
</template>

<script setup lang="ts">
const { loggedIn, user } = useUserSession()
if (import.meta.client) {
  watchEffect(() => {
    if (!loggedIn.value) navigateTo('/')
    else if (user.value && !user.value.termsAccepted) navigateTo('/terms-accept')
  })
}

const url = ref('')
const title = ref('')
const busy = ref(false)
const status = ref('')
const error = ref('')
const incompleteId = ref('')

async function create() {
  busy.value = true
  error.value = ''
  status.value = 'Resolving seed and expanding forks…'
  incompleteId.value = ''
  try {
    const res = await $fetch<{ rabbitHole: { id: string } }>('/api/rabbit-holes', {
      method: 'POST',
      body: { url: url.value, title: title.value || undefined },
    })
    await navigateTo(`/rabbit-holes/${res.rabbitHole.id}`)
  }
  catch (e: unknown) {
    const err = e as { data?: { data?: { rabbitHoleId?: string }, message?: string }, message?: string }
    const id = err?.data?.data?.rabbitHoleId
    if (id) incompleteId.value = id
    error.value = err?.data?.message || err?.message || 'Could not start Rabbit Hole'
    status.value = ''
  }
  finally {
    busy.value = false
  }
}

async function retry(id: string) {
  busy.value = true
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
    busy.value = false
  }
}
</script>

<style scoped>
.create {
  max-width: 34rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 1rem 0;
}
input {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--line);
  background: #121820;
  color: var(--fg);
  font: inherit;
}
button {
  margin-top: 0.5rem;
  padding: 0.65rem 1rem;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font: inherit;
  cursor: pointer;
}
.error {
  color: #e08888;
}
.status {
  color: var(--muted);
}
</style>
