import type { KpiDirection } from "@/types/local-kpi";

export type LocalInsightType =
  | "performance"
  | "risk"
  | "trend"
  | "data_quality"
  | "alert_rule"
  | "opportunity";

export type LocalInsightSeverity = "info" | "watch" | "critical";

export type LocalInsightEvidence = {
  kpiName: string;
  value: number;
  previousValue?: number;
  variation?: number;
  threshold?: number;
  direction?: KpiDirection;
  source?: string;
};

export type LocalInsightMemoryReference = {
  knowledgeId?: string;
  sourceDocument: string;
  knowledgeType: string;
  value: string;
  status: "Validée";
};

export type LocalInsight = {
  id: string;
  organizationId: string;
  title: string;
  summary: string;
  severity: LocalInsightSeverity;
  insightType: LocalInsightType;
  relatedKpiIds: string[];
  relatedAlertIds?: string[];
  memorySources?: string[];
  memoryReferences?: string[];
  memoryKnowledgeLabels?: string[];
  memoryReferenceItems?: LocalInsightMemoryReference[];
  evidence: LocalInsightEvidence[];
  recommendedAction: string;
  createdAt: string;
  persisted: false;
};
