## Context

Greenfield repo (`README` + empty OpenSpec config). Product direction and vocabulary are captured in `proposal.md`. Stack lean: **Nuxt + Vue + TypeScript**, **Postgres**, server-side **YouTube Data API** and **AI** for invisible fork phrases, watch via **YouTube deep link**, same graph UX on mobile web.

Constraints that shape the design: YouTube quota and AI cost dominate scale; API cache retention (~30-day refresh/delete); no scraping; production-like auth, migrations, backups, rate limits, and policy pages even for early solo use; **Railway** hosts the Nuxt app and Postgres; public origin is **`https://alice.shiosos.dev`** (Cloudflare DNS on `shiosos.dev`).

## Goals / Non-Goals

**Goals:**
- Nuxt monolith (UI + server API) with clear domain/service boundaries
- Postgres as source of truth for users, Rabbit Holes, nodes/edges, Path, expand ledger, and YouTube cache rows
- One Expand orchestrator reused by bootstrap policy (10-node) and explicit Expand
- Cost/quota guards and compliance-aware cache TTL from day one
- Deploy on **Railway** (Nuxt service + Railway Postgres) with HTTPS, migrations, env secrets, and minimal observability
- Serve the app at **`https://alice.shiosos.dev`** via Cloudflare DNS on the existing `shiosos.dev` zone

**Non-Goals:**
- Microservices, graph database, Redis-required v1, native apps
- In-app player, social/public Rabbit Hole gallery, visible AI chat, Stripe paywall
- Perfect watch-completion tracking from YouTube (v1 Path = opened/visited from `_alice`)

## Decisions

### D1: Nuxt monolith over split frontend/backend
- **Choice:** Single Nuxt app with server routes/services.
- **Why:** Batteries-included Vue stack; one deploy; server keeps AI/YouTube keys off the client.
- **Alternatives:** Separate Nest/API + SPA — more ops for no v1 gain.

### D2: Postgres normalized graph (not graph DB, not hole-as-JSON blob)
- **Choice:** Tables for `users`, `rabbit_holes`, `nodes`, `edges`, `path_events` (or node Path state), `expand_ledger`, `youtube_cache`.
- **Why:** Uniqueness (`hole_id + video_id`), transactional Expand, metering, and years of headroom at thousands of users.
- **Alternatives:** Neo4j (ops overhead); whole-hole JSON (weak integrity/query).

### D3: Indexes oriented to read-heavy hole loads
- Hot path is opening a hole (read nodes/edges/path by `rabbit_hole_id`).
- Writes are spiky on Expand but tiny row counts; external I/O dominates.
- Key indexes: `(user_id, updated_at DESC)` on holes; `(rabbit_hole_id)` on nodes/edges/path; uniques on `(rabbit_hole_id, video_id)` and `(from_node_id, to_node_id)`; `(user_id, created_at)` on ledger.

### D4: Expand orchestrator + bootstrap policy
```
Expand(node):
  authz → rate limit → load context → YT candidates (cache) →
  filter in-graph dupes → AI diversify + short phrases (JSON schema) →
  persist nodes/edges + ledger → return patch
```
- Bootstrap: create hole + seed → Expand(seed, take 3) → Expand each child (take 2) → ~10 nodes.
- AI is infrastructure behind Expand; UI verb remains Expand.

### D5: Sync Expand with timeout awareness; bootstrap may show progress
- **Choice:** Sync single Expand on Railway’s long-running Nuxt service; bootstrap may run sequential expands with progress UI.
- **Why (with Railway):** Avoids premature async job infrastructure that serverless timeouts would force.
- **Alternatives:** Always-async queue day one — extra complexity before proven need; Vercel/Netlify serverless — likely needs async bootstrap earlier.

### D6: Auth — one provider
- **Choice:** One OAuth or magic-link provider; HTTP-only session cookies.
- **Why:** Multi-device Rabbit Holes without building password auth.
- **Alternatives:** Local-only/no auth — blocks phone+laptop production shape.

### D7: Path = visited when opened from `_alice`
- **Choice:** Mark Path when user opens out to YouTube; optional explicit “watched” later.
- **Why:** Player is external; completion signals unavailable without friction.

