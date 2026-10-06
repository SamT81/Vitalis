#!/bin/bash
# Runs once, only on an empty pgdata volume (use `make reset` to re-run).
# One database + one least-privilege role per service (DB-per-service principle).
# Servicios Externos has no database by design.
set -e

for svc in identidad donadores solicitudes inventario campanias auditoria_reportes; do
  echo "Creating database ${svc}_db and role ${svc}_user"
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<SQL
    CREATE ROLE ${svc}_user LOGIN PASSWORD '${DEV_DB_PASSWORD}';
    CREATE DATABASE ${svc}_db OWNER ${svc}_user;
SQL
done