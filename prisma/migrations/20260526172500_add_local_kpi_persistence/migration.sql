-- Phase 25 Atlas: local KPI persistence, progressive and optional.

CREATE TYPE "KpiDirection" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER');

CREATE TABLE "LocalKpiConfiguration" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "businessDictionaryFieldId" TEXT,
  "importId" TEXT,
  "sourceFileName" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "calculationType" TEXT NOT NULL,
  "direction" "KpiDirection" NOT NULL DEFAULT 'HIGHER_IS_BETTER',
  "primaryField" TEXT NOT NULL,
  "secondaryField" TEXT,
  "sourceColumn" TEXT,
  "secondarySourceColumn" TEXT,
  "fieldType" TEXT,
  "customFieldLabel" TEXT,
  "displayFieldLabel" TEXT,
  "filterField" TEXT,
  "filterValue" TEXT,
  "targetValue" DOUBLE PRECISION NOT NULL,
  "warningThreshold" DOUBLE PRECISION NOT NULL,
  "criticalThreshold" DOUBLE PRECISION NOT NULL,
  "frequency" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "expectedImpact" TEXT NOT NULL,
  "testResult" JSONB,
  "thresholdChanges" JSONB,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LocalKpiConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LocalKpiResult" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "kpiId" TEXT NOT NULL,
  "importId" TEXT,
  "name" TEXT NOT NULL,
  "displayFieldLabel" TEXT,
  "calculationType" TEXT NOT NULL,
  "direction" "KpiDirection" NOT NULL DEFAULT 'HIGHER_IS_BETTER',
  "value" DOUBLE PRECISION NOT NULL,
  "targetValue" DOUBLE PRECISION,
  "warningThreshold" DOUBLE PRECISION,
  "criticalThreshold" DOUBLE PRECISION,
  "status" TEXT NOT NULL,
  "trend" TEXT,
  "variation" DOUBLE PRECISION,
  "sourceFileName" TEXT NOT NULL,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "calculatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LocalKpiResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LocalKpiHistoryPoint" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "kpiId" TEXT NOT NULL,
  "importId" TEXT,
  "calculatedAt" TIMESTAMP(3) NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL,
  "direction" "KpiDirection" NOT NULL DEFAULT 'HIGHER_IS_BETTER',
  "targetValue" DOUBLE PRECISION,
  "warningThreshold" DOUBLE PRECISION,
  "criticalThreshold" DOUBLE PRECISION,
  "sourceFileName" TEXT,
  "trend" TEXT,
  "variation" DOUBLE PRECISION,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LocalKpiHistoryPoint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LocalKpiConfiguration_organizationId_idx" ON "LocalKpiConfiguration"("organizationId");
CREATE INDEX "LocalKpiConfiguration_organizationId_createdAt_idx" ON "LocalKpiConfiguration"("organizationId", "createdAt");
CREATE INDEX "LocalKpiConfiguration_businessDictionaryFieldId_idx" ON "LocalKpiConfiguration"("businessDictionaryFieldId");
CREATE INDEX "LocalKpiResult_organizationId_idx" ON "LocalKpiResult"("organizationId");
CREATE INDEX "LocalKpiResult_kpiId_idx" ON "LocalKpiResult"("kpiId");
CREATE INDEX "LocalKpiResult_calculatedAt_idx" ON "LocalKpiResult"("calculatedAt");
CREATE INDEX "LocalKpiHistoryPoint_organizationId_idx" ON "LocalKpiHistoryPoint"("organizationId");
CREATE INDEX "LocalKpiHistoryPoint_kpiId_idx" ON "LocalKpiHistoryPoint"("kpiId");
CREATE INDEX "LocalKpiHistoryPoint_calculatedAt_idx" ON "LocalKpiHistoryPoint"("calculatedAt");

ALTER TABLE "LocalKpiConfiguration"
ADD CONSTRAINT "LocalKpiConfiguration_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalKpiConfiguration"
ADD CONSTRAINT "LocalKpiConfiguration_businessDictionaryFieldId_fkey"
FOREIGN KEY ("businessDictionaryFieldId") REFERENCES "BusinessDictionaryField"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LocalKpiResult"
ADD CONSTRAINT "LocalKpiResult_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalKpiResult"
ADD CONSTRAINT "LocalKpiResult_kpiId_fkey"
FOREIGN KEY ("kpiId") REFERENCES "LocalKpiConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalKpiHistoryPoint"
ADD CONSTRAINT "LocalKpiHistoryPoint_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalKpiHistoryPoint"
ADD CONSTRAINT "LocalKpiHistoryPoint_kpiId_fkey"
FOREIGN KEY ("kpiId") REFERENCES "LocalKpiConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
