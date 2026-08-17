<template>
  <section class="home">
    <h1>_alice</h1>
    <p>
      A personal Wonderland map for going deep on a YouTube topic. Paste a seed,
      see how it branches, keep Rabbit Holes for each curiosity.
    </p>
    <p v-if="!loggedIn">
      <a class="cta" href="/auth/google">Sign in with Google</a>
      to start a Rabbit Hole.
    </p>
    <p v-else>
      <NuxtLink class="cta" to="/rabbit-holes">Open Rabbit Holes</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
const { loggedIn } = useUserSession()
</script>

<style scoped>
.home h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--accent);
  font-weight: 600;
}

.home p {
  max-width: 36rem;
  line-height: 1.55;
  color: var(--fg);
}

.cta {
  color: var(--accent);
  text-decoration: underline;
}
</style>
