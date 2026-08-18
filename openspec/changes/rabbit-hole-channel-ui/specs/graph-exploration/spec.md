## MODIFIED Requirements

### Requirement: Graph is the primary interface
The system SHALL present a Rabbit Hole as a navigable structure of video nodes and fork relationships on both desktop and mobile web, using one shared interaction model: a scroll-first channel with focus, phrase-captioned forks, and Path (not a separate mobile-only metaphor, and not a freeform pan/zoom node canvas as the primary surface).

#### Scenario: Open hole shows graph
- **WHEN** the user opens a Rabbit Hole
- **THEN** they see the seed and connected forks in the channel surface where they can focus nodes and navigate relationships

#### Scenario: Same model on mobile
- **WHEN** the user opens the same Rabbit Hole on a mobile browser
- **THEN** they can perform the same core actions (view structure, read phrases, Expand, open on YouTube, see Path) without switching to a list-only product mode and without requiring canvas pan/zoom as the primary navigation

### Requirement: Path of progress
The system SHALL record Path membership for videos the user opens from `_alice` into YouTube (at minimum as visited) and highlight Path nodes on the channel surface so the user can see what they have already taken on a shaft.

#### Scenario: Open from graph updates Path
- **WHEN** the user opens a video node out to YouTube from the channel
- **THEN** that node is marked on the Path for that Rabbit Hole and remains highlighted on later opens

#### Scenario: Path visible on resume
- **WHEN** the user reopens a Rabbit Hole after visiting several nodes
- **THEN** previously Path-marked nodes are visually distinguishable from unmarked frontier nodes on the channel
