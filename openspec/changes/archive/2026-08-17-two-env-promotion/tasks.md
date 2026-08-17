## 1. Readiness and CI gate

- [x] 1.1 Add unauthenticated `GET /health` (Nitro `server/routes/health.get.ts`) that pings the environment database (`select 1`) and returns HTTP 200 only on success; do not call YouTube or AI
- [x] 1.2 Confirm `/health` is not covered by `server/middleware/01-protect-api.ts` (and keep it that way)
- [x] 1.3 Set `railway.toml` `healthcheckPath` to `/health` (leave Railpack, `preDeployCommand`, start command, restart policy)
- [x] 1.4 Update `.github/workflows/ci.yml`: `node-version-file: .nvmrc`, concurrency cancel-in-progress per ref, delete the commented `railway up` deploy job; keep lint + typecheck only
- [x] 1.5 Add `.railway/` to `.gitignore`

## 2. Smoke and operator docs in repo

- [x] 2.1 Default `SMOKE_BASE_URL` in `scripts/e2e-smoke.mjs` to `https://alice-staging.shiosos.dev`
- [x] 2.2 Rewrite `scripts/railway-bootstrap.sh` for only `production` and `staging`: staging Expand on (`NUXT_EXPAND_DISABLED=false`), per-env URLs, no `feature`; print promote as `git push origin origin/main:production`
- [x] 2.3 Rewrite `docs/deploy.md`: two environments, git pointer promotion, Wait for CI, do not Railway-Sync to promote, staging keys vs prod keys, migration order (retarget production trigger before merging while `main` still autodeploys prod)
- [x] 2.4 Rewrite `docs/smoke.md`: smoke staging before promote; drop feature host; keep the API smoke command pointed at staging
- [x] 2.5 Update `README.md`: staging + production URLs, promote pointer, drop the archived `openspec/changes/alice-v1-rabbit-holes/` path (point at `openspec/` or this change)

## 3. GitHub and Railway (dashboard / CLI)

- [ ] 3.1 Disable production autodeploy from `main` (or point it at a not-yet-pushed `production` branch) **before** merging this change if production still tracks `main`
- [x] 3.2 Create `origin/production` at the SHA production is currently running (fast-forward only from then on; never commit on it)
- [ ] 3.3 Set Railway `web` GitHub trigger: staging ← `main`, production ← `production`; enable Wait for CI on both
- [ ] 3.4 Set staging `NUXT_EXPAND_DISABLED=false` and staging-only (or quota-capped) YouTube/AI keys; leave production spend keys on production; confirm session passwords differ
- [ ] 3.5 Delete Railway `feature` environment; remove Cloudflare `alice-feature` CNAME; remove Google OAuth redirect `https://alice-feature.shiosos.dev/auth/google`
- [ ] 3.6 Enable GitHub delete-branch-on-merge for `ShiosOS/_alice`

## 4. Verify

- [x] 4.1 Run `npm run lint` and `npm run typecheck`
- [ ] 4.2 After merge to `main`: confirm staging deploys that SHA, production SHA does not change, `GET https://alice-staging.shiosos.dev/health` is 200
- [ ] 4.3 Smoke staging (checklist + optional `e2e-smoke.mjs`), then FF `production`, confirm production SHA matches and `GET https://alice.shiosos.dev/health` is 200
