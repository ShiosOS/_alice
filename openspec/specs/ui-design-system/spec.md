# ui-design-system Specification

## Purpose
Defines the shared visual language for `_alice`: theme tokens, typography, and component chrome so every surface feels like one product with a color-only Wonderland mood.

## Requirements

### Requirement: Wonderland mood via color and type only
The system SHALL express a Wonderland-adjacent mood using color, typography, and abstract atmosphere only. The UI MUST NOT use Alice in Wonderland characters, story props, or fandom illustrations as decoration. Brand typography and accent climate MUST follow the shared cool-map tokens (not a literary serif on deep ink with brass, and not warm parchment with oxide clay).

#### Scenario: No costume art on primary surfaces
- **WHEN** a user views the app shell, Rabbit Holes list, or hole channel
- **THEN** they see no Alice characters, White Rabbit imagery, teacups, roses, playing-card faces, or similar story props used as UI decoration

#### Scenario: Brand uses cool-map type and accent
- **WHEN** a user views any primary app surface
- **THEN** the `_alice` brand is visually prominent in the shared cool-map climate (cool slate canvas, near-black primary action, blue reserved for links) rather than literary serif on deep ink with brass or warm parchment with oxide clay

### Requirement: Shared design tokens
The system SHALL define shared design tokens (background, foreground, muted, accent, danger, borders/spacing) consumed by both app chrome and the hole channel so chrome and hole detail do not look like separate products.

#### Scenario: Chrome and channel share palette
- **WHEN** a user opens a Rabbit Hole channel after using list/create chrome
- **THEN** channel borders, accents, and text colors match the same token system as buttons, links, and navigation

### Requirement: Component foundation for product chrome
The system SHALL provide a reusable component foundation for common chrome (buttons, text inputs, dialogs/confirmations, navigation affordances, toasts or equivalent feedback) styled with the shared design tokens.

#### Scenario: Destructive confirm uses shared dialog
- **WHEN** a user initiates a destructive action such as account or Rabbit Hole deletion
- **THEN** confirmation uses the shared dialog/confirmation component with the danger token, not a one-off unstyled control

### Requirement: Hierarchy and restraint
The system SHALL keep visual hierarchy readable: one primary accent, muted secondary text, sparse borders, and intentional empty states. Decorative noise MUST NOT compete with Rabbit Hole content.

#### Scenario: Empty Rabbit Holes state is intentional
- **WHEN** a signed-in user has no Rabbit Holes
- **THEN** they see a clear empty state with a single primary call to start a new Rabbit Hole, without decorative clutter
