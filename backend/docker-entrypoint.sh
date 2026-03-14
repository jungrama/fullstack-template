#!/bin/sh
# Optional entrypoint if you run backend container with custom command.
# docker-compose uses inline wait + migrate + start instead.
set -e
until nc -z -v -w5 "${POSTGRES_HOST:-postgres}" "${POSTGRES_PORT:-5432}" 2>/dev/null; do
  echo "Waiting for PostgreSQL..."; sleep 2
done
bun run db:migrate
exec "$@"
