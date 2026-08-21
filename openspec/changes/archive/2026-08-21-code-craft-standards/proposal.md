## Why

`_alice` is a small Nuxt app that already has strong type-safety, but structure, naming, styling reuse, lint/format strictness, and automated tests lag behind. Organic growth left multipurpose `server/utils` files, duplicated page/auth/CSS patterns, unexplained literals/regex, and CI that only runs lint + typecheck—so refactors and the upcoming Wonderland UI stack risk becoming harder to read and easier to break.

## What Changes

- Encode project craft conventions in OpenSpec + `openspec/config.yaml` context (layers, naming, readability-over-cleverness, design-token consumption, literal/regex rules)
- Restructure domain logic into Nuxt-idiomatic `server/services/` (split `expand.ts`, `youtube.ts`, rabbit-hole mappers); keep `server/utils/` for true cross-cutting helpers only
- Add auth/terms middleware (and thin composables) so pages stop copy-pasting session gates
- Extract page/graph composables; split `RabbitHoleGraph` concerns; naming pass for opaque identifiers (`data`, `busy`, `remove`, …)
- Prefer obvious multi-line control flow over dense one-liners; extract named intermediates and boolean guards
- Centralize domain regex/constants, expand knobs, and repeated error messages; use shared domain enums at call sites
- Tighten ESLint: `@nuxt/eslint` stylistic + formatters + tooling, stricter TS/Vue rules, `lint:fix` / format script, EditorConfig; freeze style (2-space, single quotes, no semicolons)
- Adopt Vitest + `@nuxt/test-utils` + Playwright: unit / integration / thin e2e; coverage gates on services/shared/lib; wire tests into CI; migrate one-off scripts into real tests; keep staging `e2e-smoke.mjs` as promote-only
- Coordinate with `ui-wonderland-theme`: craft owns consumption rules (pages use tokens/components, no raw hex/utility soup); theme owns token values and shadcn/Vue Flow

## Capabilities

### New Capabilities
- `code-craft`: Structure, naming, readability, literals/constants, lint/format, and UI consumption rules that keep the codebase easy to read, change, and extend
- `automated-testing`: Unit, integration, and e2e test harness, valuable-test standards, coverage gates, and CI/promote separation

### Modified Capabilities
- (none — product behavior for Rabbit Holes, auth, and YouTube stays as specified; this change is engineering standards and refactor-for-clarity)

## Impact

- Touches most of `app/` and `server/` via moves/renames; **no** public API route renames, **no** DB schema/migrations, **no** Expand/AI prompt quality rewrites
- New deps: ESLint stylistic/format peers as required by `@nuxt/eslint`, Vitest, `@nuxt/test-utils`, happy-dom, Playwright / playwright-core, coverage reporter
- CI gains `test` (+ coverage) alongside lint/typecheck; staging smoke remains a promote gate, not every PR
- Depends on / informs `ui-wonderland-theme` for token-backed restyles; apply craft conventions before or while restyling pages so CSS soup does not become Tailwind soup
- First stylistic autofix may be a large mechanical commit, then structural and test work on top
