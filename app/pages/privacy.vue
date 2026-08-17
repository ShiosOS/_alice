<template>
  <article class="prose">
    <h1>Privacy Policy</h1>
    <p>Last updated: 16 August 2026</p>
    <p>
      `_alice` (“we”) provides a personal map for exploring YouTube topic rabbit holes.
      This policy explains what we collect and how we use it.
    </p>

    <h2>What we collect</h2>
    <ul>
      <li>Account information from Google sign-in (email, name, profile image, Google subject id).</li>
      <li>Rabbit Holes you create: seed video ids, graph nodes/edges, short direction phrases, and Path events (videos you open from `_alice`).</li>
      <li>Expand usage records (timestamps, status, optional token counts) for rate limiting and reliability.</li>
      <li>Technical logs needed to operate the service (errors, request metadata).</li>
    </ul>

    <h2>How we use data</h2>
    <ul>
      <li>To run the product: authenticate you, store your Rabbit Holes, expand graphs, and deep-link to YouTube.</li>
      <li>To enforce expand budgets and prevent abuse.</li>
      <li>To improve reliability (error tracking).</li>
    </ul>

    <h2>Processors</h2>
    <ul>
      <li><strong>Hosting / database:</strong> Railway (application and Postgres).</li>
      <li><strong>Auth:</strong> Google OAuth.</li>
      <li><strong>YouTube Data API:</strong> Google / YouTube for video metadata and search/related candidates.</li>
      <li><strong>AI provider:</strong> configured model API used only to choose diverse forks and write short direction phrases from candidate metadata.</li>
    </ul>

    <h2>Retention</h2>
    <ul>
      <li>Your Rabbit Holes, graph, Path, and phrases are kept until you delete the hole or your account.</li>
      <li>YouTube API cache payloads are refreshed or deleted within about 30 days.</li>
      <li>Expand ledger rows may be retained to enforce budgets and debug failures.</li>
    </ul>

    <h2>Deletion</h2>
    <p>
      You can delete individual Rabbit Holes in the app, or delete your account under Account.
      Account deletion removes your personal product data as soon as possible and within seven days.
    </p>

    <h2>Contact</h2>
    <p>Questions: use the contact channel listed on <NuxtLink to="/about">About</NuxtLink>.</p>
  </article>
</template>

<style scoped>
.prose {
  max-width: 42rem;
  line-height: 1.55;
}
.prose h1,
.prose h2 {
  color: var(--primary);
}
</style>
