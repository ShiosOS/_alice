# shell-visual-system Specification

## Purpose
Defines the cool-map visual system for shell and peripheral pages so `_alice` does not read as Anthropic-style warm ivory + clay while keeping motion and icons restrained.

## Requirements

### Requirement: Cool-map token climate
Shared shell tokens MUST use a cool neutral canvas (slate-tinted greys), near-black text, a near-black or equivalent high-contrast filled primary action, and a cool blue accent reserved for links and Example emphasis. The default light theme MUST NOT use warm ivory/parchment backgrounds paired with terracotta/oxide clay as the primary accent.

#### Scenario: Accent is not clay on parchment
- **WHEN** a visitor views the signed-out home or shell chrome in the default light theme
- **THEN** the page background reads as a cool neutral rather than warm parchment
- **AND** the primary filled action is not terracotta/oxide clay on cream

### Requirement: Quiet hover and motion vocabulary
Peripheral UI hover and micro-motion MUST use short transitions (about 140–180ms) with background or color shifts and optional 2–3px nudges on arrows/chevrons. The system MUST NOT use card lift shadows, glow blooms, bounce/overshoot scales, or gradient border chase effects on shell/home/list chrome.

#### Scenario: List row hover stays quiet
- **WHEN** a signed-in user hovers a rabbit-hole list row
- **THEN** the row emphasis uses a background shift and/or a small chevron nudge
- **AND** the row does not lift with a multi-layer shadow

### Requirement: Lucide for functional chrome icons
Product chrome icons MUST come from Lucide. Icons MAY mark functional actions (external link, add, delete, loading, chevrons). The signed-out home MUST NOT use decorative icon feature tiles to explain the product.

#### Scenario: Home does not use icon feature tiles
- **WHEN** a signed-out visitor views `/`
- **THEN** product explanation does not rely on a row of icon feature cards

### Requirement: Token consumption in product SFCs
Shell and peripheral pages MUST consume shared CSS variables / design tokens (and `ink-*` component classes where applicable) for surfaces, text, accents, and danger. Product SFCs MUST NOT introduce raw hex for brand surfaces or accents when a token exists.

#### Scenario: Home and shell use tokens
- **WHEN** implementers style home or shell chrome under this change
- **THEN** colors come from shared tokens or token-backed utilities rather than new one-off brand hex in the page SFC
