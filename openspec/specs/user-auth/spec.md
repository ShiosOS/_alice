# User Auth Specification

## Purpose
Lets people sign in with a single identity provider so personal Rabbit Holes stay private and sync across devices, and so they can delete their account and associated data.

## Requirements

### Requirement: Single-provider sign-in
The system SHALL authenticate users with exactly one configured identity provider (OAuth or magic link) and establish a server-side session for subsequent requests.

#### Scenario: Successful sign-in
- **WHEN** an unauthenticated user completes the configured identity-provider flow
- **THEN** the system creates or reuses their user record and returns them to the app in an authenticated session

#### Scenario: Unauthenticated access to personal data
- **WHEN** an unauthenticated client requests Rabbit Holes or Expand APIs
- **THEN** the system denies the request

### Requirement: Session across devices
The system SHALL allow the same user identity to access their Rabbit Holes from multiple browsers or devices after signing in on each.

#### Scenario: Second device
- **WHEN** the user signs in on a phone with the same identity used on desktop
- **THEN** their existing Rabbit Holes are available on that device

### Requirement: Account deletion
The system SHALL provide a way for the user to delete their account and MUST delete stored personal product data associated with that account (Rabbit Holes, graph, Path, expand ledger rows for that user) as soon as possible and within seven calendar days.

#### Scenario: User deletes account
- **WHEN** the authenticated user confirms account deletion
- **THEN** the system removes or schedules removal of their account and associated personal product data and ends their session
