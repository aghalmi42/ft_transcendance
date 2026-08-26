#!/bin/sh
# Manual one-off backup, e.g. before a risky migration.
# Usage: docker compose run --rm db-backup sh /scripts/backup-once.sh
set -eu

mkdir -p /backups
timestamp=$(date +%Y%m%d_%H%M%S)
file="/backups/transcendence_manual_${timestamp}.sql.gz"

PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$file"
echo "Backup written to $file ($(du -h "$file" | cut -f1))"
