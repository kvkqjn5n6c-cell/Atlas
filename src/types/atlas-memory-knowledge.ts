import type { AtlasMemoryDocumentKey } from "@/types/atlas-memory";

export type KnowledgeStatus = "detected" | "approved" | "rejected";

export type AtlasKnowledgeType = "objective" | "business_rule" | "decision" | "glossary";

export type AtlasKnowledgeItem = {
  id: string;
  organizationId: string;
  type: AtlasKnowledgeType;
  sourceDocument: AtlasMemoryDocumentKey;
  value: string;
  status: KnowledgeStatus;
  detectedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  notes?: string | null;
};
