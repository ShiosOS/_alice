## Why

The Rabbit Hole detail surface is a Vue Flow freeform canvas (pan/zoom/drag, floating detail panel). That model fails on mobile and forces a separate mental model from scroll/tap products users already know. We need one scroll-first channel layout on all viewports, with a calmer Are.na-inspired visual system (warm paper, grotesque type, oxide accent)—not a second mobile metaphor and not another invented “Wonderland skin.”

## What Changes

- Replace the hole detail primary UI: Vue Flow graph canvas → Are.na-style **channel** surface (focus block → Watch/Expand → phrase-captioned child blocks → Path trail)
- Same layout/experience on desktop and mobile (wider composition only; no list-only mobile mode)
- Shift product chrome tokens off deep ink + aged brass toward **warm paper + near-black grotesque + oxide red links**
- Drop canvas-only controls from the hole page (zoom dock, reset layout, free node drag as core UX)
- Keep Expand, Watch, Path, phrases, bootstrap/incomplete recovery, and APIs/topology unchanged

**Non-goals:** YouTube-clone chrome; in-app player; social/public channels; persisting x/y layout; rewriting Expand/YouTube services; full site rebrand of list/create beyond shared tokens needed for coherence.

## Capabilities

### New Capabilities

- `hole-channel-surface`: Scroll-first Rabbit Hole channel UI (focus block, phrase-captioned forks, Path trail) on all viewports, including warm-paper / grotesque / oxide visual system for that surface (and shared tokens needed for shell coherence)

### Modified Capabilities

- `graph-exploration`: Primary interface is no longer a freeform interactive node-edge map; requirements update to channel/focus+forks while preserving Expand, phrases, Path, and same-model-on-mobile

## Impact

- **UI:** `app/pages/rabbit-holes/[id].vue`, `RabbitHoleGraph.vue`, `VideoNode`/`PhraseEdge`/`NodeDetailPanel`, `graph-layout.ts`, `dev/graph-demo`, shell tokens in `app/assets/css/tailwind.css`, possibly list/create pages for token coherence
- **Logic kept:** `useHoleGraph`, merge-expand-patch, APIs, DB graph topology
- **Deps:** Likely remove or demote `@vue-flow/core` / dagre from the product hole path (dev harness optional)
- **Specs:** `graph-exploration` main spec; new `hole-channel-surface`; UI token deltas
- **Tests:** Update/replace graph-canvas e2e assumptions with channel interaction checks; unit tests for layout helpers if introduced
