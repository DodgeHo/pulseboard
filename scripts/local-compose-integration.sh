#!/usr/bin/env bash
set -euo pipefail

if command -v systemctl >/dev/null 2>&1 && [ "$(id -u)" = "0" ]; then
  systemctl start docker.service
fi

docker compose up -d

for _ in {1..60}; do
  if curl -fsS http://127.0.0.1:4000/health/ready >/dev/null; then
    break
  fi
  sleep 2
done

curl -fsS http://127.0.0.1:4000/health/ready >/dev/null
docker compose exec -T api sh -lc 'RUN_INTEGRATION_TESTS=true NODE_ENV=test DEMO_API_KEY="${DEMO_API_KEY:-pb_local_demo_key_change_me}" pnpm --filter @pulseboard/api test:integration'
