#!/usr/bin/env bash
# Logical Postgres backup for Hobby (Railway volume backup schedules need Pro).
# Requires: DATABASE_URL with a reachable host (TCP proxy / public URL — not *.railway.internal).
#
# Prefer Docker with a client that matches Railway Postgres (currently 18.x):
#   DATABASE_URL=postgres://... ./scripts/pg-backup.sh
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
abs_out="$(cd "$(dirname "${out}")" && pwd)/$(basename "${out}")"
abs_dir="$(dirname "${abs_out}")"
file_name="$(basename "${abs_out}")"

# Railway Postgres is 18.x; local pg_dump 16 fails with version mismatch.
PG_IMAGE="${PG_DUMP_IMAGE:-postgres:18}"

echo "Dumping to ${abs_out} via ${PG_IMAGE}"
if command -v docker >/dev/null 2>&1; then
  docker run --rm \
    -e DATABASE_URL="${DATABASE_URL}" \
    -v "${abs_dir}:/backups" \
    "${PG_IMAGE}" \
    pg_dump --format=custom --no-owner --no-acl --file="/backups/${file_name}" "${DATABASE_URL}"
elif command -v pg_dump >/dev/null 2>&1; then
  echo "WARN: using host pg_dump; if versions mismatch, install Docker or a PG 18 client." >&2
  pg_dump --format=custom --no-owner --no-acl --file="${abs_out}" "${DATABASE_URL}"
else
  echo "Need docker (preferred) or pg_dump on PATH." >&2
  exit 1
fi

ls -lh "${abs_out}"
echo "OK. Restore example:"
echo "  docker run --rm -e DATABASE_URL -v ${abs_dir}:/backups ${PG_IMAGE} \\"
echo "    pg_restore --clean --if-exists --no-owner --no-acl -d \"\$DATABASE_URL\" /backups/${file_name}"
