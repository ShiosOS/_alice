## 1. Project foundation

- [x] 1.1 Scaffold Nuxt + TypeScript + Vue app in the repo with lint/typecheck scripts
- [x] 1.2 Add env/config skeleton for database, auth, YouTube, AI, and app URL (server-only secrets)
- [ ] 1.3 Create Railway project with Nuxt web service deploy (env vars, HTTPS) as the production host
- [ ] 1.4 Add custom domain `alice.shiosos.dev`: Railway custom domain + Cloudflare DNS on `shiosos.dev`; set `APP_URL=https://alice.shiosos.dev`
- [x] 1.5 Add CI for lint/typecheck on PRs and deploy from main to Railway

## 2. Database and domain schema

- [ ] 2.1 Provision Railway Postgres, attach `DATABASE_URL` to the Nuxt service, and connect via migrations tooling
- [x] 2.2 Create tables for users, rabbit_holes, nodes, edges, path state/events, expand_ledger, youtube_cache
- [x] 2.3 Add indexes and uniqueness constraints from design (hole ownership queries, graph load by hole, ledger rate limits, cache PK)
- [ ] 2.4 Enable automated Postgres backups on Railway and verify restore docs exist

## 3. User auth

- [x] 3.1 Integrate one identity provider (OAuth or magic link) with HTTP-only sessions; configure callbacks for `https://alice.shiosos.dev` and localhost
- [x] 3.2 Protect Rabbit Hole and Expand APIs so unauthenticated requests are denied
- [x] 3.3 Implement account deletion that removes the user and associated personal product data
- [x] 3.4 Require Terms acknowledgment on first-time access before Rabbit Holes are usable

## 4. YouTube integration

- [x] 4.1 Implement server-side YouTube client for video resolve + related/candidates (API only, no scraping)
- [x] 4.2 Parse/validate YouTube URL forms into canonical video ids for seed creation
- [x] 4.3 Implement youtube_cache read/write with TTL ≤ 30 days refresh-or-delete behavior
- [x] 4.4 Handle unavailable/deleted videos gracefully in API responses used by the graph
- [x] 4.5 Add YouTube attribution/branding affordances wherever titles/thumbnails are shown

## 5. AI-backed Expand engine

- [x] 5.1 Implement AI service interface with strict JSON schema output for `{ videoId, phrase }[]`
- [x] 5.2 Implement Expand orchestrator: authz, rate limit, candidates, dedupe, AI select/phrase, transactional persist, ledger write
- [x] 5.3 Implement bootstrap policy: seed + 3 forks + 2 children each (~10 nodes) reusing Expand
- [x] 5.4 Add per-user expand budget checks (bootstrap consumes budget) and clear exhaustion errors
- [x] 5.5 Add retry-once / fail-soft behavior for invalid AI output without committing junk edges
- [x] 5.6 Add emergency kill switch env flag to disable Expand/AI calls

## 6. Rabbit Holes API and UI

- [x] 6.1 Implement list / create-from-URL / get / rename / delete Rabbit Hole APIs with ownership checks
- [x] 6.2 Build Rabbit Holes list UI with empty state and “Start a new Rabbit Hole”
- [x] 6.3 Build create flow (URL input, validation errors, bootstrap progress, incomplete/retry on failure)
- [x] 6.4 Build hole header actions (title edit, delete confirm)

## 7. Graph exploration UI

- [x] 7.1 Build interactive graph view for nodes/edges with client-side layout (desktop + mobile web)
- [x] 7.2 Render short direction phrases on forks without AI/label chrome
- [x] 7.3 Add explicit Expand control on a focused node and apply returned graph patches
- [x] 7.4 Deep-link watch action to YouTube and mark node visited on Path
- [x] 7.5 Highlight Path nodes vs frontier on load and after updates
- [x] 7.6 Verify core actions work with the same model on a mobile viewport (focus/zoom defaults as needed)

## 8. Site policies and shell

- [x] 8.1 Write and publish `/privacy` covering collection, processors (host/DB/auth/YouTube/AI), retention sketch, deletion
- [x] 8.2 Write and publish `/terms` covering acceptable use, non-affiliation, YouTube playback, no-warranty
- [x] 8.3 Add About (or equivalent) non-affiliation disclosure
- [x] 8.4 Link Privacy and Terms from app shell footer (auth and unauth)

## 9. Production hardening

- [ ] 9.1 Add error tracking (e.g. Sentry) for server Expand/bootstrap failures
- [ ] 9.2 Add structured logging for expand ledger metrics (counts, AI/YT failures) without leaking secrets
- [ ] 9.3 Configure AI vendor and YouTube billing/quota caps/alerts where available
- [ ] 9.4 End-to-end smoke: sign in → start Rabbit Hole → see ~10-node graph → Expand → Path → watch on YouTube → reopen on second browser
