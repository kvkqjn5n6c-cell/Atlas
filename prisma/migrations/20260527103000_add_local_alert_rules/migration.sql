-- Phase 28 Atlas: persistable alert rules, optional and fallback-safe.

CREATE TYPE "AlertRuleType" AS ENUM ('THRESHOLD', 'TARGET_GAP', 'VARIATION', 'PERSISTENCE');
CREATE TYPE "AlertRuleSeverity" AS ENUM ('WARNING', 'CRITICAL');
CREATE TYPE "AlertComparisonOperator" AS ENUM (
  'GREATER_THAN',
  'LESS_THAN',
  'TARGET_GAP_GREATER_THAN',
  'TARGET_GAP_LESS_THAN',
  'VARIATION_UP_GREATER_THAN',
  'VARIATION_DOWN_GREATER_THAN',
  'CONSECUTIVE_PERIODS'
);

CREATE TABLE "LocalAlertRule" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "localKpiConfigurationId" TEXT,
  "kpiConfigurationId" TEXT,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "ruleType" "AlertRuleType" NOT NULL,
  "severity" "AlertRuleSeverity" NOT NULL,
  "comparisonOperator" "AlertComparisonOperator" NOT NULL,
  "thresholdValue" DOUBLE PRECISION,
  "consecutivePeriods" INTEGER,
  "variationPercent" DOUBLE PRECISION,
  "message" TEXT,
  "recommendedAction" TEXT,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LocalAlertRule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LocalAlertRule_organizationId_idx" ON "LocalAlertRule"("organizationId");
CREATE INDEX "LocalAlertRule_localKpiConfigurationId_idx" ON "LocalAlertRule"("localKpiConfigurationId");
CREATE INDEX "LocalAlertRule_kpiConfigurationId_idx" ON "LocalAlertRule"("kpiConfigurationId");
CREATE INDEX "LocalAlertRule_isActive_idx" ON "LocalAlertRule"("isActive");

ALTER TABLE "LocalAlertRule"
ADD CONSTRAINT "LocalAlertRule_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalAlertRule"
ADD CONSTRAINT "LocalAlertRule_localKpiConfigurationId_fkey"
FOREIGN KEY ("localKpiConfigurationId") REFERENCES "LocalKpiConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalAlertRule"
ADD CONSTRAINT "LocalAlertRule_kpiConfigurationId_fkey"
FOREIGN KEY ("kpiConfigurationId") REFERENCES "KPIConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
