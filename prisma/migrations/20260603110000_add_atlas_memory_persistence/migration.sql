-- Phase 54 Atlas: Prisma-ready Atlas Memory documents and governed knowledge.

CREATE TABLE "AtlasMemoryDocument" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "version" TEXT,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AtlasMemoryDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AtlasMemoryKnowledgeItem" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "sourceDocumentId" TEXT,
  "sourceDocumentSlug" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "detectedAt" TIMESTAMP(3) NOT NULL,
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "notes" TEXT,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AtlasMemoryKnowledgeItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AtlasMemoryDocument_organizationId_slug_key" ON "AtlasMemoryDocument"("organizationId", "slug");
CREATE INDEX "AtlasMemoryDocument_organizationId_idx" ON "AtlasMemoryDocument"("organizationId");
CREATE INDEX "AtlasMemoryDocument_slug_idx" ON "AtlasMemoryDocument"("slug");
CREATE INDEX "AtlasMemoryDocument_status_idx" ON "AtlasMemoryDocument"("status");
CREATE INDEX "AtlasMemoryDocument_category_idx" ON "AtlasMemoryDocument"("category");

CREATE INDEX "AtlasMemoryKnowledgeItem_organizationId_idx" ON "AtlasMemoryKnowledgeItem"("organizationId");
CREATE INDEX "AtlasMemoryKnowledgeItem_sourceDocumentId_idx" ON "AtlasMemoryKnowledgeItem"("sourceDocumentId");
CREATE INDEX "AtlasMemoryKnowledgeItem_sourceDocumentSlug_idx" ON "AtlasMemoryKnowledgeItem"("sourceDocumentSlug");
CREATE INDEX "AtlasMemoryKnowledgeItem_status_idx" ON "AtlasMemoryKnowledgeItem"("status");
CREATE INDEX "AtlasMemoryKnowledgeItem_type_idx" ON "AtlasMemoryKnowledgeItem"("type");

ALTER TABLE "AtlasMemoryDocument"
ADD CONSTRAINT "AtlasMemoryDocument_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AtlasMemoryKnowledgeItem"
ADD CONSTRAINT "AtlasMemoryKnowledgeItem_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AtlasMemoryKnowledgeItem"
ADD CONSTRAINT "AtlasMemoryKnowledgeItem_sourceDocumentId_fkey"
FOREIGN KEY ("sourceDocumentId") REFERENCES "AtlasMemoryDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
