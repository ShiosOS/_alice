## Context

See `proposal.md` for motivation. Current shell tokens in `app/assets/css/tailwind.css` are warm paper (`#f4f1ec`) + oxide (`#a33b2b`), close to Anthropic ivory + clay. Home (`app/pages/index.vue`) is a short lede + Sign in CTA while `app/app.vue` also shows a filled Sign in when logged out. Channel UI stays out of scope except shared token updates. Stack: Nuxt 4, Vue 3, Tailwind v4, shadcn-vue, Lucide already configured.

## Goals / Non-Goals

**Goals:**
- Encode cool-map tokens once; restyle shell + peripheral pages
- Implement signed-out home composition (hero, ambient Example, How-it-works)
- Enforce single primary Sign in hierarchy
- Add restrained hover/page/list motion with reduced-motion paths

**Non-Goals:**
- Channel layout/interaction rewrite
- New animation libraries
- Renaming server Path/seed domain terms in APIs/DB

## Decisions

### D1: Cool-map palette over warm paper + oxide
- **Choice:** Cool slate canvas (`~#f8fafc`), slate text, near-black filled CTA, blue (`~#1d4ed8`) for links/Example kickers only.
- **Why:** Escapes Anthropic clay-on-ivory; stays Are.na-adjacent; matches Refactoring UI (saturated accent on small areas).
- **Alternatives:** Ink+teal (rejected as more fintech); keep warm paper (rejected — Claude lookalike).

### D2: Hero owns the only filled Sign in
- **Choice:** Signed-out header = brand only; hero = one filled Sign in with Google.
- **Why:** Refactoring UI / Primer — one primary per view; two filled Sign ins split attention.
- **Alternatives:** Header tertiary text link (allowed later, not default); header-owned primary (rejected — weakens hero).

### D3: Ambient Example via WAAPI/CSS, not controls
- **Choice:** Client component cycles 3–4 plain everyday trails; exit left then enter right with stagger; no dots/pause/next.
- **Why:** Explains the product without jargon or interaction chrome.
- **Alternatives:** Interactive carousel (rejected); static single example (weaker teaching).

### D4: How-it-works as numbered steps, not icons
- **Choice:** Three numbered plain steps below the fold.
- **Why:** Fills page length without feature-card slop.
- **Alternatives:** Icon tiles (rejected); widen Example only with no below-fold (may still feel short).

### D5: Stay on Lucide; CSS/Vue motion only
- **Choice:** Keep `@lucide/vue`; drop unused `lucide-vue-next` if safe; no Motion/GSAP.
- **Why:** Already shadcn default; scope doesn’t need a motion framework.
- **Alternatives:** Phosphor weights / Heroicons dual set (rejected).

### D6: Channel token coherence without layout rewrite
- **Choice:** Update shared CSS variables so channel inherits cool-map; leave shaft/focus structure as-is.
- **Why:** Avoid shell/hole visual fight; defer channel craft pass.
- **Alternatives:** Dual themes (rejected complexity).

## Risks / Trade-offs

- **[Channel still “paper-shaped” in spacing/borders]** → Accept for this change; follow-up if needed
- **[Ambient animation a11y]** → Honor `prefers-reduced-motion`; pause when document hidden
- **[Public copy vs internal Path/seed terms]** → Only scrub public/home/empty/create marketing strings; keep domain code names
- **[Token swap visual regression]** → Manual visual pass on home, list, create, one hole page

## Migration Plan

1. Land token updates + shell header Sign in hierarchy
2. Ship home Example + How-it-works + plain copy
3. Apply list/create hover + copy polish
4. Rollback: revert the change branch; no DB migration

## Open Questions

- None blocking — tertiary header Sign in link deferred unless usability feedback demands it
