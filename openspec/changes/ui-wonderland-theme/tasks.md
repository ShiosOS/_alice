## 1. Tailwind + shadcn foundation

- [x] 1.1 Add Tailwind CSS v4 and wire global CSS into Nuxt 4 (`app/assets/css/tailwind.css`, `nuxt.config.ts`)
- [x] 1.2 Add `shadcn-nuxt` / shadcn-vue init with `app/components/ui` and required utils (`cn`, etc.)
- [x] 1.3 Add core shadcn components needed for shell: Button, Input, Dialog/AlertDialog, Dropdown or navigation primitives, Toast/Sonner (or equivalent)

## 2. Wonderland ink theme

- [x] 2.1 Define Wonderland ink CSS variables (ink bg, fg, muted, brass accent, danger, borders) and map them into the shadcn theme tokens
- [x] 2.2 Set typography: literary serif for `_alice` / titles, humanist sans for UI chrome (system or licensed webfont)
- [x] 2.3 Enforce color-only mood: remove any decorative Alice/story imagery if introduced; keep atmosphere to abstract gradients/vignettes only

## 3. Restyle existing shell

- [x] 3.1 Rebuild `app/app.vue` header/footer/nav on shadcn + tokens with prominent `_alice` brand
- [x] 3.2 Restyle `index`, `account`, and `terms-accept` pages with shared components (including destructive confirm on account delete)
- [x] 3.3 Add a clear empty-state pattern component usable later by Rabbit Holes list

## 4. Vue Flow graph canvas

- [x] 4.1 Add Vue Flow dependencies and a client-only canvas wrapper component
- [x] 4.2 Implement custom node and edge Vue components styled with Wonderland tokens (title/thumbnail hooks, edge phrases, Path vs frontier styles)
- [x] 4.3 Add client dagre (or equivalent) layout for initial layout and explicit reset-layout
- [x] 4.4 Enable pan, zoom, and free node drag; Expand-patch helper that places new nodes without moving user-dragged nodes
- [x] 4.5 Ship a fixture/demo graph page or story harness to verify interaction and theme visually

## 5. Verification

- [x] 5.1 Run lint and typecheck clean for the UI foundation changes
- [x] 5.2 Manual check: shell pages match ink/brass theme with no costume art; canvas supports pan/zoom/drag/reset
