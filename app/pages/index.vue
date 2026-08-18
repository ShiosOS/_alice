<template>
  <section class="max-w-xl space-y-5">
    <h1 class="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
      _alice
    </h1>
    <p class="text-lg leading-relaxed text-muted-foreground">
      A personal map for going deep on a YouTube topic. Paste a seed,
      see how it branches, keep Rabbit Holes for each curiosity.
    </p>
    <div>
      <Button
        v-if="!loggedIn"
        as-child
        size="lg"
      >
        <a href="/auth/google">Sign in with Google</a>
      </Button>
      <Button
        v-else
        as-child
        size="lg"
      >
        <NuxtLink to="/rabbit-holes">Open Rabbit Holes</NuxtLink>
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

const { loggedIn } = useUserSession()
</script>
