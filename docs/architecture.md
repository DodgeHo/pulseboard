# Architecture Notes

PulseBoard is a modular monolith with separate runtime processes for API and background workers.

## Phase 1 Scope

- Hono API with API key auth.
- PostgreSQL schema for tenants, monitored resources, check runs, incidents, webhooks, notifications, usage metrics, and audit logs.
- Redis-backed BullMQ queues.
- Worker-driven uptime checks with incident transitions.
- OpenAPI JSON and Scalar API reference.
- Unit tests for business rules and integration tests for representative API flows.
- In-process write-path rate limiting as a local Phase 1 guardrail.

## Runtime Boundaries

- The API process owns synchronous HTTP concerns: validation, auth, CRUD operations, webhook ingest, and queue enqueueing.
- The worker owns background concerns: scheduled checks, HTTP probing, incident transition decisions, and mocked notification delivery.
- PostgreSQL is the source of truth.
- Redis is disposable queue infrastructure.

## Observability

- API requests receive or generate an `X-Request-Id`.
- API logs include request id, method, path, status, duration, and authenticated user id when available.
- Worker logs include queue scheduling, check execution, incident transitions, and notification sends.
- PostgreSQL keeps durable operational history through check runs, audit logs, usage metrics, incidents, and notifications.

## Local-First Development

Development starts in WSL Ubuntu with Docker Compose. This keeps the developer workflow close to a production Linux environment without creating cloud cost early.
