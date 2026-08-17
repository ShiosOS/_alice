<template>
  <section class="max-w-lg space-y-5">
    <h1 class="font-display text-3xl text-foreground">
      Accept Terms
    </h1>
    <p class="leading-relaxed text-muted-foreground">
      Before using Rabbit Holes, please accept the
      <NuxtLink
        to="/terms"
        class="text-primary underline underline-offset-4"
      >Terms of Use</NuxtLink>
      and review the
      <NuxtLink
        to="/privacy"
        class="text-primary underline underline-offset-4"
      >Privacy Policy</NuxtLink>.
    </p>
    <Button
      :disabled="busy"
      @click="accept"
    >
      {{ busy ? 'Saving…' : 'I accept the Terms' }}
    </Button>
    <p
      v-if="error"
      class="text-sm text-destructive"
    >
      {{ error }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

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
