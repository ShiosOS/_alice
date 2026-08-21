## Purpose

Provides the interactive Rabbit Hole map surface: pan, zoom, free node drag, custom video nodes and phrase edges, client-side layout, and Path versus frontier visual distinction.

## ADDED Requirements

### Requirement: Interactive map canvas
The system SHALL present a Rabbit Hole as an interactive node-edge map the user can pan and zoom (including touch pinch/zoom where the browser supports it) on desktop and mobile web.

#### Scenario: Pan and zoom the map
- **WHEN** a user opens a Rabbit Hole with a graph
- **THEN** they can pan the viewport and zoom in/out while keeping nodes and edges readable

### Requirement: Free node drag
The system SHALL allow the user to drag individual nodes to reposition them on the canvas. Dragged positions NEED NOT be persisted to the server in this change.

#### Scenario: User repositions a node
- **WHEN** a user drags a node to a new place on the canvas
- **THEN** the node stays at the new position for the rest of the session until layout is reset or the page is reloaded

### Requirement: Client-side layout for initial and reset
The system SHALL compute node positions on the client for the initial graph presentation and for an explicit reset-layout action. After Expand adds nodes, the system SHALL place new nodes without discarding positions of nodes the user already dragged, unless the user resets layout.

#### Scenario: First open lays out the graph
- **WHEN** a user opens a Rabbit Hole that has no client layout yet
- **THEN** nodes are arranged automatically into a readable tree/map without requiring manual placement

#### Scenario: Expand preserves dragged nodes
- **WHEN** a user has dragged some nodes and then expands a node
- **THEN** newly added nodes appear in readable positions and previously dragged nodes keep their positions

#### Scenario: Reset layout
- **WHEN** a user chooses reset layout
- **THEN** all nodes are recomputed into the automatic layout

### Requirement: Custom nodes and edge phrases
Graph nodes MUST support product content (at minimum title and watch affordance hooks; thumbnails when available). Fork edges MUST show short direction phrases without AI or “label” chrome.

#### Scenario: Phrase visible on fork
- **WHEN** a user views a fork edge that has a direction phrase
- **THEN** the phrase is visible on or beside the edge without AI branding

### Requirement: Path versus frontier styling
The system SHALL visually distinguish Path (visited) nodes from frontier (not yet on Path) nodes using shared theme tokens (for example brighter brass trail versus cooler muted frontier).

#### Scenario: Path nodes stand out
- **WHEN** a Rabbit Hole has some Path-marked nodes and some unmarked nodes
- **THEN** Path nodes are visually distinguishable from frontier nodes at a glance
