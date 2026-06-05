import type { ConfidenceLevel } from "@/types/recommendation-confidence";

export type ExecutiveGlobalStatus = "healthy" | "watch" | "critical";

export type ExecutiveDashboardCard = {
  title: string;
  summary: string;
  status: ExecutiveGlobalStatus;
  score?: number;
  sourceIds: string[];
  actionLabel?: string;
};

export type LocalExecutiveDashboard = {
  id: string;
  organizationId: string;
  generatedAt: string;
  globalStatus: ExecutiveGlobalStatus;
  globalScore: number;
  confidenceLevel: ConfidenceLevel;
  topPriorities: ExecutiveDashboardCard[];
  criticalRisks: ExecutiveDashboardCard[];
  keyRecommendations: ExecutiveDashboardCard[];
  activeActionPlans: ExecutiveDashboardCard[];
  recentImpacts: ExecutiveDashboardCard[];
  recentDecisions: ExecutiveDashboardCard[];
  memorySignals: ExecutiveDashboardCard[];
  comparativeSignals?: ExecutiveDashboardCard[];
  dataReliabilityNotes: string[];
  nextBestActions: string[];
  persisted: false;
};
