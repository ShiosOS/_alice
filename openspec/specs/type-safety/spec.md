# type-safety Specification

## Purpose
Keeps TypeScript in force at compile time and at the edges of the app, so Rabbit Hole APIs, sessions, and Expand payloads cannot silently drift from the shapes the compiler claims.

## Requirements

### Requirement: Typecheck gate
The system SHALL type-check the application under TypeScript `strict` mode with unchecked indexed access enabled. Continuous integration MUST run that type-check (and lint) on pull requests and on `main`, and MUST fail the check job when either reports an error.

#### Scenario: Clean tree passes
- **WHEN** the default CI check job runs on a tree that type-checks and lints cleanly
- **THEN** that job succeeds

#### Scenario: Type error fails CI
- **WHEN** a change introduces a TypeScript error under the pinned compiler options
- **THEN** the CI check job fails before merge

### Requirement: Validated write bodies
The system SHALL parse create and rename Rabbit Hole request bodies against a schema before mutating data. Bodies that do not match (wrong types, missing required URL on create, empty title on rename) MUST be rejected with a 4xx response and MUST NOT create or update a Rabbit Hole.

#### Scenario: Create with invalid body
- **WHEN** an authenticated client POSTs `/api/rabbit-holes` with a missing or non-string `url`
- **THEN** the system responds 4xx and does not insert a Rabbit Hole

#### Scenario: Rename with empty title
- **WHEN** an authenticated client PATCHes a Rabbit Hole with a missing, non-string, or blank `title`
- **THEN** the system responds 4xx and leaves the stored title unchanged

### Requirement: Validated Expand model output
The system SHALL parse AI Expand output as JSON matching `{ forks: { videoId, phrase }[] }` and SHALL keep only forks whose `videoId` is in the candidate set for that Expand. Output that does not parse MUST NOT persist new nodes or edges from that attempt (retry-once / fail-soft behavior already specified for Expand still applies).

#### Scenario: Unparseable model JSON
- **WHEN** Expand receives model text that is not JSON of the fork schema
- **THEN** the system does not write fork nodes or edges from that attempt

#### Scenario: Fork id not in candidates
- **WHEN** parsed forks include a `videoId` that was not a candidate
- **THEN** the system drops that fork and does not persist it

### Requirement: Validated YouTube cache payload
The system SHALL parse a YouTube related-cache blob before using it as candidates. A blob that does not match the candidate list schema MUST be treated as a cache miss (refresh or refetch) rather than as a typed candidate list.

#### Scenario: Corrupt cache row
- **WHEN** a cache row exists for a video but its payload is not a candidate list
- **THEN** the system does not return those bytes as candidates and refreshes or refetches

### Requirement: Shared Rabbit Hole contracts
Rabbit Hole list, graph, create, rename, Expand patch, and watch responses SHALL use one shared TypeScript contract for ids, titles, hole status, node/edge fields, and Path events. Client fetch calls MUST use that contract rather than a page-local duplicate that can diverge.

#### Scenario: Graph load matches the contract
- **WHEN** an authenticated client GETs a Rabbit Hole it owns
- **THEN** the JSON includes `rabbitHole`, `nodes`, `edges`, and `path` using the shared field names and types

#### Scenario: List uses the same hole summary
- **WHEN** an authenticated client GETs `/api/rabbit-holes`
- **THEN** each listed hole uses the shared summary fields (`id`, `title`, `status`, timestamps as ISO strings on the wire)

### Requirement: Closed domain statuses
The system SHALL persist Rabbit Hole `status` only as `ready` or `incomplete`, Path event `kind` only as `visited` or `watched`, and expand ledger `status` only as `success`, `failed`, or `rejected`. TypeScript MUST treat those columns as those unions, not as arbitrary `string`.

#### Scenario: Hole status is one of two values
- **WHEN** the client reads a Rabbit Hole
- **THEN** `rabbitHole.status` is `ready` or `incomplete`

### Requirement: Auth helpers stay in the type checker
Session require, set, and clear helpers MUST accept the Nitro request event type used by `defineEventHandler` without `as never` (or equivalent whole-type erasure) at each call site. A single adapter is allowed only if the auth library’s public types still mismatch, and that adapter MUST NOT be copied into handlers.

#### Scenario: Handlers type-check against the event
- **WHEN** `nuxt typecheck` runs
- **THEN** it succeeds with no `as never` on `requireUserSession`, `setUserSession`, `clearUserSession`, or `sendRedirect` in API handlers, middleware, or auth routes
