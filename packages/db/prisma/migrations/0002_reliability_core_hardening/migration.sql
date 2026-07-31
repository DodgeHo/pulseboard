-- Phase 3 reliability core hardening.
ALTER TYPE "NotificationStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
ALTER TYPE "NotificationStatus" ADD VALUE IF NOT EXISTS 'DEAD_LETTER';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'NOTIFICATION_FAILED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'NOTIFICATION_REPLAYED';
CREATE TYPE "CheckExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

ALTER TABLE "CheckRun" ADD COLUMN "idempotencyKey" TEXT;
UPDATE "CheckRun" SET "idempotencyKey" = 'legacy:check-run:' || "id" WHERE "idempotencyKey" IS NULL;
ALTER TABLE "CheckRun" ALTER COLUMN "idempotencyKey" SET NOT NULL;

ALTER TABLE "Incident" ADD COLUMN "openIdempotencyKey" TEXT;
ALTER TABLE "Incident" ADD COLUMN "resolveIdempotencyKey" TEXT;

ALTER TABLE "Notification" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "Notification" ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Notification" ADD COLUMN "cycleAttemptCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Notification" ADD COLUMN "maxAttempts" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Notification" ADD COLUMN "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Notification" ADD COLUMN "lastAttemptAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN "leaseOwner" TEXT;
ALTER TABLE "Notification" ADD COLUMN "leaseExpiresAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN "deadLetteredAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN "replayedAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Notification" SET "idempotencyKey" = 'legacy:notification:' || "id" WHERE "idempotencyKey" IS NULL;
ALTER TABLE "Notification" ALTER COLUMN "idempotencyKey" SET NOT NULL;

ALTER TABLE "AuditLog" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "UsageMetric" ADD COLUMN "idempotencyKey" TEXT;

CREATE TABLE "CheckExecution" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "status" "CheckExecutionStatus" NOT NULL DEFAULT 'PENDING',
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "leaseOwner" TEXT,
  "leaseExpiresAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "uptimeCheckId" TEXT NOT NULL,
  "checkRunId" TEXT,
  CONSTRAINT "CheckExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationAttempt" (
  "id" TEXT NOT NULL,
  "attemptNumber" INTEGER NOT NULL,
  "succeeded" BOOLEAN NOT NULL,
  "errorMessage" TEXT,
  "responseStatus" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notificationId" TEXT NOT NULL,
  CONSTRAINT "NotificationAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CheckRun_idempotencyKey_key" ON "CheckRun"("idempotencyKey");
CREATE UNIQUE INDEX "CheckExecution_idempotencyKey_key" ON "CheckExecution"("idempotencyKey");
CREATE UNIQUE INDEX "CheckExecution_checkRunId_key" ON "CheckExecution"("checkRunId");
CREATE INDEX "CheckExecution_status_scheduledFor_idx" ON "CheckExecution"("status", "scheduledFor");
CREATE INDEX "CheckExecution_uptimeCheckId_scheduledFor_idx" ON "CheckExecution"("uptimeCheckId", "scheduledFor");
CREATE UNIQUE INDEX "Incident_openIdempotencyKey_key" ON "Incident"("openIdempotencyKey");
CREATE UNIQUE INDEX "Incident_resolveIdempotencyKey_key" ON "Incident"("resolveIdempotencyKey");
CREATE UNIQUE INDEX "Incident_one_active_per_service_idx" ON "Incident"("serviceId") WHERE "status" IN ('OPEN', 'ACKNOWLEDGED');
CREATE UNIQUE INDEX "Notification_idempotencyKey_key" ON "Notification"("idempotencyKey");
CREATE INDEX "Notification_status_nextAttemptAt_idx" ON "Notification"("status", "nextAttemptAt");
CREATE UNIQUE INDEX "NotificationAttempt_notificationId_attemptNumber_key" ON "NotificationAttempt"("notificationId", "attemptNumber");
CREATE INDEX "NotificationAttempt_notificationId_createdAt_idx" ON "NotificationAttempt"("notificationId", "createdAt");
CREATE UNIQUE INDEX "AuditLog_idempotencyKey_key" ON "AuditLog"("idempotencyKey");
CREATE UNIQUE INDEX "UsageMetric_idempotencyKey_key" ON "UsageMetric"("idempotencyKey");

ALTER TABLE "CheckExecution" ADD CONSTRAINT "CheckExecution_uptimeCheckId_fkey" FOREIGN KEY ("uptimeCheckId") REFERENCES "UptimeCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CheckExecution" ADD CONSTRAINT "CheckExecution_checkRunId_fkey" FOREIGN KEY ("checkRunId") REFERENCES "CheckRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NotificationAttempt" ADD CONSTRAINT "NotificationAttempt_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
