# Deploy _alice to Railway + alice.shiosos.dev

## Environments

One Railway project (`_alice`) with **two** persistent environments:

| Environment | App URL | Git trigger | Purpose |
| --- | --- | --- | --- |
| `staging` | `https://alice-staging.shiosos.dev` | `main` | Dress rehearsal (auto after CI) |
| `production` | `https://alice.shiosos.dev` | `production` branch | Live (promote only) |

Use a **sibling** hostname (`alice-staging`), not nested under the `alice` CNAME (`staging.alice…` will NXDOMAIN).

Each environment has its own web instance and Postgres. Expand is **on** in both by default (`NUXT_EXPAND_DISABLED=false`) so staging can prove the real product path. Use staging YouTube/AI keys (or a tight `NUXT_EXPAND_DAILY_BUDGET`); keep production spend keys on production. `NUXT_EXPAND_DISABLED=true` is an emergency switch, not the staging default.

Builder: **Railpack** (not Nixpacks). Healthcheck: `GET /health` (database ping). See `railway.toml`.

There is no `feature` environment. Do not recreate `alice-feature.shiosos.dev`.

## Promotion

```
  PR → CI → merge to main → staging autodeploys (Wait for CI)
                              smoke https://alice-staging.shiosos.dev
                              git push origin origin/main:production
                           → production autodeploys that SHA
```

- `main` is trunk. Never commit on `production`; it is a fast-forward-only pointer.
- Lag: `git log origin/production..origin/main`
- Promote only after [docs/smoke.md](smoke.md) passes on staging.
- **Do not** use Railway **Sync** staging → production (that copies config/URLs/flags, not “the commit I smoked”).
- GitHub Actions is the **gate** (lint/typecheck). Railway GitHub autodeploy is the only shipper. There is no `railway up` job in CI.

### Cut over from three-env / `main`→prod (do this before merging a change that should not go live yet)

If production `web` still autodeploys from `main`:

1. Disable production autodeploy from `main`, **or** point it at `production` (create the branch first).
2. `git push origin origin/main:production` at the SHA production is already running.
3. Staging `web` trigger: `main`. Production `web` trigger: `production`. Wait for CI on both.
4. Then merge work to `main`. Staging moves; production does not until you FF `production`.

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
2. Adds Postgres + `web` (GitHub `ShiosOS/_alice` @ `main` for the initial link)
3. Creates `staging` by duplicating `production` (not `feature`)
4. Sets per-env `NUXT_PUBLIC_APP_URL`, Expand **on**, session password if missing
5. Requests custom domains for the two hostnames
6. Deploys each env (`SKIP_DEPLOY=1` to skip)

Then set GitHub triggers as in the cut-over list above. `.railway/` is local link state and is gitignored.

`railway.toml`: Railpack build, `preDeployCommand` runs `node scripts/db-migrate.mjs`, start is `node .output/server/index.mjs`, healthcheck is `/health`.

## Manual follow-ups

1. **Variable references:** On `web` in each env, point `DATABASE_URL` and `NUXT_DATABASE_URL` at that env’s Postgres `DATABASE_URL` (Railway reference variable).
2. **Secrets:** Staging and production MUST have different `NUXT_SESSION_PASSWORD`. Prefer staging-only YouTube/AI keys (or lower quotas) vs production spend keys. Staging and production can share one Google OAuth client if both redirect URIs are registered.
3. **Migrations:** Applied automatically on each deploy via `preDeployCommand` (each environment’s own database). One-off from a machine with TCP proxy: `DATABASE_URL=… npm run db:migrate`.
4. **Postgres backups:** see [Postgres backups & restore](#postgres-backups--restore) below.
5. **Cloudflare DNS** (`shiosos.dev`) — **DNS-only (grey cloud)**:

| Type | Name | Target |
| --- | --- | --- |
| CNAME | `alice` | Railway custom-domain target for production |
| CNAME | `alice-staging` | Railway custom-domain target for staging |

Remove `alice-feature` if it still exists. Orange-cloud proxy causes TLS/403 mismatches with Railway certs.

6. **Google OAuth redirect URIs:**

- `https://alice.shiosos.dev/auth/google`
- `https://alice-staging.shiosos.dev/auth/google`
- `http://localhost:3000/auth/google`

Remove `https://alice-feature.shiosos.dev/auth/google`.

7. **Sentry (optional):** set `NUXT_SENTRY_DSN` on web; Expand/bootstrap failures and OAuth DB errors are reported. `RAILWAY_ENVIRONMENT_NAME` tags the environment.

## Postgres backups & restore

Railway **volume backup schedules / PITR need a paid plan** (not available on Hobby). On Hobby we use **logical dumps** instead.

### Hobby (current): `pg_dump` / `pg_restore`

1. Enable a **TCP proxy** (or public Postgres URL) on the Postgres service so the host is reachable outside the private network (`*.railway.internal` will not work from your laptop).
2. Export `DATABASE_URL` with that public host.
3. Backup:

```bash
chmod +x scripts/pg-backup.sh
DATABASE_URL='postgresql://…' ./scripts/pg-backup.sh
# uses postgres:18 via Docker by default (matches Railway); writes ./backups/alice-<utc>.dump
```

4. Store the `.dump` file somewhere durable (encrypted drive, object storage, etc.).
5. Optional cron (local or CI with secrets): run the same command daily and retain N copies.

### Restore (Hobby logical dump)

1. Provision a fresh Railway Postgres (or empty local DB). Prefer **not** wiping production in place until verified.
2. Restore:

```bash
docker run --rm -e DATABASE_URL -v "$PWD/backups:/backups" postgres:18 \
  pg_restore --clean --if-exists --no-owner --no-acl -d "$DATABASE_URL" \
  /backups/alice-YYYYMMDD.dump
```

3. Point web `DATABASE_URL` / `NUXT_DATABASE_URL` at the restored DB; redeploy so `preDeployCommand` can no-op or apply newer migrations.
4. Smoke staging (or production only after a restore of production data): sign in, open a Rabbit Hole, create a small new hole if needed.
5. Keep the previous DB until smoke passes.

### Pro+ (optional later)

If you upgrade: Railway → Postgres → volume → **Backups** → enable Daily (+ Weekly on production). Then restore via the dashboard (new volume / PITR) and repoint `DATABASE_URL` the same way as above.

## Day-2 commands

```bash
railway environment staging     # or production
railway logs --service web --environment production
railway variable list --service web --environment staging

# promote (after smoke)
git fetch origin
git push origin origin/main:production
```

## Quotas and billing caps

Before inviting others:

1. **YouTube Data API (Google Cloud):**
   - Enable billing alerts on the GCP project.
   - Set a daily quota alert below the default 10,000 units.
   - Keep `NUXT_EXPAND_DAILY_BUDGET` low (default 50 expands/user/day). Staging should use a non-production key or the same cap.
2. **AI provider (OpenAI or compatible, e.g. OpenRouter):**
   - `NUXT_AI_API_KEY` must match `NUXT_AI_BASE_URL` (OpenRouter keys → `https://openrouter.ai/api/v1`; OpenAI keys → `https://api.openai.com/v1`).
   - OpenRouter models use vendor-prefixed ids (e.g. `openai/gpt-4o-mini`).
   - Hard monthly spend cap / budget alert in the vendor console.
   - `NUXT_EXPAND_DISABLED=true` is an emergency switch, not the staging default.
3. **Railway:** workspace spend alerts if available.
4. Re-check after first week of real Expand traffic; tighten caps before public invite.
