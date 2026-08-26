# Backups & Disaster Recovery

## Health / status monitoring
- `GET /health` (backend) reports overall status, uptime, and live database connectivity (pings with `SELECT 1`). Returns `200` when healthy, `503` when degraded.
- The frontend status page ("État du service", reachable from the sidebar footer when logged in, or from the login screen footer when logged out) polls this endpoint every 15 seconds and shows the same information to end users.

## Automated backups
- The `db-backup` service (see `docker-compose.yml`) runs continuously alongside `postgres` and dumps the database with `pg_dump` on a fixed interval.
- Defaults: every 24h (`BACKUP_INTERVAL_SECONDS=86400`), keeping the last 7 days (`BACKUP_RETENTION_DAYS=7`). Both are overridable via `.env`.
- Dumps are gzipped and written to `./backups/` on the host (bind-mounted), named `transcendence_<YYYYMMDD_HHMMSS>.sql.gz`. Older files past the retention window are pruned automatically on each run.
- A manual, one-off backup (e.g. right before a risky migration) can be triggered at any time:
  ```sh
  docker compose run --rm db-backup sh /scripts/backup-once.sh
  ```

## Restoring from a backup (disaster recovery)
This is destructive — it drops and recreates the database — so it always asks for confirmation.

1. Pick a dump from `./backups/` (or copy one back in from off-site storage).
2. Run:
   ```sh
   docker compose run --rm db-backup sh /scripts/restore-db.sh /backups/transcendence_20260101_000000.sql.gz
   ```
3. Confirm by typing `yes` when prompted.
4. Restart the backend so it reconnects cleanly and re-establishes its connection pool:
   ```sh
   docker compose restart backend
   ```
5. Verify recovery: check `GET /health` (or the "État du service" page) reports `database.status: "up"`, then spot-check that recent data (e.g. `GET /users`) looks right.

## Recovery targets
- **RPO (Recovery Point Objective):** up to 24h of data loss in the worst case, bounded by the backup interval. Lower it by shortening `BACKUP_INTERVAL_SECONDS`, or take a manual backup before any risky operation.
- **RTO (Recovery Time Objective):** a few minutes — restoring a dump and restarting the backend is the only step; no other service depends on more than the database being reachable again.

## Off-site copies
`./backups/` lives on the same host as the database volume, so it does **not** protect against full host loss on its own. For real disaster recovery, periodically copy the contents of `./backups/` to separate storage (another machine, object storage, etc.) — this is intentionally left as an operational step outside of docker-compose, since it depends on what storage the team has available.
