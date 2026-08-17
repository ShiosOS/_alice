#!/usr/bin/env bash
# Bootstrap Railway project `_alice` with production, staging, and feature environments.
#
# Requires: Railway CLI + account-scoped token
#   export RAILWAY_API_TOKEN=...   # https://railway.com/account/tokens
# Do not set RAILWAY_TOKEN at the same time (it takes precedence and cannot create envs).
#
# Optional:
#   RAILWAY_WORKSPACE   workspace id or name
#   ALICE_GITHUB_REPO   default ShiosOS/_alice
#   ALICE_DEPLOY_BRANCH default main
#   SKIP_DEPLOY=1       create infra only (no railway up)
#
set -euo pipefail

PROJECT_NAME="${RAILWAY_PROJECT_NAME:-_alice}"
WEB_SERVICE="${RAILWAY_WEB_SERVICE:-web}"
GITHUB_REPO="${ALICE_GITHUB_REPO:-ShiosOS/_alice}"
DEPLOY_BRANCH="${ALICE_DEPLOY_BRANCH:-main}"
ENVS=(production staging feature)

need_token() {
  if [[ -z "${RAILWAY_API_TOKEN:-}" ]]; then
    echo "Set RAILWAY_API_TOKEN (account token from https://railway.com/account/tokens)." >&2
    echo "Unset RAILWAY_TOKEN if it is set." >&2
    exit 1
  fi
  if [[ -n "${RAILWAY_TOKEN:-}" ]]; then
    echo "RAILWAY_TOKEN is set; unset it so RAILWAY_API_TOKEN can create environments." >&2
    exit 1
  fi
}

app_url_for() {
  case "$1" in
    production) echo "https://alice.shiosos.dev" ;;
    staging) echo "https://staging.alice.shiosos.dev" ;;
    feature) echo "https://feature.alice.shiosos.dev" ;;
    *) echo "https://${1}.alice.shiosos.dev" ;;
  esac
}

custom_domain_for() {
  case "$1" in
    production) echo "alice.shiosos.dev" ;;
    staging) echo "staging.alice.shiosos.dev" ;;
    feature) echo "feature.alice.shiosos.dev" ;;
    *) echo "" ;;
  esac
}

expand_disabled_for() {
  case "$1" in
    production) echo "false" ;;
    *) echo "true" ;;
  esac
}

need_token

echo "==> Auth check"
railway whoami

if [[ ! -f .railway/config.json ]] && [[ ! -d .railway ]]; then
  echo "==> Creating project ${PROJECT_NAME}"
  if [[ -n "${RAILWAY_WORKSPACE:-}" ]]; then
    railway init --name "${PROJECT_NAME}" --workspace "${RAILWAY_WORKSPACE}" --json
  else
    railway init --name "${PROJECT_NAME}" --json
  fi
else
  echo "==> Already linked; skipping init"
  railway status --json || railway status
fi

# Ensure we are on production before adding shared services
if railway environment list --json 2>/dev/null | grep -q '"name"[[:space:]]*:[[:space:]]*"production"'; then
  railway environment production
elif railway environment list 2>/dev/null | grep -qi '^production$'; then
  railway environment production
fi

echo "==> Ensure Postgres on current environment"
if railway status --json 2>/dev/null | grep -qi postgres; then
  echo "Postgres already present (status mentions postgres)"
else
  railway add --database postgres --json || railway add --database postgres
fi

echo "==> Ensure web service (${WEB_SERVICE}) from GitHub ${GITHUB_REPO}@${DEPLOY_BRANCH}"
if railway status --json 2>/dev/null | grep -q "\"${WEB_SERVICE}\""; then
  echo "Service ${WEB_SERVICE} already present"
else
  railway add \
    --repo "${GITHUB_REPO}" \
    --branch "${DEPLOY_BRANCH}" \
    --service "${WEB_SERVICE}" \
    --json || railway add --repo "${GITHUB_REPO}" --branch "${DEPLOY_BRANCH}" --service "${WEB_SERVICE}"
fi

create_env_if_missing() {
  local name="$1"
  if railway environment list --json 2>/dev/null | grep -q "\"name\"[[:space:]]*:[[:space:]]*\"${name}\""; then
    echo "Environment ${name} already exists"
    return 0
  fi
  if railway environment list 2>/dev/null | grep -qx "${name}"; then
    echo "Environment ${name} already exists"
    return 0
  fi
  if [[ "${name}" == "production" ]]; then
    echo "Default environment should already be production; skipping create"
    return 0
  fi
  echo "==> Creating environment ${name} (duplicate production)"
  railway environment new "${name}" --duplicate production --json \
    || railway environment new "${name}" --copy production
}

for env in staging feature; do
  create_env_if_missing "${env}"
