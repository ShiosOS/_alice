## Purpose

Provides lightweight public legal and trust pages so `_alice` can be production-like for early users: privacy practices, terms of use, and clear non-affiliation with YouTube/Google.

## ADDED Requirements

### Requirement: Privacy Policy page
The system SHALL publish a Privacy Policy page describing what personal and product data is collected, why it is used, which categories of processors are involved (hosting, database, auth, YouTube API, AI for fork phrases), retention sketch, and how users delete data.

#### Scenario: User opens Privacy Policy
- **WHEN** a visitor opens the Privacy Policy link
- **THEN** they can read the policy without signing in

### Requirement: Terms of Use page
The system SHALL publish a Terms of Use page covering acceptable use (including abuse of expand/API budgets), that `_alice` is independent and not affiliated with YouTube or Google, that playback occurs on YouTube, and that the service is provided without warranty appropriate to an early product.

#### Scenario: User opens Terms
- **WHEN** a visitor opens the Terms of Use link
- **THEN** they can read the terms without signing in

### Requirement: Non-affiliation disclosure
The system SHALL disclose that `_alice` is not affiliated with, endorsed by, or sponsored by YouTube or Google on the policy pages and in an About or equivalent surface linked from the app.

#### Scenario: Disclosure visible
- **WHEN** a user views About (or equivalent) or the policy pages
- **THEN** a clear non-affiliation statement is present

### Requirement: Footer or shell links
The authenticated and unauthenticated app shells SHALL link to Privacy Policy and Terms of Use.

#### Scenario: Footer links present
- **WHEN** the user views the main app shell
- **THEN** Privacy and Terms links are available

### Requirement: Agreement at sign-up
When creating an account via the identity provider flow, the system SHALL require acknowledgment of the Terms of Use before or as part of completing first-time access.

#### Scenario: First-time access
- **WHEN** a new user completes sign-in for the first time
- **THEN** they must accept the Terms before using Rabbit Holes
