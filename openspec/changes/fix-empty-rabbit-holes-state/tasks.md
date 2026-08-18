## 1. EmptyState API

- [ ] 1.1 Change `EmptyState` to take `title` and `description` props (defaults: title `Nothing here yet`, description empty) and keep `action` as a slot
- [ ] 1.2 Update `app/pages/rabbit-holes/index.vue` to pass those props instead of `#title` / `#description` slots

## 2. Single empty CTA on the list

- [ ] 2.1 Hide the Rabbit Holes list header “Start a new Rabbit Hole” button when the library is empty (after load, no error), so only EmptyState owns that CTA

## 3. Regression test

- [ ] 3.1 Add a unit/component test that mounts EmptyState with a custom title and asserts the fallback title does not appear
- [ ] 3.2 Add a unit/component test (thin list-empty harness or equivalent) that when there are zero holes, exactly one empty-library title and exactly one “Start a new Rabbit Hole” CTA are present

## 4. Verify

- [ ] 4.1 Run the new unit tests and confirm they pass
