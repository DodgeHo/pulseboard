\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

WITH rows AS (
  SELECT 'ApiKey' AS table_name, "id" AS row_id, to_jsonb(row_value)::text AS payload FROM "ApiKey" AS row_value
  UNION ALL SELECT 'AuditLog', "id", to_jsonb(row_value)::text FROM "AuditLog" AS row_value
  UNION ALL SELECT 'CheckExecution', "id", to_jsonb(row_value)::text FROM "CheckExecution" AS row_value
  UNION ALL SELECT 'CheckRun', "id", to_jsonb(row_value)::text FROM "CheckRun" AS row_value
  UNION ALL SELECT 'Incident', "id", to_jsonb(row_value)::text FROM "Incident" AS row_value
  UNION ALL SELECT 'MonitoredService', "id", to_jsonb(row_value)::text FROM "MonitoredService" AS row_value
  UNION ALL SELECT 'Notification', "id", to_jsonb(row_value)::text FROM "Notification" AS row_value
  UNION ALL SELECT 'NotificationAttempt', "id", to_jsonb(row_value)::text FROM "NotificationAttempt" AS row_value
  UNION ALL SELECT 'Project', "id", to_jsonb(row_value)::text FROM "Project" AS row_value
  UNION ALL SELECT 'UptimeCheck', "id", to_jsonb(row_value)::text FROM "UptimeCheck" AS row_value
  UNION ALL SELECT 'UsageMetric', "id", to_jsonb(row_value)::text FROM "UsageMetric" AS row_value
  UNION ALL SELECT 'User', "id", to_jsonb(row_value)::text FROM "User" AS row_value
  UNION ALL SELECT 'WebhookEvent', "id", to_jsonb(row_value)::text FROM "WebhookEvent" AS row_value
  UNION ALL SELECT 'Workspace', "id", to_jsonb(row_value)::text FROM "Workspace" AS row_value
  UNION ALL SELECT 'WorkspaceMember', "id", to_jsonb(row_value)::text FROM "WorkspaceMember" AS row_value
  UNION ALL SELECT '_prisma_migrations', id, to_jsonb(row_value)::text FROM "_prisma_migrations" AS row_value
)
SELECT table_name || '|' || COUNT(*) || '|' || md5(string_agg(row_id || ':' || payload, E'\n' ORDER BY row_id))
FROM rows
GROUP BY table_name
ORDER BY table_name;
