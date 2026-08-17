## 1. Compiler and dependencies

- [x] 1.1 Add `zod` as a runtime dependency
- [x] 1.2 Pin `typescript.strict: true` and `noUncheckedIndexedAccess: true` via `nuxt.config.ts` `typescript.tsConfig`; do not set `exactOptionalPropertyTypes` or `typescript.typeCheck`

## 2. Shared contracts and schema

- [x] 2.1 Add `shared/types` modules for hole/path/ledger unions, list summary, graph payload, create/rename bodies, Expand patch, and watch response (wire timestamps as ISO strings)
- [x] 2.2 Type Drizzle `rabbit_holes.status`, `path_events.kind`, and `expand_ledger.status` as those unions while leaving Postgres columns as `text`
- [x] 2.3 Map `loadHoleGraph` and list/create/rename handler returns onto the shared wire types instead of raw Drizzle rows

## 3. Runtime parsing

- [x] 3.1 Parse create and rename bodies with Zod + `readValidatedBody` (or equivalent); reject mismatches with 4xx and no write
- [x] 3.2 Parse AI Expand JSON with Zod; drop forks whose `videoId` is not in the candidate set; keep retry-once then fail-soft
- [x] 3.3 `safeParse` YouTube related-cache payloads; treat failure as a cache miss and refetch

## 4. Auth event typing

- [x] 4.1 Remove `as never` from `requireUserSession` / `setUserSession` / `clearUserSession` / `sendRedirect` in API handlers; add `server/utils/session.ts` only if typecheck still fails
- [x] 4.2 Same cleanup in `server/middleware/01-protect-api.ts` and `server/routes/auth/*`

## 5. Vue and indexed access

- [x] 5.1 Replace page-local `Hole` / `HolePayload` / `Node` / `Edge` types with the shared contracts on `$fetch`
- [x] 5.2 Point `RabbitHoleGraph` props at the shared node/edge types
- [x] 5.3 Replace non-null assertions and unchecked index/shift access in `RabbitHoleGraph.vue` so `noUncheckedIndexedAccess` type-checks

## 6. Lint and verify

- [x] 6.1 Enable type-aware ESLint (`no-explicit-any`, unsafe assignment/member access, unnecessary assertions) and fail `as never` at handler/middleware/route call sites
- [x] 6.2 Confirm `.github/workflows/ci.yml` still runs `npm run lint` and `npm run typecheck`
- [ ] 6.3 Run `npm run lint` and `npm run typecheck` until both pass
