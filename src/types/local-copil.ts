import type { LocalInsightMemoryReference } from "@/types/local-insights";

export type LocalCopilSection = {
  title: string;
  summary: string;
  items: string[];
};

export type LocalCopilBrief = {
  id: string;
  organizationId: string;
  generatedAt: string;
  title: string;
  periodLabel: string;
  globalSituation: string;
  keyKpis: string[];
  criticalAlerts: string[];
  keyRecommendations: string[];
  activeActionPlans: string[];
  measuredImpacts: string[];
  recentDecisions: string[];
  arbitrationPoints: string[];
  risks: string[];
  nextActions: string[];
  memoryReferences: LocalInsightMemoryReference[];
  confidenceNotes: string[];
  sections: LocalCopilSection[];
  persisted: false;
};
