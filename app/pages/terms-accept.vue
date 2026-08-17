<template>
  <section class="auth">
    <h1>Accept Terms</h1>
    <p>
      Before using Rabbit Holes, please accept the
      <NuxtLink to="/terms">Terms of Use</NuxtLink>
      and review the
      <NuxtLink to="/privacy">Privacy Policy</NuxtLink>.
    </p>
    <button type="button" :disabled="busy" @click="accept">
      {{ busy ? 'Saving…' : 'I accept the Terms' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
const { loggedIn, user, fetch: fetchSession } = useUserSession()
const busy = ref(false)
const error = ref('')

if (import.meta.client) {
  watchEffect(() => {
    if (!loggedIn.value) {
      navigateTo('/')
    }
    else if (user.value?.termsAccepted) {
      navigateTo('/rabbit-holes')
    }
  })
}

async function accept() {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/accept-terms', { method: 'POST' })
    await fetchSession()
    await navigateTo('/rabbit-holes')
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not accept terms'
  }
  finally {
    busy.value = false
  }
}
</script>

<style scoped>
.auth {
  max-width: 32rem;
}
.auth a {
  color: var(--accent);
  text-decoration: underline;
}
button {
  margin-top: 1rem;
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
</style>
