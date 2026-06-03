-- Phase 51 Atlas: progressive decision engine persistence.
-- Scope: local action plans, recommendation feedback, decision journal.

CREATE TABLE "LocalActionPlan" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sourceRecommendationId" TEXT,
  "sourceAlertId" TEXT,
  "relatedKpiIds" TEXT[],
  "relatedInsightIds" TEXT[],
  "priority" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "dueDate" TEXT,
  "expectedImpact" TEXT NOT NULL,
  "actions" JSONB NOT NULL,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LocalActionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LocalRecommendationFeedback" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "recommendationId" TEXT NOT NULL,
  "relevance" TEXT NOT NULL,
  "actionTaken" TEXT NOT NULL,
  "comment" TEXT,
  "linkedActionPlanId" TEXT,
  "impactObserved" TEXT NOT NULL,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LocalRecommendationFeedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DecisionJournalEntry" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "priority" TEXT,
  "status" TEXT,
  "confidenceScore" DOUBLE PRECISION,
  "relatedKpiIds" TEXT[],
  "relatedRecommendationIds" TEXT[],
  "relatedActionPlanIds" TEXT[],
  "relatedMemoryReferences" JSONB NOT NULL,
  "metadata" JSONB NOT NULL,
  "persistedSource" TEXT NOT NULL DEFAULT 'prisma',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DecisionJournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LocalActionPlan_organizationId_idx" ON "LocalActionPlan"("organizationId");
CREATE INDEX "LocalActionPlan_organizationId_status_idx" ON "LocalActionPlan"("organizationId", "status");
CREATE INDEX "LocalActionPlan_sourceRecommendationId_idx" ON "LocalActionPlan"("sourceRecommendationId");
CREATE INDEX "LocalActionPlan_updatedAt_idx" ON "LocalActionPlan"("updatedAt");

CREATE INDEX "LocalRecommendationFeedback_organizationId_idx" ON "LocalRecommendationFeedback"("organizationId");
CREATE INDEX "LocalRecommendationFeedback_recommendationId_idx" ON "LocalRecommendationFeedback"("recommendationId");
CREATE INDEX "LocalRecommendationFeedback_linkedActionPlanId_idx" ON "LocalRecommendationFeedback"("linkedActionPlanId");
CREATE INDEX "LocalRecommendationFeedback_updatedAt_idx" ON "LocalRecommendationFeedback"("updatedAt");

CREATE INDEX "DecisionJournalEntry_organizationId_idx" ON "DecisionJournalEntry"("organizationId");
CREATE INDEX "DecisionJournalEntry_type_idx" ON "DecisionJournalEntry"("type");
CREATE INDEX "DecisionJournalEntry_sourceType_sourceId_idx" ON "DecisionJournalEntry"("sourceType", "sourceId");
CREATE INDEX "DecisionJournalEntry_createdAt_idx" ON "DecisionJournalEntry"("createdAt");

ALTER TABLE "LocalActionPlan"
ADD CONSTRAINT "LocalActionPlan_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalRecommendationFeedback"
ADD CONSTRAINT "LocalRecommendationFeedback_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DecisionJournalEntry"
ADD CONSTRAINT "DecisionJournalEntry_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
