# _alice

Wonderland map for YouTube: Rabbit Holes, intentional forks, watch on YouTube.

## Stack

- Nuxt 4 + Vue + TypeScript
- Postgres (Railway)
- Staging: `https://alice-staging.shiosos.dev` (auto from `main`)
- Production: `https://alice.shiosos.dev` (promote: `git push origin origin/main:production`)

## Local

```bash
cp .env.example .env
npm install
npm run dev
```

```bash
npm run lint        # check
npm run lint:fix   # autofix style (also: npm run format)
npm run typecheck
```

See `docs/deploy.md` for Railway + Cloudflare and `docs/smoke.md` before promoting.

OpenSpec: `openspec/` (active craft plan: `openspec/changes/code-craft-standards/`).
