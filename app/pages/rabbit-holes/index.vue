<template>
  <section>
    <header class="row">
      <h1>Rabbit Holes</h1>
      <NuxtLink class="btn" to="/rabbit-holes/new">Start a new Rabbit Hole</NuxtLink>
    </header>

    <p v-if="pending">Loading…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else-if="!holes.length" class="empty">
      <p>No Rabbit Holes yet.</p>
      <NuxtLink class="btn" to="/rabbit-holes/new">Start a new Rabbit Hole</NuxtLink>
    </div>
    <ul v-else class="list">
      <li v-for="hole in holes" :key="hole.id">
        <NuxtLink :to="`/rabbit-holes/${hole.id}`">
          <strong>{{ hole.title }}</strong>
          <span class="meta">{{ hole.status }} · updated {{ formatDate(hole.updatedAt) }}</span>
        </NuxtLink>
      </li>
    </ul>
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

type Hole = {
  id: string
  title: string
  status: string
  updatedAt: string
}

const pending = ref(true)
const error = ref('')
const holes = ref<Hole[]>([])

async function load() {
  pending.value = true
  error.value = ''
  try {
    const res = await $fetch<{ rabbitHoles: Hole[] }>('/api/rabbit-holes')
    holes.value = res.rabbitHoles
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load'
  }
  finally {
    pending.value = false
  }
}

onMounted(load)

function formatDate(v: string) {
  try {
    return new Date(v).toLocaleString()
  }
  catch {
    return v
  }
}
</script>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}
.btn {
  display: inline-block;
  padding: 0.55rem 0.9rem;
  border: 1px solid var(--accent);
  color: var(--accent);
}
.list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
}
.list li {
  border-top: 1px solid var(--line);
}
.list a {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.9rem 0;
}
.meta {
  color: var(--muted);
  font-size: 0.85rem;
}
.empty {
  margin-top: 1.5rem;
}
.error {
  color: #e08888;
}
</style>
