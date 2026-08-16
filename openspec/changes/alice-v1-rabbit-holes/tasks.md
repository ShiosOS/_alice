## 1. Project foundation

- [ ] 1.1 Scaffold Nuxt + TypeScript + Vue app in the repo with lint/typecheck scripts
- [ ] 1.2 Add env/config skeleton for database, auth, YouTube, AI, and app URL (server-only secrets)
- [ ] 1.3 Choose and document hosting lane (long-running vs serverless) and wire a single production deploy target
- [ ] 1.4 Add CI for lint/typecheck on PRs and deploy from main

## 2. Database and domain schema

- [ ] 2.1 Provision managed Postgres and connect the Nuxt server via migrations tooling
- [ ] 2.2 Create tables for users, rabbit_holes, nodes, edges, path state/events, expand_ledger, youtube_cache
- [ ] 2.3 Add indexes and uniqueness constraints from design (hole ownership queries, graph load by hole, ledger rate limits, cache PK)
- [ ] 2.4 Enable automated DB backups on the managed provider and verify restore docs exist

## 3. User auth

- [ ] 3.1 Integrate one identity provider (OAuth or magic link) with HTTP-only sessions
- [ ] 3.2 Protect Rabbit Hole and Expand APIs so unauthenticated requests are denied
- [ ] 3.3 Implement account deletion that removes the user and associated personal product data
- [ ] 3.4 Require Terms acknowledgment on first-time access before Rabbit Holes are usable

## 4. YouTube integration

- [ ] 4.1 Implement server-side YouTube client for video resolve + related/candidates (API only, no scraping)
- [ ] 4.2 Parse/validate YouTube URL forms into canonical video ids for seed creation
- [ ] 4.3 Implement youtube_cache read/write with TTL ≤ 30 days refresh-or-delete behavior
- [ ] 4.4 Handle unavailable/deleted videos gracefully in API responses used by the graph
- [ ] 4.5 Add YouTube attribution/branding affordances wherever titles/thumbnails are shown

## 5. AI-backed Expand engine

- [ ] 5.1 Implement AI service interface with strict JSON schema output for `{ videoId, phrase }[]`
- [ ] 5.2 Implement Expand orchestrator: authz, rate limit, candidates, dedupe, AI select/phrase, transactional persist, ledger write
- [ ] 5.3 Implement bootstrap policy: seed + 3 forks + 2 children each (~10 nodes) reusing Expand
- [ ] 5.4 Add per-user expand budget checks (bootstrap consumes budget) and clear exhaustion errors
- [ ] 5.5 Add retry-once / fail-soft behavior for invalid AI output without committing junk edges
- [ ] 5.6 Add emergency kill switch env flag to disable Expand/AI calls

## 6. Rabbit Holes API and UI

- [ ] 6.1 Implement list / create-from-URL / get / rename / delete Rabbit Hole APIs with ownership checks
- [ ] 6.2 Build Rabbit Holes list UI with empty state and “Start a new Rabbit Hole”
- [ ] 6.3 Build create flow (URL input, validation errors, bootstrap progress, incomplete/retry on failure)
- [ ] 6.4 Build hole header actions (title edit, delete confirm)

## 7. Graph exploration UI

- [ ] 7.1 Build interactive graph view for nodes/edges with client-side layout (desktop + mobile web)
- [ ] 7.2 Render short direction phrases on forks without AI/label chrome
- [ ] 7.3 Add explicit Expand control on a focused node and apply returned graph patches
- [ ] 7.4 Deep-link watch action to YouTube and mark node visited on Path
- [ ] 7.5 Highlight Path nodes vs frontier on load and after updates
- [ ] 7.6 Verify core actions work with the same model on a mobile viewport (focus/zoom defaults as needed)

## 8. Site policies and shell

- [ ] 8.1 Write and publish `/privacy` covering collection, processors (host/DB/auth/YouTube/AI), retention sketch, deletion
- [ ] 8.2 Write and publish `/terms` covering acceptable use, non-affiliation, YouTube playback, no-warranty
- [ ] 8.3 Add About (or equivalent) non-affiliation disclosure
- [ ] 8.4 Link Privacy and Terms from app shell footer (auth and unauth)

## 9. Production hardening

- [ ] 9.1 Add error tracking (e.g. Sentry) for server Expand/bootstrap failures
- [ ] 9.2 Add structured logging for expand ledger metrics (counts, AI/YT failures) without leaking secrets
- [ ] 9.3 Configure AI vendor and YouTube billing/quota caps/alerts where available
- [ ] 9.4 End-to-end smoke: sign in → start Rabbit Hole → see ~10-node graph → Expand → Path → watch on YouTube → reopen on second browser
