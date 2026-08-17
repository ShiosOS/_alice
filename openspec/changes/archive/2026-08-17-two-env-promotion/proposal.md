## Why

Production, staging, and feature all track the same git branch, so a merge can land on live `alice.shiosos.dev` without a dress rehearsal. `_alice` needs two isolated environments and a promote step so production only runs a commit that already worked on staging.

## What Changes

- Keep **two** persistent Railway environments: `staging` (`https://alice-staging.shiosos.dev`) and `production` (`https://alice.shiosos.dev`). Remove the always-on `feature` environment and its DNS/OAuth leftovers
- Encode promotion in git: `main` is trunk (what staging runs); a fast-forward-only `production` branch is the pointer Railway production watches
- Staging autodeploys from `main` after CI; production autodeploys only from the `production` branch (never from every merge to `main`)
- GitHub Actions stays a **gate** (lint/typecheck, later tests). Delete the commented `railway up` on `main` so CI does not ship
- Staging must be able to exercise the real product path, including Expand (cheap keys / tight budget), so the promote gate is not “the homepage loaded”
- Point smoke docs and `e2e-smoke` at staging by default
- Align Node (CI reads `.nvmrc`), ignore `.railway/`, turn on delete-branch-on-merge, and rewrite deploy/README so they describe two worlds instead of three
- Add a deploy health/readiness endpoint so Railway cutover is not just `GET /`
- Non-goals: Docker-as-hosting, a long-lived `staging` git branch, PR preview environments, Railway Sync as promote, Kubernetes, splitting the Nuxt monolith, paid GitHub branch protection, Dependabot/CODEOWNERS

## Capabilities

### New Capabilities
- `release-environments`: Isolated staging and production, git-encoded promotion so production only runs a smoked commit, staging can run the full product path, and deploys have a readiness check

### Modified Capabilities
- (none — product requirements for auth, Rabbit Holes, Expand, YouTube, and policies stay the same; this change is how those capabilities are hosted and promoted)

## Impact

- Railway: drop `feature`; retarget web service GitHub triggers (`main` → staging, `production` → production); Wait for CI; per-env secrets and `NUXT_PUBLIC_APP_URL`; Expand **on** in staging with non-prod keys
- GitHub: `production` branch; delete-branch-on-merge; CI concurrency and `node-version-file`; no Action deploy
- Cloudflare: remove `alice-feature` CNAME; Google OAuth: remove feature redirect URI
- Repo: `railway.toml` healthcheck, `.gitignore`, `scripts/railway-bootstrap.sh`, `scripts/e2e-smoke.mjs`, `docs/deploy.md`, `docs/smoke.md`, `README.md`, new health route
- Operators promote with `git push origin origin/main:production` after staging smoke (`git log origin/production..origin/main` is the lag)
