## 1. Conventions and strict lint/format

- [x] 1.1 Fill `openspec/config.yaml` `context` with craft rules (layers, naming, readability-over-cleverness, literals/regex, token consumption, lint style freeze: 2-space / single quotes / no semis)
- [x] 1.2 Enable `@nuxt/eslint` stylistic, tooling, and formatters; add `eslint-plugin-format` (and any required peers); wire options in `nuxt.config` / generated eslint path as documented
- [x] 1.3 Add stricter app rules: `no-nested-ternary`, moderate `complexity` / `max-depth`, keep existing type-safety and `as never` bans; tune after first run if expand orchestration needs extracted helpers first
- [x] 1.4 Add `.editorconfig` and npm scripts `lint:fix` (and/or `format`); document in README
- [x] 1.5 Run autofix once as a dedicated mechanical commit; ensure `npm run lint` and `npm run typecheck` pass

## 2. Server service splits and literals

- [x] 2.1 Create `server/services/` layout for expand, youtube, rabbit-holes, auth; keep only log/validate/session/sentry in `server/utils/`
- [x] 2.2 Split `server/utils/expand.ts` into budget, fork-selector (AI), expand-node, bootstrap modules; update API imports
- [x] 2.3 Split `server/utils/youtube.ts` into video-id (pure), api/cache, related-candidates; keep/move pure topic helpers under `server/lib` as appropriate
- [x] 2.4 Move rabbit-hole mappers / `loadHoleGraph` and auth user helpers into services; thin handlers remain validators + delegates
- [x] 2.5 Name domain regex/constants (YouTube id pattern, expand fan-out counts, title/prompt caps where shared); add shared error message helpers; use domain enums/helpers at call sites instead of bare status/kind strings where practical
- [x] 2.6 Readability pass on server hotspots (config resolution helpers, cache bypass boolean guards, conflict `toNode` fetch, AI candidate line building)

## 3. App middleware, composables, graph, naming

- [x] 3.1 Add `auth` and `terms` (or one clear combined) route middleware; switch protected pages to `definePageMeta`; remove copied session `watchEffect` gates
- [x] 3.2 Extract composables for hole list/detail API orchestration (`useHoleGraph` / list helpers); thin page scripts
- [x] 3.3 Split `RabbitHoleGraph.vue`: layout/pan logic vs canvas view vs detail panel; extract `mergeExpandPatch` (or equivalent) helper
- [x] 3.4 Naming pass: replace opaque `data` / `busy` / `remove` (and similar) with domain-intent names on hole pages and related composables
- [x] 3.5 App readability pass: expand stacked fallbacks and dense client merges into obvious multi-line steps

## 4. Design token consumption

- [x] 4.1 Ensure danger/surface/accent CSS variables exist (minimal tokens here if `ui-wonderland-theme` not merged yet, or consume theme tokens when available)
- [x] 4.2 Remove duplicated scoped button/error/prose CSS from pages in favor of shared classes/components/tokens; ban raw hex for those roles in migrated surfaces
- [x] 4.3 Note in `ui-wonderland-theme` apply notes (or a short comment in that change’s tasks/design if editing is appropriate) that page restyles must follow craft consumption rules

## 5. Test harness and unit tests

- [x] 5.1 Add Vitest, `@nuxt/test-utils`, happy-dom, coverage reporter; configure multi-project layout (unit / nuxt-as-needed / e2e)
- [x] 5.2 Add `test` / `test:coverage` scripts; document how to run locally
- [x] 5.3 Unit tests: YouTube video-id parsing (hosts/paths/invalid); migrate `check-topic-query.mjs` behaviors into Vitest and remove or wrap the one-off script
- [x] 5.4 Unit tests: rabbit-hole mappers, expand budget/disabled policy, expand-patch merge helper, shared literal/error helpers as extracted
- [x] 5.5 Confirm unit suite is deterministic and mocks no live YouTube/AI

## 6. Integration, e2e, coverage, CI

- [x] 6.1 Integration test setup with Postgres (CI service or documented test DB URL) and YouTube/AI stubs
- [x] 6.2 Integration tests: unauthenticated protected API → auth error; terms gate on create/expand; create/expand/watch with fixtures assert contracts + persistence
- [x] 6.3 Thin Playwright (or `@nuxt/test-utils` e2e) suite: public privacy/terms/health; minimal signed-in critical path without live YT/AI spend in PR CI
- [x] 6.4 Keep `scripts/e2e-smoke.mjs` as staging promote-only smoke; document PR CI vs promote gate in `docs/smoke.md`
- [x] 6.5 Enforce coverage thresholds on `server/services/**`, `shared/**`, `server/lib/**` (high bar) plus overall floor; wire `lint`, `typecheck`, and tests into `.github/workflows/ci.yml`
- [x] 6.6 Final verification: lint, typecheck, unit, integration, e2e all green on a clean tree

## 7. Close-out

- [x] 7.1 Update README with craft/test scripts and pointers to OpenSpec capabilities `code-craft` + `automated-testing`
- [x] 7.2 Run `openspec validate --change code-craft-standards` (and strict if used) and fix any artifact issues before apply/archive
