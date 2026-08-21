## Context

See `proposal.md` for motivation. Today `[id].vue` is `fullBleed` and hosts `RabbitHoleGraph` (Vue Flow + dagre + drag/zoom + `NodeDetailPanel`). Domain data and mutations already live in `useHoleGraph` (load, expand patch merge, watch, Path, rename, delete, bootstrap retry). Topology APIs and Postgres graph tables stay. Prior UI change locked Wonderland ink + brass + Vue Flow; this change replaces that primary hole surface with an Are.na-inspired channel and warm-paper tokens.

## Goals / Non-Goals

**Goals:**
- One channel component tree for hole detail on all viewports
- Keep `useHoleGraph` as the mutation/orchestration boundary
- Retoken product chrome to warm paper / grotesque / oxide; map shadcn CSS variables accordingly
- Remove Vue Flow from the product hole path

**Non-Goals:**
- Server layout persistence; new graph query APIs
- Rebuilding list/create IA beyond token coherence
- In-app playback or Are.na social/multiplayer features

## Decisions

### D1: Channel IA over freeform canvas
- **Choice:** Focus block + fork block list + Path trail; tap fork → new focus; Expand/Watch on focus.
- **Why:** Matches locked exploration (Are.na channel); scroll/tap works on mobile; one model everywhere.
- **Alternatives:** YouTube watch+playlist (rejected); Letterboxd film page (liked less); keep Vue Flow with denser mobile defaults (failed friendliness).

### D2: Client focus state, server topology unchanged
- **Choice:** `focusedNodeId` (and derived children via edges) is client UI state; graph JSON from existing GET/expand/watch unchanged.
- **Why:** No API/schema migration; Expand patch merge already client-side.
- **Alternatives:** URL query `?node=` optional later for share-deep-link; not required for v1 of this change.

### D3: Drop fullBleed map shell for hole detail
- **Choice:** Hole page scrolls in normal shell (or constrained max-width column like Are.na); abandon zoom dock / reset layout / node drag as product UX.
- **Why:** Channel is a document, not a canvas.
- **Alternatives:** Keep fullBleed with internal scroll only — worse for header/footer coherence.

### D4: Warm paper token remap
- **Choice:** Background warm paper (`~#F4F1EC`), near-black text, oxide red (`~#A33B2B`) for text actions/links; contemporary grotesque webfont (or system grotesque stack) for UI—no literary serif as primary UI type. Encode as CSS variables / Tailwind theme tokens; pages consume tokens only.
- **Why:** Locked mockup direction; avoids ink/brass steampunk and academic serif.
- **Alternatives:** Ink night / cool stone variants deferred.

### D5: Component replacement
- **Choice:** New `RabbitHoleChannel` (name flexible) composed of FocusBlock, ForkBlockList, PathTrail, HoleHeader; `[id].vue` wires `useHoleGraph`. Delete or demote Vue Flow usage from product routes; remove `@vue-flow/core` / dagre from hole path (optional keep behind `dev/graph-demo` only if cheap—prefer delete demo with canvas).
- **Why:** Clear ownership boundary; avoids two UIs.
- **Alternatives:** Wrap Vue Flow invisibly — rejected complexity.

### D6: Phrase rendering
- **Choice:** Phrase is the primary caption on each fork row; title/thumb secondary—oblique grotesque or accent weight, not literary italic serif.
- **Why:** Spec: phrases are the direction UI.

### D7: Default focus
- **Choice:** On load, focus seed if no Path; else prefer last Path node (or seed if Path empty). After Expand, keep focus on expanded node and reveal new children.
- **Why:** Resume and Expand feedback without a map.

## Risks / Trade-offs

- **[Lost “see whole graph at once”] →** Accept; Path trail + ancestor navigation; optional overview later out of scope.
- **[Deep trees long scroll] →** Focus neighborhood (ancestors compact + focus + children) rather than dumping every node; full dump is a footgun.
- **[Token churn across list/create] →** Remap global tokens carefully; smoke list/create/account for contrast regressions.
- **[e2e/demo assume Vue Flow] →** Update tests and remove canvas demo or replace with channel fixture page.
- **[Academic feel from copy/italics] →** Grotesque only; keep phrase styling restrained.

## Migration Plan

1. Add channel components + tokens behind the hole page; feature-flag optional only if needed—prefer direct replace on a branch.
2. Swap `[id].vue` to channel; verify Expand/Watch/Path/bootstrap retry.
3. Remove Vue Flow from product dependency path; update package.json if unused.
4. Retoken shell; fix list/create contrast.
5. Rollback: revert app deploy; no DB migration.

## Open Questions

- Exact grotesque webfont license/load (pick at implement time if self-host needed).
- Whether Path trail is text breadcrumbs vs compact thumb strip (both satisfy spec; prefer text trail for Are.na fidelity unless thumbs prove clearer in implementation).
