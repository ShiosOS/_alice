<template>
  <section class="home">
    <h1>_alice</h1>
    <p>
      A personal Wonderland map for going deep on a YouTube topic. Paste a seed,
      see how it branches, keep Rabbit Holes for each curiosity.
    </p>
    <p class="note">Foundation scaffold — Rabbit Holes arrive in later stack layers.</p>
  </section>
</template>

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

.note {
  color: var(--muted);
  font-size: 0.95rem;
}
</style>
