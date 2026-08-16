## Why

YouTube rabbit holes are easy to fall into and hard to steer: related videos are opaque, depth is accidental, and there is no durable map of a topic exploration. `_alice` gives intentional foresight—paste a seed video, see how the hole branches with short direction phrases, go deeper on purpose, and keep separate Rabbit Holes for different curiosities—built first for the creator’s own use, shaped as a production-ready product others could adopt later.

## What Changes

- Greenfield Nuxt (Vue + TypeScript) web app with the same graph experience on desktop and mobile browsers
- **Rabbit Holes**: list, start from a YouTube URL seed, reopen, and delete personal topic explorations
- **Graph as the interface**: bootstrap a first graph of ~10 nodes (seed → 3 labeled forks → 2 children each); further growth only via explicit Expand
- **Path**: record what the user has opened/visited within a Rabbit Hole so progress on a shaft is visible
- **Invisible AI** behind Expand/bootstrap to diversify candidates and write short fork phrases (no chat UI; no “Ask AI” verb)
- **Watch on YouTube** via deep link (no in-app player in v1)
- **Auth** with a single sign-in provider so Rabbit Holes sync across devices
- **Postgres** as source of truth; server-side YouTube API + AI calls; expand rate limits/ledger
- **Public surface**: short Privacy Policy, Terms of Use, and “not affiliated with YouTube/Google” disclosure
- Non-goals for v1: native apps, in-app player, public/social Rabbit Hole gallery, visible AI chat, billing/paywall (expand may be monetized later), scraping YouTube

## Capabilities

### New Capabilities
- `user-auth`: Single-provider sign-in, sessions, and account deletion for personal Rabbit Holes
- `rabbit-holes`: Create, list, open, update title, and delete URL-seeded topic explorations
- `graph-exploration`: Graph UI, 10-node bootstrap, explicit Expand with short phrases, Path highlighting, rate-limited growth
- `youtube-integration`: Official YouTube Data API usage, metadata/related caching with refresh/delete TTL, deep links, attribution
- `site-policies`: Privacy Policy, Terms of Use, and non-affiliation copy linked from the app

### Modified Capabilities
- (none — greenfield; no existing specs)

## Impact

- New application codebase (Nuxt + Vue + TypeScript), managed Postgres, auth provider, YouTube Data API, and an AI provider for fork phrases
- **Host on Railway** (app + Postgres) so Expand/bootstrap can run on a long-enough server runtime with env secrets, HTTPS, and automated DB backups
- **Public URL:** `https://alice.shiosos.dev` — Cloudflare DNS for `shiosos.dev` pointing the `alice` subdomain at the Railway service (custom domain + TLS)
- Compliance-aware retention for API-sourced caches (~30-day refresh/delete) while product graph/Path/phrases persist with the Rabbit Hole until user deletion
- Future leeway: expand ledger supports later premium caps without changing the core domain model
