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
npm run db:migrate
npm run dev
```

```bash
npm run lint        # check
npm run lint:fix   # autofix style (also: npm run format)
npm run typecheck
npm run test:unit   # pure domain unit tests (no live YouTube/AI)
npm run test:coverage  # unit + coverage thresholds on domain modules
npm run test:nuxt   # API integration (Postgres; auth/terms/health + fixture create/expand/watch)
npm run test:e2e    # thin public-page e2e via $fetch (no Playwright browser)
npm run test        # all Vitest projects
```

Integration and e2e need `DATABASE_URL` / `NUXT_DATABASE_URL` and a ≥32-char `NUXT_SESSION_PASSWORD` (see `.env.example`). They fail with a clear message if the DB URL is missing.

See `docs/deploy.md` for Railway + Cloudflare and `docs/smoke.md` for **PR CI** vs **promote gate** (`scripts/e2e-smoke.mjs`).

## Craft & testing (OpenSpec)

Active change: `openspec/changes/code-craft-standards/`.

Capability specs (until archived into main specs):

- `openspec/changes/code-craft-standards/specs/code-craft/spec.md` — layers, naming, readability, literals, token consumption, lint style
- `openspec/changes/code-craft-standards/specs/automated-testing/spec.md` — unit / integration / thin e2e pyramid and coverage gates

Frozen style: 2-space indent, single quotes, no semicolons (`@nuxt/eslint` stylistic + formatters).
