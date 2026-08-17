## Why

The app is already TypeScript files and CI runs `nuxt typecheck`, but types do not actually constrain the places that matter: auth helpers are called with `event as never`, Vue pages re-declare API shapes by hand, request bodies and AI JSON are asserted rather than parsed, and domain fields such as hole `status` are plain `string`. Strict checking is decorative until those holes close.

## What Changes

- Pin TypeScript policy in Nuxt config: keep `strict`, add `noUncheckedIndexedAccess`, leave `exactOptionalPropertyTypes` off
- Remove `as never` (and equivalent escape hatches) from auth and Nitro event usage; wrap `nuxt-auth-utils` if the library’s event type is the mismatch
- Share Rabbit Hole / graph / Path payload types from `shared/` so server handlers and Vue `$fetch` calls use one contract instead of local copies
- Type domain values that are currently free-form text: hole status, path kind, expand ledger status
- Parse untrusted input at the edges (HTTP bodies, AI JSON, YouTube cache payloads) instead of `readBody<T>` / `JSON.parse as T`
- Turn on type-aware ESLint rules that catch unsafe assertions
- Non-goals: annotating every local `ref` / inferred variable; `exactOptionalPropertyTypes`; rewriting product behavior; Postgres enum migrations unless Drizzle text unions are not enough

## Capabilities

### New Capabilities
- `type-safety`: Compiler, lint, shared contracts, domain unions, and runtime parsing so TypeScript describes and checks the real data that crosses module and HTTP boundaries

### Modified Capabilities
- (none: `alice-v1-rabbit-holes` deltas are not archived to `openspec/specs/` yet; this change does not alter those product requirements)

## Impact

- `nuxt.config.ts`, `eslint.config.mjs`, and CI still run `lint` + `typecheck` (same jobs; they must pass with the tighter flags)
- Server handlers under `server/api/` and `server/routes/auth/`, plus `server/middleware/01-protect-api.ts`
- `shared/types/` (new contracts alongside existing `auth.d.ts`)
- Vue pages/components that currently inline `Hole` / `HolePayload` / `GNode` types
- `server/db/schema.ts` column typing for status/kind fields; `server/utils/expand.ts` and `server/utils/youtube.ts` for parsed AI/cache payloads
- New runtime validation dependency (chosen in design)
- Invalid client or model payloads that previously type-checked as `T` will be rejected (typically 400/422) instead of proceeding
