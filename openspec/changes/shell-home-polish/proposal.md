## Why

Peripheral surfaces (home, list, create, shell chrome) still read as unfinished next to the channel UI: warm paper + oxide tokens mimic Anthropic/Claude, public copy uses insider jargon (seed/Path/forks), the signed-out home shows two competing Sign in actions, and motion/hover craft is thin. Lock a cool-map shell and a clearer home before more product surface piles onto the wrong visual language.

## What Changes

- Retheme shared shell tokens from warm ivory + oxide clay to **cool-map** (cool slate neutrals, near-black primary CTA, blue used sparingly for links/example accents)
- Rebuild the signed-out **home**: plain-language lede, ambient rotating Example trail (fly-out left / fly-in right, non-interactive), optional How-it-works band below the fold
- **Sign-in hierarchy**: one filled primary in the hero; signed-out header is brand-only (no second Sign in)
- Polish signed-in list/create/empty copy and quiet hover/motion (Lucide chrome icons only; CSS/Vue transitions; `prefers-reduced-motion`)
- Align channel chrome with the new tokens enough that shell ↔ hole don’t clash (no channel layout rewrite)

**Non-goals:** Redesigning Expand/Watch/Path behavior; renaming domain APIs or DB fields; motion libraries (GSAP/Motion One); feature-card marketing; costume Alice art; changing Google OAuth flow itself.

## Capabilities

### New Capabilities
- `shell-home-ui`: Signed-out home composition, Example carousel motion, How-it-works band, public copy rules, and signed-out header CTA hierarchy
- `shell-visual-system`: Cool-map tokens, shell chrome hover/motion vocabulary, Lucide usage constraints for peripheral UI

### Modified Capabilities
- (none under `openspec/specs/` — rabbit-hole/channel behavior unchanged; this change owns shell/home presentation)

## Impact

- Touches `app/assets/css/tailwind.css` tokens and `ink-*` components, `app/app.vue`, `app/pages/index.vue`, list/create/empty/account chrome as needed for token + copy coherence
- May add a small home Example component + composable for rotation (client-only animation)
- Dependencies: keep `@lucide/vue` / Lucide; prefer dropping deprecated `lucide-vue-next` if unused
- No API/schema changes; no channel interaction model changes beyond shared color tokens
