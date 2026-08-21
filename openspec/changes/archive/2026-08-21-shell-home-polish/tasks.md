## 1. Cool-map tokens + shell chrome

- [x] 1.1 Update `:root` / theme tokens in `app/assets/css/tailwind.css` to cool-map (cool canvas, slate neutrals, near-black CTA, blue accent; remove warm parchment + oxide as defaults)
- [x] 1.2 Adjust `ink-*` shell component classes for the new climate (header/footer/nav hover) without long arbitrary utilities in pages
- [x] 1.3 In `app/app.vue`, when signed out show brand-only header (no filled Sign in); keep signed-in nav (Rabbit Holes / Account / Sign out)

## 2. Signed-out home

- [x] 2.1 Rewrite `app/pages/index.vue` hero with plain-language lede and a single filled Sign in with Google primary
- [x] 2.2 Add ambient Example trail component (client) with 3–4 everyday samples, fly-out left / fly-in right stagger, no controls, pause when document hidden, reduced-motion path
- [x] 2.3 Add below-the-fold How it works band with three numbered plain steps (no icon feature cards)
- [x] 2.4 Add quiet independent/YouTube disclaimer line near footer content if not already clear on home

## 3. Peripheral pages + motion

- [x] 3.1 Update list / create / empty-state public copy to avoid seed/Path/forks product nouns where user-facing
- [x] 3.2 Apply quiet list/nav/button hover vocabulary (bg shift, optional chevron nudge; no lift/glow)
- [x] 3.3 Add light page-enter transition for non-bleed routes if low-risk with NuxtPage
- [x] 3.4 Spot-check one rabbit-hole channel page for token coherence; fix only token/class breakage (no layout rewrite)

## 4. Icons housekeeping + verify

- [x] 4.1 Standardize on `@lucide/vue` for chrome icons; remove deprecated `lucide-vue-next` if unused
- [x] 4.2 Run lint + typecheck; fix issues from this change
- [x] 4.3 Manual visual pass: signed-out home (hero CTA only, Example motion, How it works), signed-in list hover, reduced-motion Example behavior
