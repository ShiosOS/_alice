## Context

See proposal.md for why. Nuxt 4 already generates referenced tsconfigs (`strict` on by default); root `tsconfig.json` only lists those references. CI already runs `npm run lint` and `npm run typecheck`. Auth session shape is augmented in `shared/types/auth.d.ts`. Product behavior stays as specified in `alice-v1-rabbit-holes`.

Constraints: do not enable `exactOptionalPropertyTypes` (fights Vue optional props). Do not annotate locals the compiler already infers. Keep the existing CI jobs; do not add a second type-check during `nuxt build`.

## Goals / Non-Goals

**Goals:**
- Make the compiler, ESLint, and runtime parsers agree on the same contracts (see `specs/type-safety/spec.md`)
- Localize any remaining auth-library type mismatch to one adapter
- Fix call sites that `noUncheckedIndexedAccess` will flag (graph layout is the likely hotspot)

**Non-Goals:**
- Postgres `ENUM` types or a data migration of existing rows
- Enabling `typescript.typeCheck` inside `nuxt build` / `nuxt dev`
- Runtime validation of every GET or of YouTube Data API HTTP envelopes beyond what Expand/cache already needs
- Changing Expand take counts, auth product rules, or graph UX

## Decisions

### D1: Pin compiler options through Nuxt, not a handwritten tsconfig
- **Choice:** Set `typescript.strict: true` and `typescript.tsConfig.compilerOptions.noUncheckedIndexedAccess: true` in `nuxt.config.ts`. Leave the root `tsconfig.json` as Nuxt’s project-references stub.
- **Why:** Nuxt overwrites generated configs on `nuxt prepare`; extra flags belong in the Nuxt option so they survive regenerate.
- **Alternatives:** A sibling tsconfig that extends `.nuxt/tsconfig.json` (Nuxt 4 references make that the wrong layer); `exactOptionalPropertyTypes` (rejected: Vue `busy?: boolean` props become painful for little gain).

### D2: Shared wire types in `shared/types/`, not Nitro inference as the source of truth
- **Choice:** Add modules under `shared/types/` (alongside `auth.d.ts`) for hole status unions, list/graph payloads, write bodies, Expand patch, and watch response. Handlers return those types; Vue `$fetch` uses them. Map Drizzle `Date` columns to ISO strings on the wire so the client type is `string`, matching JSON.
- **Why:** Pages already duplicate `Hole` / `HolePayload` / `GNode`. Nitro can still infer from handler returns, but a named shared module is readable in Vue and does not depend on generated `.nuxt` types being present in the editor.
- **Alternatives:** Rely only on Nitro `$fetch` inference (less duplication, worse when a handler returns a raw Drizzle row with `Date`); generate types from OpenAPI (too much machinery for this app).

### D3: Zod at the untrusted edges, using h3’s validated body reader
- **Choice:** Add `zod`. Parse create/rename bodies with `readValidatedBody` (or equivalent) and the shared schemas. Parse AI chat JSON and YouTube cache blobs with the same schemas (`safeParse`); cache parse failure is a miss, AI parse failure follows existing retry-once then 502.
- **Why:** Assertions (`readBody<T>`, `JSON.parse as T`) are how invalid data currently type-checks. Zod is server-only here, so bundle size is not a client concern. h3 already has a validated-body helper.
- **Alternatives:** Valibot (lighter, less common in Nuxt examples); TypeBox; parse by hand. Zod wins on familiarity for this stack.

### D4: Drizzle column enums in TypeScript, keep Postgres `text`
- **Choice:** Type `rabbit_holes.status`, `path_events.kind`, and `expand_ledger.status` with Drizzle’s text enum / `$type<'ready' | 'incomplete'>` (same unions as `shared/types`). No Postgres `CREATE TYPE` migration.
- **Why:** Spec needs a closed set in TypeScript and in writes. Existing rows already use those strings. A PG enum is a migration and a rollback nuisance for no query benefit at this size.
- **Alternatives:** Postgres enums (stricter in the database, heavier to change); leave `text()` and only union in app types (schema insert would still accept any string).

### D5: Try uncast auth first; one adapter if `nuxt-auth-utils` still mismatches
- **Choice:** Call `requireUserSession` / `setUserSession` / `clearUserSession` / `sendRedirect` with the Nitro event. If typecheck still fails on the library’s `H3Event` parameter, add a single `server/utils/session.ts` adapter. Ban `as never` at call sites (ESLint). `sendRedirect` should use the same event type as the handler; do not cast it to `never`.
- **Why:** Fourteen `as never` casts are the largest hole in the type checker. A wrapper is allowed by the spec only as a last resort and must not be copy-pasted.
- **Alternatives:** Keep `as never` (fails the spec); patch `nuxt-auth-utils` types in `node_modules` (fragile); switch auth libraries (out of scope).

### D6: Type-aware ESLint on top of `@nuxt/eslint`
- **Choice:** Keep `withNuxt()`, enable typed typescript-eslint rules that error on `any`, unsafe assignment/member access, and unnecessary assertions. Do not require explicit return types on every function.
- **Why:** Compiler flags do not fail CI on `as never` if someone reintroduces it. Lint is the regression net.
- **Alternatives:** Default Nuxt ESLint only (status quo); `typescript.typeCheck: true` in the Nuxt build (duplicates `nuxt typecheck` and slows dev).

### D7: Infer internals; type module boundaries
- **Choice:** Do not add redundant annotations on `ref(false)`, inferred handlers, or locals. Type exported functions, shared payloads, Zod schemas (`z.infer`), and Drizzle row types (`InferSelectModel` where it matches the wire type after mapping).
- **Why:** Over-annotation drifts and fights inference; the spec is about contracts, not ceremony.

## Risks / Trade-offs

- **[`noUncheckedIndexedAccess` noise in the graph layout] →** Fix `RabbitHoleGraph.vue` indexed access and `shift()` with real guards; that is intended work, not a flag to turn back off.
- **[Zod + Drizzle types drift] →** Infer write-body types from Zod; infer DB row types from Drizzle; map to shared wire types in one place (`loadHoleGraph` and list/create returns).
- **[Auth adapter hides a real version skew] →** Prefer uncast; if the adapter is required, comment the library issue and re-check on `nuxt-auth-utils` upgrades.
- **[Stricter 4xx on bad bodies] →** Only malformed clients change; the Vue forms already send strings. No product flow change if the UI is unchanged.
- **[Type-aware ESLint slower] →** Acceptable on this tree size; if CI time jumps, keep the unsafe-* rules and drop slower ones, do not drop `no-explicit-any`.

## Migration Plan

- Land as an ordinary PR: no DB migration, no env changes, no deploy order beyond existing `lint` + `typecheck`.
- Rollback: revert the PR. Invalid bodies would be asserted again; stored data is unchanged.
- If a cache row fails the new payload schema, the next Expand treats it as a miss and rewrites the row (same as TTL expiry).
