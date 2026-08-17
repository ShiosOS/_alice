<template>
  <section>
    <h1>Account</h1>
    <p v-if="user">Signed in as {{ user.email }}</p>
    <button type="button" class="danger" :disabled="busy" @click="remove">
      {{ busy ? 'Deleting…' : 'Delete account' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
const busy = ref(false)
const error = ref('')

if (import.meta.client) {
  watchEffect(() => {
    if (!loggedIn.value) navigateTo('/')
  })
}

async function remove() {
  if (!confirm('Delete your account and all Rabbit Holes? This cannot be undone.')) {
    return
  }
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/account', { method: 'DELETE' })
    await clear()
    await navigateTo('/')
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Delete failed'
  }
  finally {
    busy.value = false
  }
}
</script>

<style scoped>
.danger {
  margin-top: 1rem;
  padding: 0.65rem 1rem;
  border: 1px solid #e08888;
  background: transparent;
  color: #e08888;
  font: inherit;
  cursor: pointer;
}
.error {
  color: #e08888;
}
</style>
