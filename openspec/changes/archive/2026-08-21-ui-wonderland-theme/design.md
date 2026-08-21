## Context

Nuxt 4 + Vue app with a hand-rolled dark CSS shell and no component or graph library. Product graph behavior is specified under `alice-v1-rabbit-holes` (`graph-exploration`); this change supplies the UI foundation those tasks should consume. See `proposal.md` for motivation. Locked mockup direction: deep ink + brass + serif `_alice`, mood from color/type only (no Alice art).

## Goals / Non-Goals

**Goals:**
- Install and theme shadcn-vue for chrome
- Install Vue Flow + client dagre layout for the map canvas
- Encode Wonderland ink tokens once; reuse on shell and custom graph nodes
- Restyle existing shell pages onto the new system
- Ship a minimal graph canvas demo/harness that proves pan/zoom/drag/layout (full Rabbit Hole data wiring stays with `alice-v1-rabbit-holes`)

**Non-Goals:**
- Completing Rabbit Holes list/create/Expand API wiring (owned by `alice-v1-rabbit-holes`)
- Persisting node x/y to Postgres
- Light/paper theme variant
- Costume Wonderland illustration packs

## Decisions

### D1: shadcn-vue + Tailwind v4 over Nuxt UI / PrimeVue
- **Choice:** shadcn-vue (`shadcn-nuxt`) with Tailwind CSS v4.
- **Why:** Own the components; map CSS variables to Wonderland ink without fighting a preset product look.
- **Alternatives:** Nuxt UI (faster, easier to look generic); PrimeVue (heavy enterprise chrome).

### D2: Vue Flow for the interactive map
- **Choice:** `@vue-flow/core` with custom Vue node/edge components; `@dagrejs/dagre` (or equivalent) for initial/reset layout.
- **Why:** Vue-native pan/zoom/drag; custom nodes as SFCs sharing shadcn tokens; avoids raw D3 ownership.
- **Alternatives:** Cytoscape (more imperative); vis-network (physics fights calm map); Sigma (overkill scale).

### D3: Wonderland ink tokens (color-only mood)
- **Choice:** Deep ink background, warm off-white foreground, cool muted slate, aged brass accent, restrained danger red; literary serif for brand/titles; humanist sans for UI chrome.
- **Why:** User-approved mockup direction; mood without Alice characters/props.
- **Rule:** No story illustrations as decoration.
- **Craft follow-up:** Page and graph SFCs MUST consume shared CSS variables / Tailwind token classes (`bg-surface-panel`, `text-title`, `text-destructive`, etc.) — do not reintroduce raw hex for surfaces, titles, or danger. See `code-craft-standards` / `code-craft` spec (token consumption).

### D4: Interaction model
- **Choice:** Pan, zoom, free node drag; client-only positions; Expand places new nodes without moving user-dragged nodes; explicit reset layout recomputes all.
- **Why:** Agency without layout thrash; matches design D8 (client-computed layout) from `alice-v1-rabbit-holes`.

### D5: Scope split with `alice-v1-rabbit-holes`
- **Choice:** This change owns foundation + canvas primitives; v1 change owns domain APIs and full hole flows using those primitives.
- **Why:** Avoid blocking Expand/API work on theme, and avoid theming twice.

### D6: Refactoring UI craft constraints
- **Choice:** One accent; de-emphasize frontier; sparse borders; empty states as product; labels last on forks (phrases are the labels).
- **Why:** User request; keeps Wonderland professional rather than costume.

## Risks / Trade-offs

- **[Nuxt 4 + shadcn CLI path quirks] →** Follow current shadcn-vue Nuxt install docs; pin `componentDir` under `app/components/ui`; fix alias/`tsconfig` if CLI complains.
- **[Vue Flow SSR] →** Client-only graph component (`ClientOnly` / `.client.vue`) to avoid window/DOM issues.
- **[Theme drift between shadcn and Vue Flow] →** Custom nodes use the same CSS variables as shadcn theme; no hard-coded hex in node SFCs.
- **[Drag vs auto-layout conflict] →** Document Expand patch rules in canvas helpers; offer reset layout control.
- **[Parallel change collision] →** Land foundation before or carefully rebase with Rabbit Holes UI tasks 6–7.

## Migration Plan

1. Add Tailwind + shadcn-vue; define Wonderland ink CSS variables; migrate `app.vue` shell and existing pages.
2. Add Vue Flow + layout helper; ship canvas primitive + fixture graph for visual QA.
3. Subsequent `alice-v1-rabbit-holes` UI tasks import canvas + components instead of new CSS.
4. Rollback: revert the UI change branch; no DB migration.

## Open Questions

- Exact serif/sans font pair (system stack vs webfont) — pick at implement time if license/load is fine.
- Whether reset-layout control lives on-canvas or in hole header — decide when hole header exists.
