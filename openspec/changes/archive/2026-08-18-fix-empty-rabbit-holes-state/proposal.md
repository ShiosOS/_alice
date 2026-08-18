## Why

After deleting the last Rabbit Hole, the list page shows overlapping empty messaging: the shared `EmptyState` fallback title (“Nothing here yet”) can sit alongside the page’s “No Rabbit Holes yet”, and the header still offers a second “Start a new Rabbit Hole” CTA. One empty library should speak with one voice.

## What Changes

- Make the Rabbit Holes list empty state show a **single** empty title and a **single** primary CTA (no fallback title leaking next to the page copy; no duplicate header CTA while empty).
- Harden `EmptyState` so a provided title replaces the default rather than stacking with it (prefer props for title/description).
- Add a focused unit/component test that locks “exactly one empty title / exactly one start CTA” when the library is empty.
- **Non-goals:** redesigning the list layout, changing delete API behavior, e2e browser coverage, or restyling unrelated empty surfaces.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `rabbit-holes`: Empty library MUST present a single empty-state title and a single “Start a new Rabbit Hole” call to action (including after deleting the last hole).

## Impact

- `app/components/EmptyState.vue` — title/description API
- `app/pages/rabbit-holes/index.vue` — empty vs non-empty chrome (header CTA visibility)
- New Vitest unit/component test under `tests/unit/` (or Nuxt component project if required for SFC mount)
- No API, schema, or auth changes
