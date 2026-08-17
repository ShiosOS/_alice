## Purpose

Integrates YouTube as the video source and playback surface via the official API and deep links, with compliance-aware caching and clear attribution—without scraping or hosting audiovisual content.

## ADDED Requirements

### Requirement: Official API only
The system MUST obtain YouTube catalog/related/metadata through official YouTube API Services and MUST NOT scrape YouTube or Google application pages for that data.

#### Scenario: Candidate fetch
- **WHEN** Expand or bootstrap needs related or metadata candidates for a video
- **THEN** the system calls the configured YouTube API and does not scrape HTML

### Requirement: Seed URL resolution
The system SHALL resolve supported YouTube URL forms to a canonical video id and fetch display metadata needed for the seed node.

#### Scenario: Standard watch URL
- **WHEN** the user pastes a standard YouTube watch URL
- **THEN** the system resolves a video id and seed title/thumbnail suitable for the graph

### Requirement: API data cache TTL
The system MAY cache YouTube API payloads and display metadata for performance but MUST refresh or delete cached API-sourced payloads within thirty calendar days and MUST make reasonable efforts to keep displayed metadata consistent with current API data (including handling deleted or unavailable videos).

#### Scenario: Stale cache refresh
- **WHEN** cached related/metadata for a video id is older than the configured TTL (≤ 30 days)
- **THEN** the system refreshes from the API or deletes the cache entry before relying on it for new expands

#### Scenario: Unavailable video
- **WHEN** a stored node’s video is no longer available via the API
- **THEN** the system indicates unavailability on the graph and does not present it as a healthy watch target

### Requirement: No audiovisual hosting
The system MUST NOT download, cache, or store copies of YouTube audiovisual media files; it stores identifiers, allowed metadata, and product graph/Path/phrase data only.

#### Scenario: Storage contents
- **WHEN** a Rabbit Hole is persisted
- **THEN** stored artifacts exclude video/audio file binaries

### Requirement: Deep link to YouTube
The system SHALL send users to YouTube to watch using a normal YouTube URL for the video id.

#### Scenario: Watch action
- **WHEN** the user watches from a node
- **THEN** they land on YouTube for that video id

### Requirement: Attribution
Any view that displays YouTube-sourced titles, thumbnails, or related results MUST make clear that YouTube is the source of that content, following applicable YouTube branding/attribution expectations for API clients.

#### Scenario: Graph shows sourced content
- **WHEN** the graph displays video titles or thumbnails from YouTube
- **THEN** YouTube is identifiable as the source (for example via branding/attribution near the content or screen)
