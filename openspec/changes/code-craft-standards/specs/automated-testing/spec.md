## Purpose

Defines automated unit, integration, and end-to-end testing standards so regressions in Rabbit Hole, auth, and YouTube-adjacent logic are caught with valuable, readable tests—not coverage theater.

## ADDED Requirements

### Requirement: Automated test harness in CI
The system MUST provide an automated test harness that runs on pull requests and on `main` (and `production` pushes if CI already runs there). The harness MUST include unit tests, integration tests, and a thin end-to-end suite. Continuous integration MUST fail when any of those suites fail.

#### Scenario: Clean tree passes checks
- **WHEN** the default CI check job runs on a tree whose lint, typecheck, and automated tests all pass
- **THEN** that job succeeds

#### Scenario: Failing unit test fails CI
- **WHEN** a change breaks a unit test for domain logic such as YouTube id parsing
- **THEN** the CI check job fails before merge

### Requirement: Valuable unit tests for pure domain logic
Pure domain logic (YouTube id/URL parsing, topic query helpers, graph/path mappers, expand budget policy, expand-patch merge helpers, shared error/literal helpers) MUST have unit tests that assert behavior with deterministic fixtures. Unit tests MUST NOT call live YouTube or AI providers.

#### Scenario: YouTube id parsing cases
- **WHEN** unit tests run for YouTube video id parsing
- **THEN** they cover bare ids and common URL hosts/paths (watch, youtu.be, shorts, embed) and reject invalid input

#### Scenario: Topic helper script is replaced
- **WHEN** the automated unit suite is in place for topic query helpers
- **THEN** those behaviors are covered by the suite rather than only by an ad-hoc one-off script outside the test runner

### Requirement: Integration tests for API behavior with isolated externals
Integration tests MUST exercise Rabbit Hole create/expand/watch and auth/terms gates against the application server and database while mocking or stubbing YouTube and AI provider calls. They MUST assert status codes and response contracts that clients rely on.

#### Scenario: Unauthenticated API is rejected
- **WHEN** an integration test calls a protected Rabbit Hole API without a session
- **THEN** the response is an authentication error and no Rabbit Hole is created

#### Scenario: Expand with mocked providers
- **WHEN** an integration test expands a node with YouTube and AI stubbed to return fixtures
- **THEN** the response includes new nodes/edges per the Expand contract and persistence matches that patch

### Requirement: Thin end-to-end coverage of critical flows
The project MUST maintain a small end-to-end suite that covers the critical signed-in Rabbit Hole path (list/create/graph interaction as applicable in the test environment) and public policy/health surfaces. End-to-end tests used in PR CI MUST NOT depend on live YouTube or AI spend. Staging promote smoke that hits real providers MAY remain a separate operator gate.

#### Scenario: Public surfaces in e2e
- **WHEN** the PR end-to-end suite runs
- **THEN** it verifies public policy pages and health respond successfully without requiring Google sign-in

#### Scenario: Promote smoke stays separate
- **WHEN** operators prepare to promote staging to production
- **THEN** they can still run the staging API smoke against real providers as a promote gate distinct from PR CI

### Requirement: Coverage gates on domain modules
CI MUST enforce coverage thresholds on domain modules (services, shared contracts/helpers, and pure lib helpers) at a high bar, and MAY use a lower overall floor. Page SFCs MUST NOT be forced to a vanity line-coverage target; critical page behavior is covered via integration or e2e instead.

#### Scenario: Service coverage below threshold fails CI
- **WHEN** domain service module coverage falls below the configured high threshold
- **THEN** the CI check job fails

#### Scenario: Tests remain behavior-focused
- **WHEN** a reviewer reads a new test added under this capability
- **THEN** the test name and structure describe an observable behavior with a single clear reason to fail, not an implementation detail assertion that only exists to raise coverage percentage

### Requirement: Readable tests
Automated tests MUST follow the same readability standard as application code: arrange/act/assert, obvious multi-line setup where needed, and names that read like specifications. Tests MUST be deterministic (fixed fixtures, no reliance on wall-clock flukes or live third-party APIs in PR CI).

#### Scenario: Flaky live API not in PR unit tests
- **WHEN** unit or PR integration tests run in CI
- **THEN** they do not perform live calls to YouTube Data API or the configured AI provider
