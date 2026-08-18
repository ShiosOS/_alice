## Context

See `proposal.md` for motivation. Today `app/pages/rabbit-holes/index.vue` always renders a header CTA and, when `holes` is empty, also mounts `EmptyState` with a custom title slot plus its own action CTA. `EmptyState` keeps a slot-fallback title (“Nothing here yet”). After delete-last-hole navigation, users hit this empty surface and see overlapping empty messaging.

## Goals / Non-Goals

**Goals:**
- One empty-library title and one primary start CTA on the list when there are zero holes
- A regression test that fails if fallback title and page title both appear, or if two start CTAs appear while empty

**Non-Goals:**
- Changing delete API or list fetch behavior
- Broad EmptyState redesign beyond title/description API needed for this bug
- Playwright e2e for the delete path

## Decisions

1. **EmptyState title/description via props (with defaults), keep action as a slot**
   - **Why:** Props make “provided title replaces default” unambiguous and easy to unit-test without slot-fallback edge cases. Action stays a slot so callers can pass `Button`/`NuxtLink` composition.
   - **Alternatives:** Keep named title slots only (status quo; harder to guarantee single title); remove default title entirely (callers forget titles).

2. **Hide the list header CTA when `holes.length === 0`**
   - **Why:** EmptyState already owns the empty CTA; hiding the header button removes the duplicate without restructuring the page.
   - **Alternatives:** Remove EmptyState action and keep header only (weaker empty composition); always hide header CTA (worse when the list is populated).

3. **Unit/component test with `@vue/test-utils` + happy-dom under `tests/unit/`**
   - **Why:** Repo prefers unit tests over vanity page coverage. Mount `EmptyState` and a thin list-empty harness (or the list template fragment) asserting title/CTA counts.
   - **Alternatives:** Full Nuxt page test (heavier); e2e delete flow (out of PR CI scope for this bug).

## Risks / Trade-offs

- **[Other EmptyState callers]** → Grep shows only the Rabbit Holes list today; update that call site to props. If future callers used slots, document props in the component.
- **[Header CTA hidden while loading]** → Keep header CTA tied to `!pending && !error && holes.length === 0` for empty-only hide; while pending or when holes exist, preserve current header CTA.
