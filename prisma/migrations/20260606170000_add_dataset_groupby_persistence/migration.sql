-- Phase 74 Atlas: Prisma-ready Dataset GroupBy analyses and comparative insights.

CREATE TABLE "DatasetGroupByAnalysis" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "datasetId" TEXT NOT NULL,
  "aggregation" TEXT NOT NULL,
  "field" TEXT,
  "groupedBy" JSONB NOT NULL,
  "results" JSONB NOT NULL,
  "summary" JSONB,
  "warnings" TEXT[],
  "generatedAt" TIMESTAMP(3) NOT NULL,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DatasetGroupByAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DatasetGroupByInsight" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "datasetId" TEXT NOT NULL,
  "groupByAnalysisId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "insightType" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "groupValue" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "comparisonValue" DOUBLE PRECISION,
  "gap" DOUBLE PRECISION,
  "reasons" TEXT[],
  "recommendedAction" TEXT,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DatasetGroupByInsight_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DatasetGroupByAnalysis_organizationId_idx" ON "DatasetGroupByAnalysis"("organizationId");
CREATE INDEX "DatasetGroupByAnalysis_datasetId_idx" ON "DatasetGroupByAnalysis"("datasetId");
CREATE INDEX "DatasetGroupByAnalysis_aggregation_idx" ON "DatasetGroupByAnalysis"("aggregation");
CREATE INDEX "DatasetGroupByAnalysis_generatedAt_idx" ON "DatasetGroupByAnalysis"("generatedAt");

CREATE INDEX "DatasetGroupByInsight_organizationId_idx" ON "DatasetGroupByInsight"("organizationId");
CREATE INDEX "DatasetGroupByInsight_datasetId_idx" ON "DatasetGroupByInsight"("datasetId");
CREATE INDEX "DatasetGroupByInsight_groupByAnalysisId_idx" ON "DatasetGroupByInsight"("groupByAnalysisId");
CREATE INDEX "DatasetGroupByInsight_severity_idx" ON "DatasetGroupByInsight"("severity");
CREATE INDEX "DatasetGroupByInsight_insightType_idx" ON "DatasetGroupByInsight"("insightType");

ALTER TABLE "DatasetGroupByAnalysis"
ADD CONSTRAINT "DatasetGroupByAnalysis_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DatasetGroupByAnalysis"
ADD CONSTRAINT "DatasetGroupByAnalysis_datasetId_fkey"
FOREIGN KEY ("datasetId") REFERENCES "AtlasDataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DatasetGroupByInsight"
ADD CONSTRAINT "DatasetGroupByInsight_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DatasetGroupByInsight"
ADD CONSTRAINT "DatasetGroupByInsight_datasetId_fkey"
FOREIGN KEY ("datasetId") REFERENCES "AtlasDataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DatasetGroupByInsight"
ADD CONSTRAINT "DatasetGroupByInsight_groupByAnalysisId_fkey"
FOREIGN KEY ("groupByAnalysisId") REFERENCES "DatasetGroupByAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
