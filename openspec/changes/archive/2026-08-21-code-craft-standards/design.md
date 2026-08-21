## Context

Nuxt 4 + Vue + Nitro app with solid `type-safety` (strict TS, Zod at edges, shared contracts) but weak craft: multipurpose `server/utils/{expand,youtube}.ts`, duplicated auth gates and scoped CSS, no Prettier/stylistic gate, no Vitest suite (only staging `e2e-smoke.mjs` and `check-topic-query.mjs`). Parallel change `ui-wonderland-theme` will introduce Tailwind/shadcn/Vue Flow and Wonderland tokens—craft must define consumption rules so that restyle does not create utility soup. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- One in-repo craft doctrine + enforceable lint/format
- Service-oriented server layout and thin handlers
- Shared auth/terms gates; thinner pages/composables; clearer graph split
- Readability and named literals/regex as first-class standards
- Full test pyramid with CI gates and promote-smoke separation
- Safe coordination with `ui-wonderland-theme` (tokens/components owned there; consumption rules here)

**Non-Goals:**
- Public API path renames; DB schema/migrations; Expand/AI prompt “quality” rewrites
- Hexagonal/clean-architecture ceremony beyond Nuxt-idiomatic services
- Biome or a second TS formatter fighting ESLint
- Live YouTube/AI on every PR; visual/screenshot regression in this change
- Completing Wonderland visual design (owned by `ui-wonderland-theme`)

## Decisions

### D1: Single change includes craft + testing (option A)
- **Choice:** One OpenSpec change `code-craft-standards` covering structure, lint, and automated testing.
- **Why:** Repo is ~3k LOC; splits unlock unit tests—ordering inside one task list avoids two PRs rewriting the same files.
- **Alternatives:** Sibling `test-standards` change (clearer review, slower feedback). Rejected per product owner preference for A.

### D2: Nuxt-idiomatic `server/services/` (not deep hexagonal folders)
- **Choice:**
  ```
  server/services/expand/{budget,fork-selector,expand-node,bootstrap}.ts
  server/services/youtube/{video-id,api,related}.ts
  server/services/rabbit-holes/{mappers,load-graph}.ts
  server/services/auth/users.ts
  server/utils/{log,validate,session,sentry}.ts   # cross-cutting only
  server/lib/*                                      # pure, no Nuxt runtime
  ```
- **Why:** Matches Nitro auto-import mental model while ending the utils junk drawer; keeps pure `lib` testable without Nuxt.
- **Alternatives:** Keep flat `utils/` with stricter names only (insufficient); full ports/adapters tree (overkill).

### D3: Auth via Nuxt route middleware
- **Choice:** `app/middleware/auth.ts` + `app/middleware/terms.ts` (or one combined middleware with clear steps); pages use `definePageMeta({ middleware: [...] })`. Optional thin `useRequireAuth` only if it clarifies.
- **Why:** Idiomatic Nuxt; deletes four copied `watchEffect` gates.
- **Alternatives:** Composable-only (easy to forget on new pages).

### D4: ESLint-as-formatter via `@nuxt/eslint`
- **Choice:** Enable `eslint.config` features: `stylistic: true`, `tooling: true`, `formatters: true` (add `eslint-plugin-format`); freeze **2-space, single quotes, no semicolons**; add `lint:fix` script; `.editorconfig`; keep one `eslint .` CI gate. Add `no-nested-ternary`, moderate `complexity` / `max-depth`, and retain existing type-safety rules + `as never` ban.
- **Why:** Already on `@nuxt/eslint`; avoids Prettier-vs-ESLint dual pipeline for TS/Vue.
- **Alternatives:** Standalone Prettier for TS (conflict risk); Biome (ecosystem split).

### D5: Design tokens consumption vs theme ownership
- **Choice:** `ui-wonderland-theme` defines token **values** and shadcn/Vue Flow. This change requires pages/components to **consume** tokens/components (no raw hex once tokens exist; no duplicate button/error CSS). If theme has not landed yet, introduce `--danger` (etc.) in craft migration or wait on theme’s token task—prefer landing minimal CSS variables early so the no-hex rule is enforceable.
- **Why:** Prevents Tailwind soup during restyle.
- **Alternatives:** Defer all styling rules to theme change (risk: restyle without rules).

### D6: Test stack
- **Choice:** Vitest + `@nuxt/test-utils` + happy-dom; Playwright for thin browser e2e; multi-project Vitest (`unit` node, `nuxt` where needed, `e2e` node). Coverage: high thresholds on `server/services/**`, `shared/**`, `server/lib/**` (≥90/95%); overall floor ~70–80%; no vanity gate on `app/pages/**`. PR CI mocks YouTube/AI; keep `scripts/e2e-smoke.mjs` as staging promote smoke.
- **Why:** Matches Nuxt 4 docs; separates spend/flaky live APIs from PR signal.
- **Alternatives:** Only promote smoke (too weak); real YT/AI in PR (flaky/costly).

### D7: Readability as review doctrine + light lint
- **Choice:** Document “more obvious lines > clever density”; apply a readability pass on known hotspots (focus fallback chains, expand patch merge helper, boolean soup on cache bypass, graph layout extraction). Lint enforces nested-ternary ban and moderate complexity—not a crusade against all chaining.
- **Why:** Spec+review catch what lint cannot without false positives.

### D8: Task ordering
- **Choice:** (1) encode conventions + lint/format mechanical commit → (2) service splits + literals → (3) middleware/composables/graph/naming/readability → (4) test harness + unit on new modules → (5) integration + thin e2e + CI/coverage → (6) align pages with token consumption (coordinate theme).
- **Why:** Tests lock the new shape; format-first avoids churn mid-refactor.

## Risks / Trade-offs

- **[Large mechanical lint diff] →** Single dedicated commit/PR step for `lint:fix` before structural edits.
- **[Nitro auto-import path moves] →** Update imports carefully; prefer explicit imports in services during move; run typecheck after each split.
- **[Theme/craft collision on pages] →** Token consumption tasks reference `ui-wonderland-theme`; if theme lags, add minimal CSS variables here.
- **[Integration tests need DB] →** Use disposable Postgres (CI service or existing local/Railway test URL); document required env in README/docs; skip or fail clearly if missing rather than false green.
- **[Coverage chasing] →** Spec forbids tests that exist only to raise %; thresholds apply to domain dirs, not pages.
- **[Moderate complexity lint noise] →** Tune thresholds after first run; allowlisted expand orchestration if needed with extracted helpers preferred.

## Migration Plan

1. Land conventions in `openspec/config.yaml` + this change’s specs; enable ESLint stylistic/formatters/tooling; autofix; EditorConfig.
2. Move/split server domain modules; update handlers; name literals/regex/errors.
3. Add middleware; refactor pages/composables; split graph; naming + readability pass.
4. Install test harness; write unit tests for pure modules; add integration with mocks; thin e2e; coverage in CI.
5. Apply token consumption on migrated pages (with or immediately after theme tokens).
6. Rollback: revert the change branch; no DB migration. Staging smoke script remains usable independently.

## Open Questions

- Exact CI Postgres strategy (GitHub Actions service container vs external secret URL) — pick at implement time without changing specs.
- Whether auth+terms are one middleware or two files — pick whichever reads clearer during implement; behavior is the same.
