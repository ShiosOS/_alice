# Contributing to _alice

Thanks for helping. This doc covers how to propose changes safely and in a
reviewable shape.

## Code of conduct

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

Do not file public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).

## Development setup

Requirements: Node.js matching [`.nvmrc`](.nvmrc) (≥ 22.18), Postgres, and a
local `.env` based on [`.env.example`](.env.example).

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Useful checks (run before opening a PR):

```bash
npm run lint
npm run typecheck
npm run test:unit
# Needs DATABASE_URL / NUXT_DATABASE_URL + NUXT_SESSION_PASSWORD (≥32 chars):
npm run test:nuxt
npm run test:e2e
```

Deploy and smoke notes: [docs/deploy.md](docs/deploy.md), [docs/smoke.md](docs/smoke.md).

## How we change things

1. **Open an issue** (bug or feature) unless the change is tiny and obvious.
2. **Fork** (or use a branch) and keep work off `main` / `production`.
3. Prefer small, focused PRs. Match existing craft: 2-space indent, single
   quotes, no semicolons; prefer `@layer components` utility names over long
   arbitrary Tailwind strings in product SFCs (leave `app/components/ui` alone).
4. Larger product or architecture changes may use OpenSpec under `openspec/` —
   see `.cursor/skills/openspec-*` if you use Cursor.
5. Fill out the PR template. Link the issue. Call out risk (auth, Expand spend,
   migrations, deploy).

## Branch model

| Branch | Role |
| --- | --- |
| `main` | Trunk → staging (`alice-staging.shiosos.dev`) |
| `production` | Fast-forward-only pointer → live (`alice.shiosas.dev`) |

Do not commit directly on `production`. Promotion is intentional:

```bash
# After staging smoke passes — maintainers only
git push origin origin/main:production
```

## Pull requests

- Target `main`.
- CI must pass (lint, typecheck, migrate, unit coverage, nuxt + e2e tests).
- Prefer one logical change per PR; avoid drive-by refactors.
- Do not commit secrets, real `.env` files, or production dumps (`backups/`).

## Issue labels (maintainers)

Use labels to triage (`bug`, `enhancement`, `docs`, `good first issue`, etc.).
Security reports belong in private advisories, not public issues.