### D8: Client-computed layout
- **Choice:** Persist graph topology; compute positions in the client.
- **Why:** Avoid layout schema churn; keep mobile/desktop presentation flexible under one model.

### D9: YouTube cache in Postgres with TTL ≤ 30 days
- **Choice:** `youtube_cache` keyed by `video_id` + `fetched_at`; refresh/delete on TTL.
- **Why:** Cuts quota burn; aligns with API storage expectations; Redis deferred.

### D10: Hosting on Railway
- **Choice:** **Railway** for the Nuxt web service and **Railway Postgres** as the managed database.
- **Why:** One platform for app + DB; long-running server suits sync Expand/bootstrap; env vars for secrets; straightforward HTTPS deploy; Postgres backups available on the platform.
- **Also:** CI lint/typecheck; deploy from main to Railway; error tracking (e.g. Sentry).
- **Alternatives:** Vercel/Netlify + external Postgres (faster frontend DX, weaker Expand timeout story); Fly/Render (similar long-running model, split mental billing).

### D11: Custom domain `alice.shiosos.dev` (Cloudflare)
- **Choice:** Use subdomain **`alice.shiosos.dev`** on the existing Cloudflare-managed zone **`shiosos.dev`**.
- **How:** Add the Railway custom domain for the Nuxt service; create the Cloudflare DNS record Railway requires (typically CNAME for `alice` → Railway hostname); enable HTTPS on that hostname; set `APP_URL=https://alice.shiosos.dev`.
- **Auth:** Register OAuth/magic-link callback URLs for `https://alice.shiosos.dev` (plus localhost for dev).
- **Why:** Reuses an owned domain now; keeps `_alice` namespaced without buying a new apex yet; easy to move or add `www`/apex later.
- **Alternatives:** Railway `*.up.railway.app` only (fine for private smoke, weaker production surface); separate apex domain (unnecessary for v1).

### D12: Site policies in-app
- Static or CMS-light `/privacy`, `/terms`, About non-affiliation; footer links; Terms ack on first access; served under `alice.shiosos.dev`.

### D13: Vocabulary
- User-facing: **Rabbit Holes**, **Start a new Rabbit Hole**, **Expand**, short phrases on forks, **Path**.
- Internal-only: “label”, “AI”.

## Risks / Trade-offs

- **[AI phrase quality / sameness] →** Strict JSON schema, diversity objective in prompt, retry once, cap candidates; fail soft rather than near-duplicate spam.
- **[YouTube quota] →** Shared cache by `video_id`, minimize calls per Expand, ledger caps, quota monitoring.
- **[AI cost runaway] →** Per-user daily expand budget; bootstrap counts; emergency disable flag; keys server-only.
- **[Bootstrap latency / timeouts] →** Progress UI; sequential expands; async jobs if host requires.
- **[Mobile graph density] →** Same model with denser focus/zoom defaults; keep breadth caps (3/2).
- **[Weak return from YouTube] →** Accept planning/continue-hole sessions; Path + list of Rabbit Holes as resume anchors—not companion runtime.
- **[API retention compliance] →** TTL job for `youtube_cache` / refreshable metadata; product graph IDs + phrases retained with hole until user delete.
- **[Partial bootstrap] →** Transactional per Expand step; mark hole incomplete on failure; allow retry bootstrap/expand.

## Migration Plan

- Greenfield: no data migration.
- Deploy order: Railway + `alice.shiosos.dev` DNS → schema migrations → app with auth (callbacks on that origin) → feature flags for Expand if needed → policy pages before opening signups beyond self.
- Rollback: revert app deploy; DB migrations forward-only with expand-safe additive schema where possible.
- Future premium expand: gate on `expand_ledger` counts—no domain rewrite.

## Open Questions

- Exact auth provider (Google OAuth vs magic link) — pick at implement time; specs only require one provider.
- Exact AI vendor/model — swappable behind `ai` service interface.
- Whether bootstrap failure leaves seed-only hole vs deletes hole — prefer seed + incomplete + retry for recoverability.
