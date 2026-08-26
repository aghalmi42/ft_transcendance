#!/bin/sh
# Disaster recovery: restores the database from a gzipped pg_dump produced by
# backup-loop.sh. Destructive — asks for confirmation before touching data.
#
# Usage (from the host):
#   docker compose run --rm db-backup sh /scripts/restore-db.sh /backups/transcendence_20260101_000000.sql.gz
set -eu

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  echo "Available backups:"
  ls -1 /backups/*.sql.gz 2>/dev/null || echo "  (none found in /backups)"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "File not found: $BACKUP_FILE"
  exit 1
fi

echo "This will REPLACE ALL DATA in database '$POSTGRES_DB' with the contents of $BACKUP_FILE."
printf "Type 'yes' to continue: "
read -r CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

echo "Dropping and recreating '$POSTGRES_DB'..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres \
  -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\";" \
  -c "CREATE DATABASE \"$POSTGRES_DB\";"

echo "Restoring from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "Restore complete. Restart the backend so it reconnects cleanly:"
echo "  docker compose restart backend"
