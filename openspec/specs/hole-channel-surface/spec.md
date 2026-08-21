# hole-channel-surface Specification

## Purpose
Presents a Rabbit Hole as a scroll-first Are.na-style channel: one focus block with Watch and Expand, child forks as phrase-captioned blocks, and a Path trail—same model on every viewport.

## Requirements

### Requirement: Channel is the hole detail surface
The system SHALL present an opened Rabbit Hole as a scrollable channel surface (not a freeform pan/zoom node canvas). The surface MUST use the same structural model on desktop and mobile web (wider layout allowed; no separate mobile-only product mode).

#### Scenario: Open hole shows channel
- **WHEN** the user opens a Rabbit Hole with a persisted graph
- **THEN** they see a channel with a focused video block, available fork blocks with direction phrases, and Path context they can navigate without pinch-zoom or free node drag

#### Scenario: Same channel model on mobile
- **WHEN** the user opens the same Rabbit Hole on a mobile browser
- **THEN** they can focus nodes, read phrases, Expand, Watch on YouTube, and see Path using the same channel structure as desktop

### Requirement: Focus block owns Watch and Expand
The channel MUST show Watch and Expand on the focused video block (or equivalently adjacent primary actions). Choosing a child block SHALL make that node the focus. Expand MUST target the focused node.

#### Scenario: Watch from focus
- **WHEN** the user activates Watch on the focused block
- **THEN** the system deep-links that video to YouTube and records Path membership per graph-exploration rules

#### Scenario: Expand from focus
- **WHEN** the user activates Expand on the focused block within budget
- **THEN** new child forks appear as phrase-captioned blocks in the channel without requiring a floating detail panel or canvas layout reset

#### Scenario: Select a fork block
- **WHEN** the user activates a child fork block
- **THEN** that video becomes the focused block and its outbound forks (if any) become the channel’s fork list

### Requirement: Phrases caption fork blocks
Each non-seed fork relationship shown in the channel MUST expose its short direction phrase as the primary caption for that block (not AI or “label” chrome).

#### Scenario: Phrase readable on fork row
- **WHEN** the user views child forks of the focused node
- **THEN** each fork shows its direction phrase with the child video identity (title and thumbnail when available)

### Requirement: Path trail on the channel
The channel SHALL present Path membership as a trail or equivalent channel affordance so visited nodes are distinguishable from frontier forks and the user can return to a Path node as focus.

#### Scenario: Path after watch
- **WHEN** the user has Watched one or more nodes from the channel
- **THEN** those nodes appear as Path-marked in the trail (or equivalent) on later views of that hole

#### Scenario: Resume via Path
- **WHEN** the user reopens a Rabbit Hole with Path entries
- **THEN** they can identify Path nodes and set focus to a Path node without using a freeform graph map

### Requirement: Channel visuals follow shared cool-map tokens
The channel surface and shared product chrome MUST use the cool-map climate: cool slate canvas, near-black text and primary action, and blue reserved for links. Typography MUST be a contemporary grotesque / humanist sans (no literary serif as the primary UI type). The system MUST NOT rely on freeform canvas chrome (zoom dock, reset layout) as part of the hole detail experience, MUST NOT use warm parchment + oxide clay as the primary climate, and MUST NOT present a dark ink + brass freeform map canvas as the primary hole surface.

#### Scenario: Channel reads as cool-map product
- **WHEN** the user opens a Rabbit Hole detail page
- **THEN** the channel uses cool-map tokens consistent with shell chrome rather than warm paper/oxide or a dark brass freeform map canvas as the primary surface

### Requirement: Incomplete bootstrap on channel
When hole status is incomplete, the channel MUST surface a recoverable bootstrap error or retry affordance and MUST NOT present a partial graph as a complete channel.

#### Scenario: Retry from channel
- **WHEN** the user opens an incomplete Rabbit Hole
- **THEN** they see a clear recovery action (retry bootstrap) on the channel page
