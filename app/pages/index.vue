<template>
  <section class="max-w-xl space-y-5">
    <h1 class="font-display text-4xl font-normal text-primary sm:text-5xl">
      _alice
    </h1>
    <p class="text-lg leading-relaxed text-foreground/90">
      A personal Wonderland map for going deep on a YouTube topic. Paste a seed,
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
