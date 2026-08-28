#!/usr/bin/env bash
set -euo pipefail

if command -v systemctl >/dev/null 2>&1 && [ "$(id -u)" = "0" ]; then
  systemctl start docker.service
fi

restore_services() {
  docker compose start postgres redis api worker >/dev/null 2>&1 || true
}

trap restore_services EXIT

wait_for_status() {
  local url="$1"
  local expected="$2"
  local label="$3"
  local status

  for _ in {1..60}; do
    status="$(curl --max-time 5 --silent --output /tmp/pulseboard-fault-response --write-out '%{http_code}' "$url" || true)"
    if [ "$status" = "$expected" ]; then
      printf '%s: HTTP %s\n' "$label" "$status"
      return 0
    fi
    sleep 1
  done

  printf '%s did not reach HTTP %s. Last response:\n' "$label" "$expected" >&2
  cat /tmp/pulseboard-fault-response >&2 || true
  return 1
}

docker compose up --build -d
wait_for_status http://127.0.0.1:4000/health/ready 200 'baseline readiness'
wait_for_status http://127.0.0.1:4000/metrics 200 'baseline metrics'

docker compose stop -t 10 postgres
wait_for_status http://127.0.0.1:4000/health/ready 503 'PostgreSQL outage readiness'
grep -q '"status":"not_ready"' /tmp/pulseboard-fault-response

docker compose start postgres
wait_for_status http://127.0.0.1:4000/health/ready 200 'PostgreSQL recovery readiness'

docker compose stop -t 10 redis
wait_for_status http://127.0.0.1:4000/health/ready 503 'Redis outage readiness'
grep -q '"status":"not_ready"' /tmp/pulseboard-fault-response
wait_for_status http://127.0.0.1:4000/metrics 503 'Redis outage metrics'
grep -q 'PulseBoard metrics scrape failed' /tmp/pulseboard-fault-response

docker compose start redis
wait_for_status http://127.0.0.1:4000/health/ready 200 'Redis recovery readiness'
wait_for_status http://127.0.0.1:4000/metrics 200 'Redis recovery metrics'

api_container="$(docker compose ps -q api)"
docker compose stop -t 15 api
api_exit_code="$(docker inspect --format '{{.State.ExitCode}}' "$api_container")"
if [ "$api_exit_code" != "0" ]; then
  printf 'API container exited with code %s after SIGTERM.\n' "$api_exit_code" >&2
  docker compose logs api >&2
  exit 1
fi
docker compose logs api | grep -q 'PulseBoard API stopped'
printf 'API graceful shutdown: exit code 0 with shutdown completion log\n'

docker compose start api
wait_for_status http://127.0.0.1:4000/health/ready 200 'API restart readiness'

worker_container="$(docker compose ps -q worker)"
docker compose stop -t 15 worker
worker_exit_code="$(docker inspect --format '{{.State.ExitCode}}' "$worker_container")"
if [ "$worker_exit_code" != "0" ]; then
  printf 'Worker container exited with code %s after SIGTERM.\n' "$worker_exit_code" >&2
  docker compose logs worker >&2
  exit 1
fi
docker compose logs worker | grep -q 'PulseBoard worker stopped'
printf 'Worker graceful shutdown: exit code 0 with shutdown completion log\n'

docker compose start worker

trap - EXIT
printf 'Fault-injection drill completed successfully.\n'
