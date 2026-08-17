# Deploy _alice to Railway + alice.shiosos.dev

## Environments

One Railway project (`_alice`) with three Railway environments:

| Environment | App URL | Purpose |
| --- | --- | --- |
| `production` | `https://alice.shiosos.dev` | Live |
| `staging` | `https://staging.alice.shiosos.dev` | Pre-prod / QA |
| `feature` | `https://feature.alice.shiosos.dev` | Shared feature sandbox |

Each environment gets its own service instances (web + Postgres when duplicated). Expand AI is disabled by default on staging/feature (`NUXT_EXPAND_DISABLED=true`) until you turn it on intentionally.

Optional later: ephemeral PR envs (`pr-123`) via `railway environment new pr-N --copy feature` in CI.

## Bootstrap (CLI)

Needs an **account** token (not a project token):

1. Create token: [railway.com/account/tokens](https://railway.com/account/tokens) (select your workspace).
2. Export it (and only it):

```bash
export RAILWAY_API_TOKEN=...   # unset RAILWAY_TOKEN if set
# optional: export NUXT_OAUTH_GOOGLE_CLIENT_ID=... NUXT_OAUTH_GOOGLE_CLIENT_SECRET=...
# optional: export NUXT_YOUTUBE_API_KEY=... NUXT_AI_API_KEY=...
npm i -g @railway/cli
./scripts/railway-bootstrap.sh
```

The script:

1. Creates/links project `_alice`
2. Adds Postgres + `web` (GitHub `ShiosOS/_alice` @ `main`)
3. Creates `staging` and `feature` by duplicating `production`
4. Sets per-env `NUXT_PUBLIC_APP_URL` / session / expand defaults
5. Requests custom domains for the three hostnames
6. Deploys each env (`SKIP_DEPLOY=1` to skip)

`railway.toml` start command: `node .output/server/index.mjs`.

## Manual follow-ups

1. **Variable references:** On `web` in each env, point `DATABASE_URL` and `NUXT_DATABASE_URL` at the Postgres service’s `DATABASE_URL` (Railway reference variable).
2. **Secrets:** Set OAuth / YouTube / AI keys on `web` per env (or once in production then copy). Staging/feature can share Google OAuth client if all redirect URIs are registered.
3. **Migrations:** `railway run -e production -s web -- npm run db:migrate` (repeat for staging/feature), or `db:push` for early envs.
4. **Postgres backups:** Enable automatic / PITR backups on production (and preferably staging) in the Railway dashboard; confirm restore points once.
5. **Cloudflare DNS** (`shiosos.dev`):

| Type | Name | Target |
| --- | --- | --- |
| CNAME | `alice` | Railway hostname for production |
| CNAME | `staging.alice` | Railway hostname for staging |
| CNAME | `feature.alice` | Railway hostname for feature |

Use DNS-only (grey cloud) until Railway TLS is happy.

6. **Google OAuth redirect URIs:**

- `https://alice.shiosos.dev/auth/google`
- `https://staging.alice.shiosos.dev/auth/google`
- `https://feature.alice.shiosos.dev/auth/google`
- `http://localhost:3000/auth/google`

## Day-2 commands

```bash
railway environment production   # or staging / feature
railway up --service web --environment staging
railway logs --service web --environment production
railway variable list --service web --environment feature
```

## Quotas and billing caps

Before inviting others:

1. **YouTube Data API:** budget/quota alert in Google Cloud; keep `NUXT_EXPAND_DAILY_BUDGET` low.
2. **AI provider:** hard monthly spend cap; keep `NUXT_EXPAND_DISABLED=true` as an emergency switch on non-prod.
3. Railway spend alerts if available.
