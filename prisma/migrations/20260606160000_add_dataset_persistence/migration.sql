-- Phase 73 Atlas: Prisma-ready Prepared SQL Sources and Atlas Datasets.

CREATE TABLE "PreparedSqlSource" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "connectionId" TEXT NOT NULL,
  "tableName" TEXT NOT NULL,
  "schema" TEXT,
  "displayName" TEXT NOT NULL,
  "mappingId" TEXT NOT NULL,
  "mappedFields" JSONB NOT NULL,
  "qualityScore" INTEGER NOT NULL,
  "rowPreviewCount" INTEGER NOT NULL,
  "availableAtlasFields" JSONB NOT NULL,
  "warnings" TEXT[],
  "preview" JSONB NOT NULL,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PreparedSqlSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AtlasDataset" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "rowCount" INTEGER NOT NULL,
  "fields" JSONB NOT NULL,
  "records" JSONB NOT NULL,
  "qualityScore" INTEGER NOT NULL,
  "warnings" TEXT[],
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AtlasDataset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PreparedSqlSource_organizationId_idx" ON "PreparedSqlSource"("organizationId");
CREATE INDEX "PreparedSqlSource_connectionId_idx" ON "PreparedSqlSource"("connectionId");
CREATE INDEX "PreparedSqlSource_mappingId_idx" ON "PreparedSqlSource"("mappingId");
CREATE INDEX "PreparedSqlSource_tableName_idx" ON "PreparedSqlSource"("tableName");
CREATE INDEX "PreparedSqlSource_updatedAt_idx" ON "PreparedSqlSource"("updatedAt");

CREATE INDEX "AtlasDataset_organizationId_idx" ON "AtlasDataset"("organizationId");
CREATE INDEX "AtlasDataset_sourceId_idx" ON "AtlasDataset"("sourceId");
CREATE INDEX "AtlasDataset_createdAt_idx" ON "AtlasDataset"("createdAt");
CREATE INDEX "AtlasDataset_updatedAt_idx" ON "AtlasDataset"("updatedAt");

ALTER TABLE "PreparedSqlSource"
ADD CONSTRAINT "PreparedSqlSource_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AtlasDataset"
ADD CONSTRAINT "AtlasDataset_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AtlasDataset"
ADD CONSTRAINT "AtlasDataset_sourceId_fkey"
FOREIGN KEY ("sourceId") REFERENCES "PreparedSqlSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
