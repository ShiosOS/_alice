#!/usr/bin/env bash
# Logical Postgres backup for Hobby (no Railway volume backup schedule).
# Requires: DATABASE_URL with a reachable host (TCP proxy / public URL — not *.railway.internal).
#
#   DATABASE_URL=postgres://... ./scripts/pg-backup.sh
#   DATABASE_URL=... OUT=./backups/alice.dump ./scripts/pg-backup.sh
#
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Set DATABASE_URL to a publicly reachable Postgres URL." >&2
  exit 1
fi

outdir="${OUT_DIR:-./backups}"
mkdir -p "${outdir}"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
out="${OUT:-${outdir}/alice-${stamp}.dump}"

echo "Dumping to ${out}"
pg_dump --format=custom --no-owner --no-acl --file="${out}" "${DATABASE_URL}"
ls -lh "${out}"
echo "OK. Restore with: pg_restore --clean --if-exists --no-owner --no-acl -d \"\$DATABASE_URL\" ${out}"
