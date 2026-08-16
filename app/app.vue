<template>
  <div class="shell">
    <header class="header">
      <NuxtLink to="/" class="brand">_alice</NuxtLink>
    </header>
    <main class="main">
      <NuxtPage />
    </main>
    <footer class="footer">
      <span>Wonderland map for YouTube</span>
    </footer>
  </div>
</template>

<style>
:root {
  --bg: #0f1419;
  --fg: #e8eef4;
  --muted: #8b9aab;
  --accent: #c4a574;
  --line: #243041;
  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(1200px 600px at 10% -10%, #1a2433 0%, transparent 60%),
    radial-gradient(900px 500px at 100% 0%, #2a1f18 0%, transparent 55%),
    var(--bg);
  color: var(--fg);
}

a {
  color: inherit;
  text-decoration: none;
}

.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header,
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--line);
}

.footer {
  border-bottom: 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.9rem;
  margin-top: auto;
}

.brand {
  font-size: 1.5rem;
  letter-spacing: 0.02em;
  color: var(--accent);
}

.main {
  flex: 1;
  padding: 1.5rem 1.25rem 2rem;
  width: min(1100px, 100%);
  margin: 0 auto;
}
</style>
