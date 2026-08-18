## Purpose

Defines the signed-out home experience and signed-out header CTA hierarchy so strangers understand the product without insider jargon and without competing Sign in actions.

## ADDED Requirements

### Requirement: Plain-language public home copy
The signed-out home page MUST describe the product in everyday language. Public-facing home copy MUST NOT use the terms seed, Path, or forks as product nouns. Copy MUST state that the user starts from a YouTube video/link, sees clear next steps, and can return to videos already opened.

#### Scenario: Stranger reads the home lede
- **WHEN** a signed-out visitor opens `/`
- **THEN** the primary supporting sentence describes starting from a YouTube video, seeing next steps, and coming back later
- **AND** the visible home copy does not use seed, Path, or forks as product nouns

### Requirement: Single primary Sign in on signed-out home
While signed out, the application MUST present exactly one filled primary Sign in control on the home viewport. That control MUST live in the home hero. The site header MUST show the brand and MUST NOT show a filled Sign in button when the visitor is signed out on home.

#### Scenario: Signed-out home header has no filled Sign in
- **WHEN** a signed-out visitor views `/`
- **THEN** the header shows the `_alice` brand and does not show a filled Sign in button
- **AND** the home hero shows one filled Sign in with Google control

#### Scenario: Signed-in header unchanged in role
- **WHEN** a signed-in user views a non-bleed page
- **THEN** the header continues to provide Rabbit Holes, Account, and Sign out navigation

### Requirement: Ambient rotating Example trail
The signed-out home MUST include a non-interactive Example panel that cycles through multiple everyday sample trails. Each trail MUST use plain kickers such as Started from / Went next… / Now here and familiar topics. Transitions MUST fly lines out toward the left, then fly the next trail in from the right, with staggered line timing. The panel MUST NOT expose pause, next, or pagination controls. When `prefers-reduced-motion: reduce` is set, travel MUST be suppressed (fade-only or a static first example).

#### Scenario: Example cycles without controls
- **WHEN** a signed-out visitor views `/` with motion allowed
- **THEN** the Example panel automatically advances through multiple sample trails
- **AND** no pause, next, or dot controls are shown on the panel

#### Scenario: Reduced motion
- **WHEN** the visitor has `prefers-reduced-motion: reduce`
- **THEN** the Example panel does not use directional fly travel for cycling content

### Requirement: How-it-works band below the fold
The signed-out home MUST include a below-the-fold How it works section with three plain numbered steps covering: paste a link, pick a next step, and come back later. The section MUST NOT use icon feature cards or marketing pill eyebrows.

#### Scenario: How it works is present after the hero
- **WHEN** a signed-out visitor scrolls below the home hero
- **THEN** they see three numbered steps for paste a link, pick a next step, and come back later
- **AND** the section does not present three icon feature cards
