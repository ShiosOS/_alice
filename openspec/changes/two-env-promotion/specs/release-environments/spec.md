## Purpose

Defines how `_alice` is hosted as two isolated environments and how a commit becomes production, so live users only get software that already ran on staging.

## ADDED Requirements

### Requirement: Two isolated hosted environments
The system SHALL run exactly two persistent hosted environments: staging at `https://alice-staging.shiosos.dev` and production at `https://alice.shiosos.dev`. Each environment MUST have its own application instance, database, session secret, and public origin. The system MUST NOT keep a third persistent hosted environment (including the former `feature` sandbox).

#### Scenario: Distinct origins
- **WHEN** an operator or user opens the staging origin and the production origin
- **THEN** they are separate deployments with separate data stores and session cookies

#### Scenario: Feature sandbox retired
- **WHEN** someone requests the former feature hostname `https://alice-feature.shiosos.dev`
- **THEN** it is not a supported `_alice` environment (DNS and OAuth redirects for that host are removed)

### Requirement: Production only runs a promoted commit
The system MUST NOT deploy a commit to production solely because it landed on the default git branch. Production MUST only receive a commit that was previously deployed to staging. The default branch SHALL deploy to staging after checks pass.

#### Scenario: Merge to default branch
- **WHEN** a change is merged to the default branch and CI checks on that commit succeed
- **THEN** staging deploys that commit and production continues serving its previously promoted commit

#### Scenario: Promote after staging verification
- **WHEN** an operator promotes the commit currently on staging (fast-forward of the production pointer)
- **THEN** production deploys that same commit

#### Scenario: Failed checks
- **WHEN** CI checks fail on a commit on the default branch
- **THEN** that commit is not deployed to staging or production

### Requirement: Staging exercises the full product path
Staging SHALL support the same authenticated product flows as production, including sign-in, starting a Rabbit Hole, bootstrap, Expand, and Watch, so promotion is not limited to unauthenticated page loads. Staging MUST use non-production secrets and spend keys (or equivalently tight quotas). An emergency Expand-disable flag MAY exist but MUST NOT be the default for staging.

#### Scenario: Staging Expand
- **WHEN** an authenticated user on staging starts a Rabbit Hole from a valid YouTube URL and later Expands a node, and Expand is not emergency-disabled
- **THEN** bootstrap and Expand complete using staging credentials, without writing to the production database

### Requirement: Deploy readiness
Each hosted web deployment SHALL expose a readiness endpoint that returns success only when the process is ready to serve, including that it can reach the environment’s database. The platform health check MUST use that endpoint rather than an unauthenticated marketing or home page.

#### Scenario: Ready instance
- **WHEN** the application has started and can query the environment database
- **THEN** the readiness endpoint returns HTTP 200

#### Scenario: Database unreachable
- **WHEN** the application cannot reach its database
- **THEN** the readiness endpoint does not return HTTP 200

### Requirement: Staging is the default verification target
Automated smoke against a live host SHALL default to the staging origin, not production. Operator runbooks SHALL describe smoke on staging before promote.

#### Scenario: Default smoke host
- **WHEN** an operator runs the API smoke script without overriding the base URL
- **THEN** requests go to `https://alice-staging.shiosos.dev`
