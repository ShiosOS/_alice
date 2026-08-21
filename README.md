# _alice

Wonderland-inspired map for YouTube: Rabbit Holes, intentional forks, watch on YouTube.

## Stack

- Nuxt 4 + Vue + TypeScript
- Postgres (Railway)
- Staging: `https://alice-staging.shiosas.dev` (auto from `main`)
- Production: `https://alice.shiosas.dev` (promote: `git push origin origin/main:production`)

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

## Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md) — setup, branch model, PR expectations
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — community standards
- [SECURITY.md](SECURITY.md) — private vulnerability reporting
- [SUPPORT.md](SUPPORT.md) — where to get help
- [docs/github-public-hardening.md](docs/github-public-hardening.md) — public visibility + branch protection checklist

Please open PRs against `main`. Do not commit on `production` (fast-forward promote only).

## Craft & testing (OpenSpec)

No active OpenSpec changes. Main specs live under `openspec/specs/`.

- `openspec/specs/code-craft/spec.md` — layers, naming, readability, literals, token consumption, lint style
- `openspec/specs/automated-testing/spec.md` — unit / integration / thin e2e pyramid and coverage gates
- `openspec/specs/ui-design-system/spec.md` — shared tokens, chrome components, color-only Wonderland mood (no costume art)
- `openspec/specs/hole-channel-surface/spec.md` — scroll-first channel as the hole UI
- `openspec/specs/shell-visual-system/spec.md` — cool-map climate for shell and channel
- `openspec/specs/shell-home-ui/spec.md` — signed-out home copy, Sign in hierarchy, Example trail

Frozen style: 2-space indent, single quotes, no semicolons (`@nuxt/eslint` stylistic + formatters).

Product SFCs prefer `@layer components` names (`ink-*`, `channel-*`) in `app/assets/css/tailwind.css` over long arbitrary Tailwind strings; leave `app/components/ui` alone.

## License

[MIT](LICENSE)
