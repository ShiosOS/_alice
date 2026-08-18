# Maintainer checklist: public repo + branch protection
#
# Cloud agents cannot always mutate repo visibility / protection via the
# restricted GitHub token. After merging community docs, a maintainer with
# admin rights should confirm the following in the GitHub UI (or API).

## 1. Make the repository public

Settings → General → Danger Zone → Change visibility → Public

Or:

```bash
gh repo edit ShiosOS/_alice --visibility public --accept-visibility-change-consequences
```

Before flipping visibility, confirm no live secrets are in git history
(`.env` is gitignored; tip scan should be clean).

## 2. Enable private vulnerability reporting

Settings → Code security → Private vulnerability reporting → Enable

Or:

```bash
gh api -X PUT repos/ShiosOS/_alice/private-vulnerability-reporting
```

## 3. Protect `main` (required for free accounts once public)

Settings → Branches → Add classic branch protection rule → Branch name: `main`

Recommended:

- Require a pull request before merging
- Require approvals: **1**
- Dismiss stale pull request approvals when new commits are pushed
- Require review from Code Owners (`CODEOWNERS`)
- Require status checks to pass: **CI / check** (job name from `.github/workflows/ci.yml`)
- Require branches to be up to date before merging
- Do not allow bypassing the above settings (optional but preferred)
- Restrict who can push / force-push (admins only; no force push)
- Do not allow deletions

API sketch (after public):

```bash
gh api -X PUT repos/ShiosOS/_alice/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["check"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false
}
EOF
```

## 4. Protect `production`

Same as `main`, plus:

- Treat as release pointer only (fast-forward from `main` after smoke)
- Prefer restricting pushes to maintainers / admins only
- Never force-push

## 5. Community health

Confirm GitHub Community Profile shows LICENSE, CODE_OF_CONDUCT, CONTRIBUTING,
SECURITY, issue/PR templates, and README.
