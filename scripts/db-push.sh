#!/usr/bin/env bash
# Authenticate the Supabase CLI and push local migrations to the linked project.
# Prompts for the DB password at runtime — nothing is written to disk.
#
# Usage:
#   bash scripts/db-push.sh
#
# What it does:
#   1. supabase login (browser flow) — skipped if already authed
#   2. supabase link --project-ref ... --password <prompted>
#   3. supabase db push --include-all   (falls back to direct --db-url
#      connection if the management API rejects the access token)

set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="xgnevwtgxsqzneetqhlw"
DB_HOST="db.${PROJECT_REF}.supabase.co"

# CLI 2.106 sometimes defaults to JSON output which breaks the login prompt.
# Force pretty output for any command we drive here.
export SUPABASE_INTERNAL_OUTPUT=pretty

echo "→ checking Supabase login"
if ! supabase projects list --output pretty >/dev/null 2>&1; then
  echo "  not authed yet — running supabase login"
  supabase login --output pretty
fi

echo
read -rsp "Database password (Supabase dashboard → Settings → Database): " DB_PASSWORD
echo
echo

echo "→ linking project ${PROJECT_REF}"
supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD" >/dev/null

# URL-encode the password for the fallback --db-url path.
encoded_password=$(node -e "process.stdout.write(encodeURIComponent(process.argv[1]))" "$DB_PASSWORD")
DB_URL="postgresql://postgres:${encoded_password}@${DB_HOST}:5432/postgres"

echo "→ pushing migrations"
if ! supabase db push --include-all 2>/tmp/supabase-push.err; then
  if grep -q -i "access token" /tmp/supabase-push.err; then
    echo "  management API rejected the token — retrying via direct DB connection"
    supabase db push --include-all --db-url "$DB_URL"
  else
    cat /tmp/supabase-push.err >&2
    exit 1
  fi
fi
rm -f /tmp/supabase-push.err

unset DB_PASSWORD encoded_password DB_URL

echo
echo "Done."
