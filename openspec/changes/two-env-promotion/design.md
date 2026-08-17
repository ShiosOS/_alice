## Context

See proposal.md for motivation. Today one Railway project (`_alice`) has three environments (`production`, `staging`, `feature`) duplicated from production; `scripts/railway-bootstrap.sh` points the GitHub-linked `web` service at `main` for all of them. CI (`.github/workflows/ci.yml`) lints and typechecks; a commented `railway up` on `main` would ship without an environment pin. `railway.toml` healthcheck is `GET /`. `scripts/e2e-smoke.mjs` defaults `SMOKE_BASE_URL` to production. Docs and OAuth still name `alice-feature.shiosos.dev`.

Constraints: stay on Railway (Nuxt + Postgres, long-running Expand); GitHub private repo cannot assume classic branch protection; do not introduce a second deployer (Actions + Railway autodeploy).

## Goals / Non-Goals

**Goals:**
- Make git, Railway triggers, and docs describe the same two environments
- One promote primitive: fast-forward `production` from `main` after staging smoke
- Staging is a real dress rehearsal (Expand on, cheap keys)
- Cutover uses a DB-aware readiness check

**Non-Goals:**
- Changing Expand/auth product behavior
- PR preview environments or a `staging` git branch
- Docker Compose / Dockerfile (orthogonal local DX)
- Railway environment Sync as the promote button
- Implementing a full automated test suite (CI remains lint/typecheck; smoke stays a script)

## Decisions

### D1: `production` git branch as the promote pointer (not tags, not CLI-only)
- **Choice:** `main` = trunk / staging trigger. `production` = fast-forward-only pointer / production trigger. Promote: `git push origin origin/main:production` after smoke. Lag is `git log origin/production..origin/main`.
- **Why:** Railway GitHub autodeploy watches branches natively. The pointer is visible in git without a deploy Action. Tags would need an extra shipper; CLI-only promote leaves “what is prod?” only in the Railway UI.
- **Alternatives:** Gitflow (`staging` branch → `main` as prod) — inverts current trunk and adds a long-lived second workspace. Tags + GitHub Action — two deploy mechanisms. `railway up --environment production` of a SHA — works, but git does not record the gate.

### D2: Railway autodeploy is the only shipper; CI is the gate
- **Choice:** Enable Wait for CI on both `web` services. Delete the commented Actions deploy job. Do not add a new `railway up` workflow.
- **Why:** Two shippers fight. Wait for CI holds the Railway deploy until the existing `check` workflow succeeds.
- **Alternatives:** Actions deploys staging, Railway deploys production — easy to point at the wrong env. Uncommented `railway up` on `main` — the current footgun.

### D3: Retire `feature`; do not replace it with PR envs in this change
- **Choice:** Delete the Railway `feature` environment, Cloudflare `alice-feature` CNAME, and Google OAuth redirect. Bootstrap and docs list only staging + production.
- **Why:** Feature was a third twin of `main`, not a stage. Persistent staging already has a stable OAuth origin. PR previews are useful later but need extra domain/OAuth work.
- **Alternatives:** Keep feature as a dirty sandbox — cost without a distinct job. Enable Railway PR environments now — out of scope.

### D4: Staging Expand on by default, with non-prod keys
- **Choice:** `NUXT_EXPAND_DISABLED=false` on staging (panic flag still exists). Staging YouTube/AI keys are separate or quota-capped; production spend keys stay production-only. Session passwords remain per-env (already randomized in bootstrap).
- **Why:** Specs require the promote gate to include Expand. Expand-off staging only proves the shell.
- **Alternatives:** Leave Expand off and smoke only signed-out pages — fails the “prod only has stuff that works” goal.

### D5: Readiness route, not `GET /`
- **Choice:** Add an unauthenticated `GET /health` (or `/api/health`) that 200s only after a cheap DB ping (`select 1`). Point `railway.toml` `healthcheckPath` at it. Do not treat homepage 200 as ready.
- **Why:** Migrations run in `preDeployCommand`; the Node process can still listen while Postgres is wrong. Railway only cuts traffic over after this check.
- **Alternatives:** Keep `/` — weaker gate. Full dependency check (YouTube/AI) — flakes deploys on third-party outages.

### D6: Node version from `.nvmrc`; ignore `.railway/`
- **Choice:** CI `setup-node` uses `node-version-file: .nvmrc` (`22.18.0`, already matches `engines`). Gitignore `.railway/` so a linked CLI config cannot be committed. Enable GitHub delete-branch-on-merge. Add CI concurrency cancel-in-progress per ref.
- **Why:** One Node pin; local Railway link is machine state; merged `cursor/*` branches currently accumulate.
- **Alternatives:** Leave `'22'` in CI — drift from engines. Commit `.railway` — every clone looks linked.

### D7: Bootstrap and docs match the two-env model
- **Choice:** Rewrite `scripts/railway-bootstrap.sh` to create/link only `production` and `staging`, set staging Expand on, set per-env URLs, and print the promote command. README / `docs/deploy.md` / `docs/smoke.md` drop feature. `e2e-smoke.mjs` default base URL becomes staging. Do not rewrite OpenSpec archive history.
- **Why:** Leftover three-env copy is how the old model keeps winning.
- **Alternatives:** Only change Railway in the dashboard — repo still teaches the wrong flow.

## Risks / Trade-offs

- **[Direct push to `main`]** → Private GitHub may not allow required status checks. The `production` pointer is the real gate; document “do not commit on `production`.”
- **[Non-FF promote]** → Refuse; if `production` diverged, reset only with an explicit force after inspection. Never develop on `production`.
- **[Staging Expand burns quota]** → Staging-specific keys and low `NUXT_EXPAND_DAILY_BUDGET`; panic `NUXT_EXPAND_DISABLED`.
- **[Migrations on promote]** → Same SHA migrates each DB independently via `preDeployCommand`. Additive-only remains the migration rule. Rollback is Railway previous image; it does not reverse SQL.
- **[Sync environments used by habit]** → Docs MUST say not to Sync staging → production (would copy URLs / Expand flags). Promote is the git pointer only.
- **[Healthcheck false-negative]** → Ping must be short and not call YouTube/AI; otherwise deploys fail on vendor blips.
- **[Existing `feature` data]** → Throwaway sandbox; dump if anything matters, then delete. No migration into staging.

## Migration Plan

1. Land repo changes (health route, CI, gitignore, bootstrap, docs, smoke default) on `main` → they deploy to current staging (and today also to production/feature until triggers are retargeted — **retarget production’s GitHub branch before merging if autodeploy from `main` is still on**, or temporarily disable production autodeploy, then merge).
2. Create `production` branch at the SHA production is already running (or at current `main` if they match). Point Railway production `web` trigger at `production`; staging `web` at `main`; Wait for CI on both.
3. Set staging Expand on + staging keys; confirm production secrets are not shared session passwords.
4. Delete Railway `feature` env; remove Cloudflare CNAME and OAuth URI.
5. Enable delete-branch-on-merge. Optionally delete stale merged `cursor/*` remotes.
6. Smoke staging; FF `production`; confirm production SHA matches.
7. Rollback: Railway rollback previous production deployment; leave `production` branch pointing at the bad SHA until a revert lands on `main` and is smoked, then FF again (or force `production` to the last good SHA and redeploy).

## Open Questions

- Exact health path (`/health` vs `/api/health`) — pick whichever Nuxt/Nitro serves without auth middleware; does not change requirements.
- Whether to prune historical `cursor/*` remote branches in this change or leave as a manual ops note.
