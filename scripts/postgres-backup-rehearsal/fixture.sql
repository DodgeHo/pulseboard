\set ON_ERROR_STOP on

DO $$
DECLARE
  workspace_id TEXT;
  service_id TEXT;
  uptime_check_id TEXT;
BEGIN
  SELECT "id"
  INTO STRICT workspace_id
  FROM "Workspace"
  WHERE "slug" = 'acme-remote-ops';

  SELECT service."id"
  INTO STRICT service_id
  FROM "MonitoredService" AS service
  JOIN "Project" AS project ON project."id" = service."projectId"
  WHERE project."workspaceId" = workspace_id
    AND service."slug" = 'public-api';

  SELECT "id"
  INTO STRICT uptime_check_id
  FROM "UptimeCheck"
  WHERE "serviceId" = service_id
    AND "name" = 'Example homepage';

  INSERT INTO "CheckRun" (
    "id", "idempotencyKey", "status", "statusCode", "latencyMs",
    "errorMessage", "checkedAt", "uptimeCheckId", "serviceId"
  ) VALUES (
    'backup-check-run-0001',
    'backup:check:2026-08-28T00:00:00.000Z',
    'DOWN',
    503,
    742,
    'Deterministic backup rehearsal failure',
    '2026-08-28T00:00:00.000Z',
    uptime_check_id,
    service_id
  );

  INSERT INTO "CheckExecution" (
    "id", "idempotencyKey", "status", "scheduledFor", "attemptCount",
    "createdAt", "updatedAt", "uptimeCheckId", "checkRunId"
  ) VALUES (
    'backup-check-execution-0001',
    'backup:check:2026-08-28T00:00:00.000Z',
    'SUCCEEDED',
    '2026-08-28T00:00:00.000Z',
    1,
    '2026-08-28T00:00:00.000Z',
    '2026-08-28T00:00:01.000Z',
    uptime_check_id,
    'backup-check-run-0001'
  );

  INSERT INTO "Incident" (
    "id", "title", "status", "severity", "summary", "openedAt",
    "createdAt", "updatedAt", "serviceId", "openIdempotencyKey"
  ) VALUES (
    'backup-incident-0001',
    'Example homepage is unavailable',
    'OPEN',
    'minor',
    'Deterministic incident used by the backup rehearsal.',
    '2026-08-28T00:00:01.000Z',
    '2026-08-28T00:00:01.000Z',
    '2026-08-28T00:00:01.000Z',
    service_id,
    'backup:incident:open:0001'
  );

  INSERT INTO "Notification" (
    "id", "idempotencyKey", "channel", "status", "target", "payload",
    "errorMessage", "attemptCount", "cycleAttemptCount", "maxAttempts",
    "nextAttemptAt", "lastAttemptAt", "deadLetteredAt", "createdAt",
    "updatedAt", "incidentId"
  ) VALUES (
    'backup-notification-0001',
    'backup:notification:incident-opened:0001',
    'WEBHOOK',
    'DEAD_LETTER',
    'https://example.com/pulseboard-webhook',
    '{"incidentId":"backup-incident-0001","event":"incident.opened"}'::jsonb,
    'Deterministic provider failure',
    2,
    2,
    2,
    '2026-08-28T00:02:00.000Z',
    '2026-08-28T00:01:00.000Z',
    '2026-08-28T00:01:00.000Z',
    '2026-08-28T00:00:01.000Z',
    '2026-08-28T00:01:00.000Z',
    'backup-incident-0001'
  );

  INSERT INTO "NotificationAttempt" (
    "id", "attemptNumber", "succeeded", "errorMessage", "responseStatus",
    "createdAt", "notificationId"
  ) VALUES
    (
      'backup-notification-attempt-0001', 1, FALSE,
      'Deterministic provider failure', 503,
      '2026-08-28T00:00:30.000Z', 'backup-notification-0001'
    ),
    (
      'backup-notification-attempt-0002', 2, FALSE,
      'Deterministic provider failure', 503,
      '2026-08-28T00:01:00.000Z', 'backup-notification-0001'
    );

  INSERT INTO "WebhookEvent" (
    "id", "source", "eventType", "externalId", "payload", "receivedAt",
    "processedAt", "workspaceId"
  ) VALUES (
    'backup-webhook-event-0001',
    'backup-rehearsal',
    'fixture.created',
    'backup-rehearsal-0001',
    '{"source":"backup-rehearsal"}'::jsonb,
    '2026-08-28T00:00:00.000Z',
    '2026-08-28T00:00:01.000Z',
    workspace_id
  );

  INSERT INTO "AuditLog" (
    "id", "idempotencyKey", "action", "entityType", "entityId",
    "actorType", "message", "metadata", "createdAt", "workspaceId"
  ) VALUES
    (
      'backup-audit-log-0001',
      'backup:audit:incident-opened:0001',
      'INCIDENT_OPENED',
      'incident',
      'backup-incident-0001',
      'system',
      'Opened deterministic backup rehearsal incident.',
      '{"checkRunId":"backup-check-run-0001"}'::jsonb,
      '2026-08-28T00:00:01.000Z',
      workspace_id
    ),
    (
      'backup-audit-log-0002',
      'backup:audit:notification-failed:0001',
      'NOTIFICATION_FAILED',
      'notification',
      'backup-notification-0001',
      'system',
      'Dead-lettered deterministic backup rehearsal notification.',
      '{"attemptCount":2}'::jsonb,
      '2026-08-28T00:01:00.000Z',
      workspace_id
    );

  INSERT INTO "UsageMetric" (
    "id", "idempotencyKey", "name", "value", "recordedAt", "workspaceId"
  ) VALUES (
    'backup-usage-metric-0001',
    'backup:usage:uptime-check:0001',
    'uptime_checks_performed',
    1,
    '2026-08-28T00:00:01.000Z',
    workspace_id
  );
END $$;
