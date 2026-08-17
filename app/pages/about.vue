<template>
  <article class="prose">
    <h1>About `_alice`</h1>
    <p>
      `_alice` is a Wonderland map for YouTube: start from a seed video, grow a navigable graph of how
      it branches (with short direction phrases), keep a Path of what you’ve opened, and watch on YouTube.
    </p>
    <p>
      <strong>`_alice` is not affiliated with, endorsed by, or sponsored by YouTube or Google.</strong>
      It is an independent map layer that uses the YouTube Data API and deep links for playback.
    </p>
    <p>
      See also
      <NuxtLink to="/privacy">Privacy</NuxtLink>
      and
      <NuxtLink to="/terms">Terms</NuxtLink>.
    </p>
  </article>
</template>

<style scoped>
.prose {
  max-width: 42rem;
  line-height: 1.55;
}
.prose h1 {
  color: var(--primary);
}
a {
  color: var(--primary);
  text-decoration: underline;
}
</style>
