# API Examples

These examples assume the local compose stack is running and seed data has created the local demo API key.

```bash
export PULSEBOARD_API_URL=http://localhost:4000
export DEMO_API_KEY=pb_local_demo_key_change_me
```

## Health

```bash
curl "$PULSEBOARD_API_URL/health/live"
curl "$PULSEBOARD_API_URL/health/ready"
```

## List Workspaces

```bash
curl \
  -H "Authorization: Bearer $DEMO_API_KEY" \
  "$PULSEBOARD_API_URL/v1/workspaces"
```

## Create a Workspace

```bash
curl -X POST \
  -H "Authorization: Bearer $DEMO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Workspace","slug":"demo-workspace"}' \
  "$PULSEBOARD_API_URL/v1/workspaces"
```

## Create a Project

```bash
curl -X POST \
  -H "Authorization: Bearer $DEMO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Customer Platform","slug":"customer-platform"}' \
  "$PULSEBOARD_API_URL/v1/workspaces/<workspace-id>/projects"
```

## Create a Monitored Service

```bash
curl -X POST \
  -H "Authorization: Bearer $DEMO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Public API","slug":"public-api","baseUrl":"https://example.com"}' \
  "$PULSEBOARD_API_URL/v1/projects/<project-id>/services"
```

## Configure an Uptime Check

```bash
curl -X POST \
  -H "Authorization: Bearer $DEMO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Example homepage","url":"https://example.com","expectedStatus":200,"intervalSeconds":60}' \
  "$PULSEBOARD_API_URL/v1/services/<service-id>/uptime-checks"
```

Creating a check enqueues an immediate BullMQ `perform-check` job when Redis is available.

## Ingest a Webhook Event

```bash
curl -X POST \
  -H "Authorization: Bearer $DEMO_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: demo-webhook-001" \
  -d '{
    "workspaceId":"<workspace-id>",
    "source":"deploy-system",
    "eventType":"deployment.finished",
    "externalId":"deploy-001",
    "payload":{"service":"public-api","status":"succeeded"}
  }' \
  "$PULSEBOARD_API_URL/v1/webhooks/events"
```

The API stores the event, writes an audit log, records a usage metric, and returns the `X-Request-Id` response header for log correlation.

## Read Operational History

```bash
curl -H "Authorization: Bearer $DEMO_API_KEY" \
  "$PULSEBOARD_API_URL/v1/audit-logs?workspaceId=<workspace-id>"

curl -H "Authorization: Bearer $DEMO_API_KEY" \
  "$PULSEBOARD_API_URL/v1/usage-metrics?workspaceId=<workspace-id>"

curl -H "Authorization: Bearer $DEMO_API_KEY" \
  "$PULSEBOARD_API_URL/v1/incidents"
```

Audit logs and usage metrics are tenant-scoped. Requests without `workspaceId` still return only resources visible to the authenticated API key owner.

## Run the Scripted Flow

```bash
pnpm demo:flow
```

The script exercises the same public API path and prints created resources plus operational counters.

