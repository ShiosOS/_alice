## 1. Tokens and type

- [x] 1.1 Remap CSS / Tailwind theme tokens to warm paper background, near-black foreground, oxide-red accent; retire ink/brass as primary hole chrome
- [x] 1.2 Add contemporary grotesque type for UI (webfont or approved stack); remove literary serif as primary UI type on hole/channel surfaces
- [x] 1.3 Smoke list, create, account, and shell pages for contrast/token regressions after remap

## 2. Channel domain helpers

- [x] 2.1 Add pure helpers to derive focus defaults (seed vs last Path), child forks for a node, and Path-ordered trail from `RabbitHoleGraph`
- [x] 2.2 Unit-test those helpers (no Vue Flow / no live providers)

## 3. Channel UI components

- [x] 3.1 Build FocusBlock (thumb, title, channel, Watch, Expand, unavailable state)
- [x] 3.2 Build ForkBlockList (phrase caption + child identity; activate → focus)
- [x] 3.3 Build PathTrail (text trail; activate → focus) and HoleHeader (title rename/delete/status/retry)
- [x] 3.4 Compose `RabbitHoleChannel` (or equivalent) wiring focus state to the blocks above

## 4. Hole page swap

- [x] 4.1 Replace `RabbitHoleGraph` on `rabbit-holes/[id].vue` with the channel; drop `fullBleed` map shell if it fights scroll
- [x] 4.2 Wire existing `useHoleGraph` Watch/Expand/bootstrap retry/error/pending into the channel
- [x] 4.3 After Expand, keep focus on the expanded node and show new fork blocks

## 5. Remove canvas from product path

- [x] 5.1 Remove Vue Flow / dagre usage from product hole routes and unused graph node/edge/panel components
- [x] 5.2 Delete or replace `dev/graph-demo` so it does not require the canvas stack
- [x] 5.3 Drop unused `@vue-flow/*` / dagre dependencies if nothing else imports them

## 6. Verification

- [x] 6.1 Update or add thin tests/fixtures for channel focus / fork / Path helpers and any broken canvas assumptions
- [x] 6.2 Manually verify mobile and desktop: open hole, focus fork, Expand, Watch→Path, incomplete retry
- [x] 6.3 Run lint, typecheck, and unit/nuxt test suites relevant to the change
