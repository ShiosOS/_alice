# GitHub public hardening

Maintainer checklist for a public `_alice` plus protected `main` / `production`.

## Applied (2026-08-18)

| Item | Status |
| --- | --- |
| Visibility | **Public** (`https://github.com/ShiosOS/_alice`) |
| Private vulnerability reporting | **Enabled** |
| Dependabot alerts + automated security fixes | **Enabled** (API) |
| Branch protection `main` | **On** — see below |
| Branch protection `production` | **On** — see below |

### `main` (trunk → staging)

- Require a pull request before merging
- Required approving reviews: **0** (solo-maintainer friendly; still forces PRs)
- Dismiss stale reviews: yes
- Require Code Owner reviews: **no** (CODEOWNERS still routes review requests)
- Require status checks: **`check`** (CI job), branches must be up to date
- Enforce for admins: **yes**
- Allow force pushes / deletions: **no**
- Require conversation resolution: **yes**

### `production` (live pointer)

Promotion remains `git push origin origin/main:production` (no PR required).

- Require status checks: **`check`** (same SHA already green on `main`)
- Enforce for admins: **yes**
- Allow force pushes / deletions: **no**
- No required pull-request reviews (so FF promote still works)

## Re-apply via API

```bash
# Visibility
gh repo edit ShiosOS/_alice --visibility public --accept-visibility-change-consequences

# Private vulnerability reporting
gh api -X PUT repos/ShiosOS/_alice/private-vulnerability-reporting

# main
gh api -X PUT repos/ShiosOS/_alice/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'EOF'
{
  "required_status_checks": { "strict": true, "contexts": ["check"] },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF

# production (FF promote allowed; no PR reviews)
gh api -X PUT repos/ShiosOS/_alice/branches/production/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'EOF'
{
  "required_status_checks": { "strict": true, "contexts": ["check"] },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": false
}
EOF
```

## Community files (this PR)

| File | Purpose |
| --- | --- |
| `LICENSE` | MIT |
| `SECURITY.md` | Private advisory reporting |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1 |
| `CONTRIBUTING.md` | Dev setup + PR norms |
| `SUPPORT.md` | Help routing |
| `.github/ISSUE_TEMPLATE/*` | Bug / feature forms |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR checklist |
| `.github/CODEOWNERS` | `@ShiosOS` |
| `.github/dependabot.yml` | Weekly npm + Actions updates |

## Secrets hygiene before going public

- `.env` is gitignored; tip scan should show only `.env.example` placeholders and ephemeral CI DB URLs.
- If a real secret ever landed in history, rotate it and scrub before relying on public visibility.
