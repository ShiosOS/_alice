# Security Policy

## Supported versions

| Version / branch | Supported |
| --- | --- |
| `main` (staging) | Yes |
| `production` (live) | Yes |
| Other branches / forks | Best effort |

Report issues against the latest `main` tip unless the bug is only reproducible on production.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Use GitHub’s private vulnerability reporting:

1. Open [Security → Advisories → Report a vulnerability](https://github.com/ShiosOS/_alice/security/advisories/new)
2. Include: impact, reproduction steps, affected URLs/endpoints, and any proof-of-concept (non-destructive preferred)
3. Allow a reasonable time for triage before any public disclosure

We aim to acknowledge reports within **7 days** and to share an initial assessment or mitigation plan within **14 days**. Timelines may vary with severity and complexity.

## What to report

In scope examples:

- Authentication / session bypass or fixation
- Unauthorized access to holes, watch state, or user data
- Injection (SQL, XSS, SSRF) in app or API routes
- Secrets exposure (keys, tokens, session material) in the repo or deployed config
- Privilege escalation between anonymous and signed-in users

Out of scope (unless you can show practical impact):

- Denial of service via expensive Expand / YouTube / AI quota burn (prefer reporting abuse patterns privately)
- Issues that require already-compromised admin or Railway credentials
- Findings that only apply to misconfigured local `.env` copies

## Secrets and credentials

Never commit real secrets. Use `.env.example` as the template; `.env` is gitignored.

If you believe a secret has been committed or leaked:

1. Report it via the private advisory form above
2. Do **not** paste live production credentials into issues, PRs, or chat
3. Maintainers will rotate keys and scrub history if needed

## Safe harbor

We will not pursue legal action against researchers who:

- Make a good-faith effort to avoid privacy violations, data destruction, and service disruption
- Report findings privately and give us time to remediate before disclosure
- Do not exploit the vulnerability beyond what is needed to demonstrate it
