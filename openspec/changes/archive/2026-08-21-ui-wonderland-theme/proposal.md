## Why

`_alice` has a bare custom CSS shell and no component or graph library, while Rabbit Holes list/create and the interactive map are still unbuilt. Locking a professional UI stack and a color-only Wonderland feel now prevents shipping those surfaces twice and keeps the product curious without costume art.

## What Changes

- Adopt **shadcn-vue** + Tailwind as the app component system (buttons, dialogs, inputs, sheets, toasts, etc.)
- Adopt **Vue Flow** for the Rabbit Hole map with pan, zoom, free node drag, custom nodes/edges, and client-side layout (dagre) for initial/reset layout
- Introduce a **Wonderland ink** theme expressed only through color, type, and atmosphere (deep ink, brass accent, serif brand) — no Alice characters, props, or fandom illustrations
- Apply Refactoring UI craft: clear hierarchy, fewer borders, intentional empty states, shared tokens between chrome and graph nodes
- Restyle existing shell pages (home, account, terms) onto the new system as foundation for upcoming Rabbit Hole UI

## Capabilities

### New Capabilities
- `ui-design-system`: Shared visual tokens, typography, shadcn-vue component foundation, and Wonderland ink theme constraints for the whole app
- `graph-canvas`: Interactive Rabbit Hole map built on Vue Flow (pan/zoom/drag, custom nodes/edges, client layout, Path vs frontier styling hooks)

### Modified Capabilities
- (none under `openspec/specs/` yet — graph exploration behavior remains owned by `alice-v1-rabbit-holes`; this change adds the UI foundation those tasks will use)

## Impact

- New dependencies: Tailwind CSS, shadcn-vue / `shadcn-nuxt`, Vue Flow (`@vue-flow/core` + related packages), dagre layout helper, lucide icons as used by shadcn
- Touches `nuxt.config.ts`, global CSS/tokens, `app/app.vue`, and existing pages; new `app/components/ui/*` from shadcn
- No API or schema changes; graph positions remain client-only (not persisted)
- Coordinates with in-progress `alice-v1-rabbit-holes` tasks 6–7 (Rabbit Holes UI + graph exploration) which should consume this foundation rather than invent parallel styling
