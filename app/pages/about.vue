<template>
  <article class="prose">
    <h1>About `_alice`</h1>
    <p>
      `_alice` helps you follow a YouTube topic without getting lost: start from one video,
      see clear next steps with short direction labels, come back to what you already opened,
      and watch on YouTube.
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
  color: var(--foreground);
}
a {
  color: var(--link);
  text-decoration: underline;
}
</style>