done

set_env_vars() {
  local env="$1"
  local app_url session_pw
  app_url="$(app_url_for "${env}")"
  session_pw="$(openssl rand -base64 32)"

  echo "==> Variables for ${env} (${WEB_SERVICE})"
  railway environment "${env}"

  # Public URL + session (new random session per env unless already set)
  railway variable set \
    --service "${WEB_SERVICE}" \
    --environment "${env}" \
    --skip-deploys \
    "NUXT_PUBLIC_APP_URL=${app_url}" \
    "NUXT_EXPAND_DISABLED=$(expand_disabled_for "${env}")" \
    "NUXT_EXPAND_DAILY_BUDGET=5" \
    "NUXT_AI_BASE_URL=https://api.openai.com/v1" \
    "NUXT_AI_MODEL=gpt-4o-mini"

  # Only set session password if missing (avoid rotating live cookies unintentionally)
  if ! railway variable list --service "${WEB_SERVICE}" --environment "${env}" --json 2>/dev/null \
    | grep -q 'NUXT_SESSION_PASSWORD'; then
    railway variable set \
      --service "${WEB_SERVICE}" \
      --environment "${env}" \
      --skip-deploys \
      "NUXT_SESSION_PASSWORD=${session_pw}"
  fi

  # Wire DATABASE_URL from Postgres when Railway provides the reference variable.
  # Prefer linking NUXT_DATABASE_URL to the same value operators set for DATABASE_URL.
  if railway variable list --service "${WEB_SERVICE}" --environment "${env}" --json 2>/dev/null \
    | grep -q '"DATABASE_URL"'; then
    echo "DATABASE_URL present for ${env}"
  else
    echo "NOTE: Set DATABASE_URL / NUXT_DATABASE_URL on ${WEB_SERVICE} in ${env} from the Postgres service (Railway variable reference)."
  fi

  # Propagate secrets from this shell if the operator exported them
  for key in \
    NUXT_OAUTH_GOOGLE_CLIENT_ID \
    NUXT_OAUTH_GOOGLE_CLIENT_SECRET \
    NUXT_YOUTUBE_API_KEY \
    NUXT_AI_API_KEY \
    NUXT_SENTRY_DSN
  do
    if [[ -n "${!key:-}" ]]; then
      railway variable set \
        --service "${WEB_SERVICE}" \
        --environment "${env}" \
        --skip-deploys \
        "${key}=${!key}"
    fi
  done
}

for env in "${ENVS[@]}"; do
  set_env_vars "${env}"
done

echo "==> Domains (custom hostnames; Cloudflare CNAME still required)"
for env in "${ENVS[@]}"; do
  domain="$(custom_domain_for "${env}")"
  [[ -z "${domain}" ]] && continue
  railway environment "${env}"
  echo "--- ${env}: ensuring Railway domain + custom ${domain}"
  railway domain --service "${WEB_SERVICE}" --environment "${env}" --json \
    || railway domain --service "${WEB_SERVICE}" --environment "${env}" || true
  railway domain "${domain}" --service "${WEB_SERVICE}" --environment "${env}" --json \
    || railway domain "${domain}" --service "${WEB_SERVICE}" --environment "${env}" || true
  railway domain status "${domain}" --service "${WEB_SERVICE}" --environment "${env}" --json \
    || railway domain status "${domain}" --service "${WEB_SERVICE}" --environment "${env}" || true
done

if [[ "${SKIP_DEPLOY:-0}" != "1" ]]; then
  echo "==> Deploy each environment"
  for env in "${ENVS[@]}"; do
    echo "--- up ${env}"
    railway up --service "${WEB_SERVICE}" --environment "${env}" --detach --ci \
      || railway up --service "${WEB_SERVICE}" --environment "${env}" -d
  done
else
  echo "==> SKIP_DEPLOY=1; not running railway up"
fi

echo
echo "Done. Next manual steps:"
echo "  1. Cloudflare DNS for shiosos.dev:"
echo "       alice            → Railway CNAME for production"
echo "       staging.alice    → Railway CNAME for staging"
echo "       feature.alice    → Railway CNAME for feature"
echo "     (use DNS-only until TLS issues)"
echo "  2. Google OAuth redirects:"
echo "       https://alice.shiosos.dev/auth/google"
echo "       https://staging.alice.shiosos.dev/auth/google"
echo "       https://feature.alice.shiosos.dev/auth/google"
echo "  3. Enable Postgres backups on production (and ideally staging)."
echo "  4. Run migrations per env: railway run -e <env> -s ${WEB_SERVICE} -- npm run db:migrate"
echo "  5. Confirm DATABASE_URL is referenced from Postgres on ${WEB_SERVICE} in each env."
