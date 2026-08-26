#!/bin/sh
# Runs continuously in the db-backup container: dumps the database on a
# fixed interval, gzips it, and prunes dumps older than the retention window.
set -eu

RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"
BACKUP_DIR="/backups"

mkdir -p "$BACKUP_DIR"

run_backup() {
  timestamp=$(date +%Y%m%d_%H%M%S)
  file="$BACKUP_DIR/transcendence_${timestamp}.sql.gz"
  echo "[backup] $(date -Iseconds) starting backup -> $file"

  if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$file"; then
    size=$(du -h "$file" | cut -f1)
    echo "[backup] $(date -Iseconds) backup succeeded ($size)"
  else
    echo "[backup] $(date -Iseconds) backup FAILED" >&2
    rm -f "$file"
  fi

  find "$BACKUP_DIR" -name '*.sql.gz' -mtime "+${RETENTION_DAYS}" -print -delete
}

while true; do
  run_backup
  sleep "$INTERVAL_SECONDS"
done
