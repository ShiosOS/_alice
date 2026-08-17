# Rabbit Holes Specification

## Purpose
Provides durable, named topic explorations (“Rabbit Holes”) started from a YouTube seed URL so users can keep separate evolving maps for different curiosities.

## Requirements

### Requirement: List Rabbit Holes
The system SHALL present an authenticated user’s Rabbit Holes, newest activity first, using the product vocabulary “Rabbit Holes”.

#### Scenario: User opens library
- **WHEN** an authenticated user opens the Rabbit Holes list
- **THEN** the system shows their Rabbit Holes ordered by most recently updated

#### Scenario: Empty state
- **WHEN** an authenticated user has no Rabbit Holes
- **THEN** the system offers a clear action to “Start a new Rabbit Hole”

### Requirement: Start a new Rabbit Hole from URL
The system SHALL create a Rabbit Hole from a user-supplied YouTube video URL (seed), resolve the seed video, and associate the hole with the authenticated user.

#### Scenario: Valid YouTube URL
- **WHEN** the user submits a valid YouTube video URL via “Start a new Rabbit Hole”
- **THEN** the system creates a Rabbit Hole owned by that user with that video as the seed and initiates first-graph bootstrap

#### Scenario: Invalid URL
- **WHEN** the user submits a non-YouTube or unresolvable URL
- **THEN** the system rejects creation with a clear error and does not create a Rabbit Hole

### Requirement: Open and resume a Rabbit Hole
The system SHALL let the user open an existing Rabbit Hole and see its persisted graph and Path.

#### Scenario: Reopen hole
- **WHEN** the user selects an existing Rabbit Hole from the list
- **THEN** the system loads that hole’s graph and Path as last persisted

### Requirement: Rename Rabbit Hole
The system SHALL allow the owner to set or update a human-readable title for a Rabbit Hole.

#### Scenario: Update title
- **WHEN** the owner saves a new title for a Rabbit Hole
- **THEN** the list and hole header reflect the new title

### Requirement: Delete Rabbit Hole
The system SHALL allow the owner to delete a Rabbit Hole and MUST remove its graph, Path, and related expand records for that hole.

#### Scenario: Delete confirmation
- **WHEN** the owner confirms deletion of a Rabbit Hole
- **THEN** the hole no longer appears in their list and its stored graph/Path data is removed

### Requirement: Ownership isolation
The system MUST enforce that users can only read or modify Rabbit Holes they own.

#### Scenario: Cross-user access denied
- **WHEN** a user requests a Rabbit Hole ID owned by someone else
- **THEN** the system denies access without leaking whether the ID exists for another user beyond a generic not-found or forbidden response
