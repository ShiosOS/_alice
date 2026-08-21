# code-craft Specification

## Purpose
Defines how `_alice` code is structured, named, formatted, and read so humans and agents can change the product without fighting multipurpose files, opaque literals, or clever density.

## Requirements

### Requirement: Layered module boundaries
Domain logic for Expand, YouTube, Rabbit Holes, and auth account operations MUST live under clear service-oriented modules (not a catch-all utilities folder). HTTP handlers MUST stay thin: validate input, call domain logic, map results. Cross-cutting helpers (logging, session adapters, validation, error capture) MAY remain in a small utilities area. Pure helpers with no runtime coupling MUST remain separately importable for unit testing.

#### Scenario: Expand logic is not a utilities blob
- **WHEN** a developer looks for Expand budget, AI fork selection, expand-node persistence, or bootstrap orchestration
- **THEN** each concern is in a dedicated module under the service layout rather than one multipurpose utilities file

#### Scenario: API handlers stay thin
- **WHEN** an authenticated client calls a Rabbit Hole create, expand, or watch endpoint
- **THEN** the handler validates the request and delegates business work to domain modules without embedding YouTube/AI/DB orchestration inline

### Requirement: Shared auth and terms gates
Signed-in and terms-accepted checks MUST be applied through shared middleware (or an equivalent single reusable gate), not by copying session `watchEffect` blocks into each protected page.

#### Scenario: Protected page uses shared gate
- **WHEN** a user opens Rabbit Holes list, create, detail, or account without being signed in or without accepting terms
- **THEN** they are redirected by the shared gate the same way on each of those surfaces

#### Scenario: Adding a new protected page
- **WHEN** a developer adds a new page that requires a signed-in, terms-accepted user
- **THEN** they can attach the shared gate without pasting a new session watcher into the page script

### Requirement: Readable control flow over dense expressions
Application code MUST prefer clear multi-line control flow and named intermediates when an expression would require mental unpacking (stacked nullish/or fallbacks, boolean soup, nested ternaries, or long map/filter/slice pipelines). Clever one-liners are allowed only when the idiom is locally obvious.

#### Scenario: Multi-fallback selection is expanded
- **WHEN** code selects among several fallbacks (for example seed node id, else first node, else null)
- **THEN** the selection is written as named steps or early returns rather than a single stacked `?.` / `||` chain

#### Scenario: Nested ternaries are rejected
- **WHEN** lint runs on application TypeScript or Vue scripts
- **THEN** nested ternary expressions fail the check

### Requirement: Named domain literals and regex
Domain-significant magic strings, numbers, and regular expressions (YouTube video-id shape, topic tokenization, Expand fan-out counts, title length caps, repeated HTTP error messages, design colors) MUST be named constants, shared enums/helpers, or design tokens with a one-line explanation where the meaning is not obvious from the name alone. Single-use trivial patterns (trim trailing slash, collapse whitespace) MAY stay inline.

#### Scenario: YouTube video id pattern is named
- **WHEN** code validates or extracts a YouTube video id
- **THEN** it uses a shared named pattern (not four unexplained copies of the same regex literal)

#### Scenario: Expand fan-out counts are named
- **WHEN** bootstrap or expand chooses how many forks to request
- **THEN** those counts come from named product constants, not unexplained bare `2` / `3` literals at call sites

#### Scenario: Danger color is not raw hex in pages
- **WHEN** shared design tokens exist for the app theme
- **THEN** page and component styles use those tokens (or components built on them) rather than repeating raw hex values for danger, surfaces, or accents

### Requirement: Design token and component consumption
Once a shared theme and component foundation exist, product pages MUST express brand visuals through design tokens and shared components. Pages MAY use layout utilities; they MUST NOT invent one-off button/error/prose styling or long utility chains that redefine the visual vocabulary.

#### Scenario: Destructive action uses shared danger styling
- **WHEN** a user sees a delete or other destructive control on account or Rabbit Hole surfaces
- **THEN** that control uses the shared danger token/component rather than a page-local color copy

#### Scenario: Duplicate scoped button CSS is removed
- **WHEN** the craft migration for existing shell and Rabbit Hole pages is complete
- **THEN** those pages no longer each redefine their own button and error color rules in scoped CSS

### Requirement: Strict lint and formatting gate
The project MUST enforce a single strict lint+format pipeline for application TypeScript, Vue, and configured style/docs files. Formatting MUST be part of that pipeline (not an optional local-only habit). Continuous integration MUST fail when lint or formatting rules fail. Style defaults MUST be frozen as 2-space indent, single quotes, and no semicolons unless the project explicitly revisits that decision in a later change.

#### Scenario: Formatting failure fails CI
- **WHEN** a pull request introduces code that violates the frozen stylistic rules
- **THEN** the CI check job fails before merge

#### Scenario: Autofix is available locally
- **WHEN** a developer runs the project format/lint-fix script
- **THEN** stylistic and formatter violations that ESLint can fix are corrected without a separate ad-hoc Prettier-only TS pipeline fighting ESLint

### Requirement: Intentional naming
Exported modules, page state, and user-facing action handlers MUST use names that reveal domain intent. Opaque names such as generic `data`, `busy`, or `remove` for Rabbit Hole operations MUST be replaced with domain-specific names during this change’s naming pass.

#### Scenario: Hole detail state names the graph
- **WHEN** a developer reads the Rabbit Hole detail page script after the naming pass
- **THEN** the loaded graph state and mutating flags use domain-intent names rather than opaque `data` / `busy`

### Requirement: Conventions are documented in-repo
Craft rules for layers, naming, readability, literals, lint/format, and UI consumption MUST be recorded in project OpenSpec context (and remain consistent with these requirements) so agents and humans share one source of truth.

#### Scenario: OpenSpec context describes craft rules
- **WHEN** a contributor reads the project OpenSpec configuration context after this change
- **THEN** they find the layering, readability, literal, lint, and token-consumption rules summarized there
