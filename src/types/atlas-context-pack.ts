import type { AtlasMemoryDocumentKey } from "@/types/atlas-memory";
import type { KnowledgeStatus } from "@/types/atlas-memory-knowledge";

export type AtlasContextPurpose =
  | "kpi_analysis"
  | "executive_summary"
  | "risk_review"
  | "copil_preparation"
  | "operational_recommendations"
  | "commercial_review";

export type AtlasContextSource = {
  type:
    | "document"
    | "knowledge"
    | "kpi"
    | "alert"
    | "rule"
    | "insight"
    | "recommendation"
    | "action_plan"
    | "action_plan_impact";
  id: string;
  title: string;
  sourceDocument?: AtlasMemoryDocumentKey;
  excerpt?: string;
  status?: KnowledgeStatus | "active" | "inactive" | "critical" | "warning";
};

export type AtlasContextPack = {
  id: string;
  organizationId: string;
  purpose: AtlasContextPurpose;
  title: string;
  generatedAt: string;
  includedDocuments: AtlasContextSource[];
  includedKnowledge: AtlasContextSource[];
  includedKpis: AtlasContextSource[];
  includedAlerts: AtlasContextSource[];
  includedRules: AtlasContextSource[];
  includedRecommendations: AtlasContextSource[];
  includedActionPlans: AtlasContextSource[];
  includedActionPlanImpacts: AtlasContextSource[];
  summary: string;
  limitations: string[];
  persisted: false;
};
