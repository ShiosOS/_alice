## Purpose

Makes the navigable video graph the primary interface for intentional depth: bootstrap a readable first map, expand on demand with short direction phrases, and highlight the user’s Path—without auto-growing hairballs or a visible AI chat.

## ADDED Requirements

### Requirement: Graph is the primary interface
The system SHALL present a Rabbit Hole as an interactive graph of video nodes and fork relationships on both desktop and mobile web, using the same interaction model (not a separate mobile-only metaphor).

#### Scenario: Open hole shows graph
- **WHEN** the user opens a Rabbit Hole
- **THEN** they see the seed and connected forks as a graph they can focus and navigate

#### Scenario: Same model on mobile
- **WHEN** the user opens the same Rabbit Hole on a mobile browser
- **THEN** they can perform the same core actions (view graph, read phrases, Expand, open on YouTube, see Path) without switching to a list-only product mode

### Requirement: First-graph bootstrap (10 nodes)
When a Rabbit Hole is created from a seed, the system SHALL build an initial graph of approximately ten nodes: the seed, three distinct first-level forks, and two children under each of those forks (depth 2; breadth 3 then 2). Each non-seed connection MUST include a short direction phrase visible to the user without “label” chrome or AI branding.

#### Scenario: Successful bootstrap
- **WHEN** bootstrap completes for a new Rabbit Hole
- **THEN** the user sees the seed, three first-level forks with short phrases, and two children under each with short phrases

#### Scenario: Bootstrap failure
- **WHEN** bootstrap cannot complete (upstream failure or invalid AI output after retries)
- **THEN** the system surfaces a recoverable error and does not leave a silently corrupted partial graph presented as complete

### Requirement: Explicit Expand
After bootstrap, the system SHALL grow a node’s neighborhood only when the user explicitly triggers Expand on that node. The system MUST NOT auto-expand the full graph in the background.

#### Scenario: User expands a node
- **WHEN** the user activates Expand on a focused node within their daily expand budget
- **THEN** the system adds a small set of new distinct forks with short phrases and persists them on the graph

#### Scenario: Expand without AI chrome
- **WHEN** Expand runs
- **THEN** the UI presents the action as Expand (or equivalent) and does not require the user to prompt or chat with an AI

### Requirement: Distinct direction phrases
Expanded and bootstrap forks MUST present short human-readable phrases that contrast directions (for example deeper vs sideways vs broader), not mute “related” links alone.

#### Scenario: Readable contrast
- **WHEN** the user views forks from a seed such as a topical compilation video
- **THEN** at least some sibling phrases communicate different exploration directions rather than near-duplicate titles only

### Requirement: Path of progress
The system SHALL record Path membership for videos the user opens from `_alice` into YouTube (at minimum as visited) and highlight Path nodes on the graph so the user can see what they have already taken on a shaft.

#### Scenario: Open from graph updates Path
- **WHEN** the user opens a video node out to YouTube from the graph
- **THEN** that node is marked on the Path for that Rabbit Hole and remains highlighted on later opens

#### Scenario: Path visible on resume
- **WHEN** the user reopens a Rabbit Hole after visiting several nodes
- **THEN** previously Path-marked nodes are visually distinguishable from unmarked frontier nodes

### Requirement: Expand rate limiting
The system SHALL enforce per-user expand budgets (counting bootstrap expands toward the budget as configured) and MUST reject Expand when the budget is exhausted with a clear message.

#### Scenario: Budget exhausted
- **WHEN** the user has used their allowed expands for the period
- **THEN** further Expand requests are denied without calling the AI provider

### Requirement: Deep-link watch
Choosing a video to watch SHALL open YouTube (site or app) rather than playing inside `_alice` in v1.

#### Scenario: Watch leaves to YouTube
- **WHEN** the user chooses to watch a node
- **THEN** the system navigates or deep-links to that video on YouTube
