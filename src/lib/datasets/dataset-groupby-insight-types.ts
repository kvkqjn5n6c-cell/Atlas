export type DatasetGroupByInsightType =
  | "best_group"
  | "weak_group"
  | "concentration"
  | "dispersion"
  | "anomaly_candidate";

export type DatasetGroupByInsightSeverity = "info" | "watch" | "critical";

export type DatasetGroupByInsight = {
  id: string;
  datasetId: string;
  groupByAnalysisId: string;
  title: string;
  summary: string;
  insightType: DatasetGroupByInsightType;
  severity: DatasetGroupByInsightSeverity;
  groupValue: string;
  value: number;
  comparisonValue?: number;
  gap?: number;
  reasons: string[];
  recommendedAction?: string;
  createdAt: string;
  persisted: false;
};
