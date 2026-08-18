## MODIFIED Requirements

### Requirement: List Rabbit Holes
The system SHALL present an authenticated user’s Rabbit Holes, newest activity first, using the product vocabulary “Rabbit Holes”.

#### Scenario: User opens library
- **WHEN** an authenticated user opens the Rabbit Holes list
- **THEN** the system shows their Rabbit Holes ordered by most recently updated

#### Scenario: Empty state
- **WHEN** an authenticated user has no Rabbit Holes
- **THEN** the system offers a clear action to “Start a new Rabbit Hole”

#### Scenario: Single empty-state voice
- **WHEN** an authenticated user has no Rabbit Holes (including after deleting their last Rabbit Hole)
- **THEN** the list surface shows exactly one empty-library title and exactly one primary “Start a new Rabbit Hole” call to action
- **AND** the default empty-pattern fallback title MUST NOT appear alongside the Rabbit Holes empty title
