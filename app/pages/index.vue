<template>
  <div>
    <section class="ink-home-hero">
      <div class="space-y-6">
        <h1 class="font-display text-5xl tracking-tight text-foreground sm:text-6xl">
          _alice
        </h1>
        <p class="ink-home-lede">
          Start from one YouTube video. See a few clear next steps.
          Come back later to what you already opened.
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
      </div>

      <ClientOnly>
        <HomeExampleTrail />
        <template #fallback>
          <aside
            class="ink-example-panel"
            aria-hidden="true"
          >
            <p class="ink-example-label">
              Example
            </p>
            <div class="ink-example-step is-now">
              <div class="ink-example-kicker">
                Started from
              </div>
              <div class="ink-example-title">
                Beginner guitar — first three chords
              </div>
            </div>
          </aside>
        </template>
      </ClientOnly>
    </section>

    <section
      v-if="!loggedIn"
      class="ink-home-how"
      aria-labelledby="how-it-works-heading"
    >
      <h2
        id="how-it-works-heading"
        class="mb-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        How it works
      </h2>
      <div class="ink-home-how-grid">
        <article>
          <p class="mb-2 text-xs font-semibold text-link">
            1
          </p>
          <h3 class="mb-1.5 text-lg font-semibold tracking-tight text-foreground">
            Paste a link
          </h3>
          <p class="text-muted-foreground">
            Any YouTube video you’re curious about.
          </p>
        </article>
        <article>
          <p class="mb-2 text-xs font-semibold text-link">
            2
          </p>
          <h3 class="mb-1.5 text-lg font-semibold tracking-tight text-foreground">
            Pick a next step
          </h3>
          <p class="text-muted-foreground">
            Short labels show how each direction differs from where you are.
          </p>
        </article>
        <article>
          <p class="mb-2 text-xs font-semibold text-link">
            3
          </p>
          <h3 class="mb-1.5 text-lg font-semibold tracking-tight text-foreground">
            Come back later
          </h3>
          <p class="text-muted-foreground">
            The videos you already opened stay in order.
          </p>
        </article>
      </div>
      <p class="ink-home-trust">
        Independent tool. Not affiliated with YouTube or Google. Playback happens on YouTube.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

const { loggedIn } = useUserSession()
</script>
