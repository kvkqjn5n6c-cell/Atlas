-- Phase 53 Atlas: persistable local alert snapshots.
-- Local alerts remain generated from KPI results and rules; this table stores a lightweight trace.

CREATE TABLE "LocalAlertSnapshot" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "alertId" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "relatedKpiId" TEXT,
  "relatedRuleId" TEXT,
  "generatedAt" TIMESTAMP(3) NOT NULL,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LocalAlertSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LocalAlertSnapshot_organizationId_idx" ON "LocalAlertSnapshot"("organizationId");
CREATE INDEX "LocalAlertSnapshot_alertId_idx" ON "LocalAlertSnapshot"("alertId");
CREATE INDEX "LocalAlertSnapshot_sourceType_sourceId_idx" ON "LocalAlertSnapshot"("sourceType", "sourceId");
CREATE INDEX "LocalAlertSnapshot_relatedKpiId_idx" ON "LocalAlertSnapshot"("relatedKpiId");
CREATE INDEX "LocalAlertSnapshot_relatedRuleId_idx" ON "LocalAlertSnapshot"("relatedRuleId");
CREATE INDEX "LocalAlertSnapshot_generatedAt_idx" ON "LocalAlertSnapshot"("generatedAt");

ALTER TABLE "LocalAlertSnapshot"
ADD CONSTRAINT "LocalAlertSnapshot_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalAlertSnapshot"
ADD CONSTRAINT "LocalAlertSnapshot_relatedRuleId_fkey"
FOREIGN KEY ("relatedRuleId") REFERENCES "LocalAlertRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
