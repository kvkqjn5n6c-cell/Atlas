-- Phase 79 Atlas: Prisma-ready Dataset filters and Dataset KPI definitions.

CREATE TABLE "DatasetFilterSet" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "datasetId" TEXT,
  "name" TEXT NOT NULL,
  "filters" JSONB NOT NULL,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DatasetFilterSet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DatasetKpiDefinition" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "datasetId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "secondaryField" TEXT,
  "aggregation" TEXT NOT NULL,
  "targetValue" DOUBLE PRECISION,
  "warningThreshold" DOUBLE PRECISION,
  "criticalThreshold" DOUBLE PRECISION,
  "filterSet" JSONB,
  "filteredRowCount" INTEGER,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DatasetKpiDefinition_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DatasetFilterSet_organizationId_idx" ON "DatasetFilterSet"("organizationId");
CREATE INDEX "DatasetFilterSet_datasetId_idx" ON "DatasetFilterSet"("datasetId");
CREATE INDEX "DatasetFilterSet_createdAt_idx" ON "DatasetFilterSet"("createdAt");

CREATE INDEX "DatasetKpiDefinition_organizationId_idx" ON "DatasetKpiDefinition"("organizationId");
CREATE INDEX "DatasetKpiDefinition_datasetId_idx" ON "DatasetKpiDefinition"("datasetId");
CREATE INDEX "DatasetKpiDefinition_aggregation_idx" ON "DatasetKpiDefinition"("aggregation");
CREATE INDEX "DatasetKpiDefinition_createdAt_idx" ON "DatasetKpiDefinition"("createdAt");

ALTER TABLE "DatasetFilterSet"
ADD CONSTRAINT "DatasetFilterSet_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DatasetFilterSet"
ADD CONSTRAINT "DatasetFilterSet_datasetId_fkey"
FOREIGN KEY ("datasetId") REFERENCES "AtlasDataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DatasetKpiDefinition"
ADD CONSTRAINT "DatasetKpiDefinition_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DatasetKpiDefinition"
ADD CONSTRAINT "DatasetKpiDefinition_datasetId_fkey"
FOREIGN KEY ("datasetId") REFERENCES "AtlasDataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
