# Deploy _alice to Railway + alice.shiosos.dev

## Environments

One Railway project (`_alice`) with three Railway environments:

| Environment | App URL | Purpose |
| --- | --- | --- |
| `production` | `https://alice.shiosos.dev` | Live |
| `staging` | `https://alice-staging.shiosos.dev` | Pre-prod / QA |
| `feature` | `https://alice-feature.shiosos.dev` | Shared feature sandbox |

Use **sibling** hostnames (`alice-staging`, `alice-feature`), not nested under the `alice` CNAME (`staging.alice…` will NXDOMAIN).

Each environment gets its own service instances (web + Postgres when duplicated). Expand AI is disabled by default on staging/feature (`NUXT_EXPAND_DISABLED=true`) until you turn it on intentionally.

Builder: **Railpack** (not Nixpacks). See `railway.toml`.

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

`railway.toml`: Railpack build, `preDeployCommand` runs `node scripts/db-migrate.mjs`, start is `node .output/server/index.mjs`.

## Manual follow-ups

1. **Variable references:** On `web` in each env, point `DATABASE_URL` and `NUXT_DATABASE_URL` at the Postgres service’s `DATABASE_URL` (Railway reference variable).
2. **Secrets:** Set OAuth / YouTube / AI keys on `web` per env (or once in production then copy). Staging/feature can share Google OAuth client if all redirect URIs are registered.
3. **Migrations:** Applied automatically on each deploy via `preDeployCommand`. One-off from a machine with TCP proxy: `DATABASE_URL=… npm run db:migrate`.
4. **Postgres backups:** see [Postgres backups & restore](#postgres-backups--restore) below.
5. **Cloudflare DNS** (`shiosos.dev`) — **DNS-only (grey cloud)**:

| Type | Name | Target |
| --- | --- | --- |
| CNAME | `alice` | Railway custom-domain target for production |
| CNAME | `alice-staging` | Railway custom-domain target for staging |
| CNAME | `alice-feature` | Railway custom-domain target for feature |

Orange-cloud proxy causes TLS/403 mismatches with Railway certs.

6. **Google OAuth redirect URIs:**

- `https://alice.shiosos.dev/auth/google`
- `https://alice-staging.shiosos.dev/auth/google`
- `https://alice-feature.shiosos.dev/auth/google`
- `http://localhost:3000/auth/google`

7. **Sentry (optional):** set `NUXT_SENTRY_DSN` on web; Expand/bootstrap failures and OAuth DB errors are reported.

## Postgres backups & restore

Railway **volume backup schedules / PITR need a paid plan** (not available on Hobby). On Hobby we use **logical dumps** instead.

### Hobby (current): `pg_dump` / `pg_restore`

1. Enable a **TCP proxy** (or public Postgres URL) on the Postgres service so the host is reachable outside the private network (`*.railway.internal` will not work from your laptop).
2. Export `DATABASE_URL` with that public host.
3. Backup:

```bash
chmod +x scripts/pg-backup.sh
DATABASE_URL='postgresql://…' ./scripts/pg-backup.sh
# writes ./backups/alice-<utc>.dump
```

4. Store the `.dump` file somewhere durable (encrypted drive, object storage, etc.).
5. Optional cron (local or CI with secrets): run the same command daily and retain N copies.

### Restore (Hobby logical dump)

1. Provision a fresh Railway Postgres (or empty local DB). Prefer **not** wiping production in place until verified.
2. Restore:

```bash
pg_restore --clean --if-exists --no-owner --no-acl -d "$DATABASE_URL" ./backups/alice-YYYYMMDD.dump
```

3. Point web `DATABASE_URL` / `NUXT_DATABASE_URL` at the restored DB; redeploy so `preDeployCommand` can no-op or apply newer migrations.
4. Smoke: sign in, open a Rabbit Hole, create a small new hole if needed.
5. Keep the previous DB until smoke passes.

### Pro+ (optional later)

If you upgrade: Railway → Postgres → volume → **Backups** → enable Daily (+ Weekly on production). Then restore via the dashboard (new volume / PITR) and repoint `DATABASE_URL` the same way as above.

## Day-2 commands

```bash
railway environment production   # or staging / feature
railway up --service web --environment staging
railway logs --service web --environment production
railway variable list --service web --environment feature
```

## Quotas and billing caps

Before inviting others:

1. **YouTube Data API (Google Cloud):**
   - Enable billing alerts on the GCP project.
   - Set a daily quota alert below the default 10,000 units.
   - Keep `NUXT_EXPAND_DAILY_BUDGET` low (default 50 expands/user/day).
2. **AI provider (OpenAI or compatible, e.g. OpenRouter):**
   - `NUXT_AI_API_KEY` must match `NUXT_AI_BASE_URL` (OpenRouter keys → `https://openrouter.ai/api/v1`; OpenAI keys → `https://api.openai.com/v1`).
   - OpenRouter models use vendor-prefixed ids (e.g. `openai/gpt-4o-mini`).
   - Hard monthly spend cap / budget alert in the vendor console.
   - Keep `NUXT_EXPAND_DISABLED=true` as an emergency switch on non-prod.
3. **Railway:** workspace spend alerts if available.
4. Re-check after first week of real Expand traffic; tighten caps before public invite.
