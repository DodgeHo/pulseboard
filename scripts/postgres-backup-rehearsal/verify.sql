\set ON_ERROR_STOP on

DO $$
DECLARE
  actual_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO actual_count FROM "User";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 User row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "ApiKey";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 ApiKey row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "Workspace";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 Workspace row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "WorkspaceMember";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 WorkspaceMember row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "Project";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 Project row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "MonitoredService";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 MonitoredService row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "UptimeCheck";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 UptimeCheck row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "CheckExecution";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 CheckExecution row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "CheckRun";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 CheckRun row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "Incident";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 Incident row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "Notification";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 Notification row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "NotificationAttempt";
  IF actual_count <> 2 THEN RAISE EXCEPTION 'expected 2 NotificationAttempt rows, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "WebhookEvent";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'expected 1 WebhookEvent row, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "AuditLog";
  IF actual_count <> 3 THEN RAISE EXCEPTION 'expected 3 AuditLog rows, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count FROM "UsageMetric";
  IF actual_count <> 2 THEN RAISE EXCEPTION 'expected 2 UsageMetric rows, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count
  FROM "_prisma_migrations"
  WHERE finished_at IS NOT NULL
    AND rolled_back_at IS NULL;
  IF actual_count <> 2 THEN RAISE EXCEPTION 'expected 2 completed Prisma migrations, found %', actual_count; END IF;

  SELECT COUNT(*) INTO actual_count
  FROM "ApiKey"
  WHERE "keyHash" ~ '^[0-9a-f]{64}$'
    AND "keyHash" <> 'pb_backup_rehearsal_key_change_me'
    AND "prefix" <> 'pb_backup_rehearsal_key_change_me';
  IF actual_count <> 1 THEN RAISE EXCEPTION 'API key hash/prefix invariant failed'; END IF;

  SELECT COUNT(*) INTO actual_count
  FROM "CheckExecution" AS execution
  JOIN "CheckRun" AS run ON run."id" = execution."checkRunId"
  WHERE execution."status" = 'SUCCEEDED'
    AND execution."idempotencyKey" = run."idempotencyKey"
    AND execution."uptimeCheckId" = run."uptimeCheckId";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'check execution/result linkage invariant failed'; END IF;

  SELECT COUNT(*) INTO actual_count
  FROM (
    SELECT "serviceId"
    FROM "Incident"
    WHERE "status" IN ('OPEN', 'ACKNOWLEDGED')
    GROUP BY "serviceId"
    HAVING COUNT(*) > 1
  ) AS duplicate_active_incidents;
  IF actual_count <> 0 THEN RAISE EXCEPTION 'more than one active incident exists for a service'; END IF;

  SELECT COUNT(*) INTO actual_count
  FROM "Notification" AS notification
  JOIN "Incident" AS incident ON incident."id" = notification."incidentId"
  JOIN "MonitoredService" AS service ON service."id" = incident."serviceId"
  JOIN "Project" AS project ON project."id" = service."projectId"
  JOIN "AuditLog" AS audit ON audit."entityId" = notification."id"
  WHERE notification."status" = 'DEAD_LETTER'
    AND notification."attemptCount" = 2
    AND notification."cycleAttemptCount" = 2
    AND audit."workspaceId" = project."workspaceId";
  IF actual_count <> 1 THEN RAISE EXCEPTION 'notification/incident/workspace lineage invariant failed'; END IF;

  SELECT COUNT(*) INTO actual_count
  FROM "NotificationAttempt"
  WHERE "notificationId" = 'backup-notification-0001'
    AND "attemptNumber" IN (1, 2);
  IF actual_count <> 2 THEN RAISE EXCEPTION 'notification attempt history invariant failed'; END IF;

  SELECT COUNT(*) INTO actual_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname = 'Incident_one_active_per_service_idx';
  IF actual_count <> 1 THEN RAISE EXCEPTION 'active incident partial unique index is missing'; END IF;
END $$;

SELECT 'backup rehearsal invariants passed' AS result;
