import type { KpiDirection, LocalKpiTestStatus } from "@/types/local-kpi";

export type LocalKpiHistoryPoint = {
  id: string;
  kpiId: string;
  importId?: string;
  calculatedAt: string;
  value: number;
  status: LocalKpiTestStatus;
  direction?: KpiDirection;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  sourceFileName?: string;
  trend?: "up" | "down" | "stable";
  variation?: number;
  persisted: false;
};

export type LocalKpiThresholdChange = {
  id: string;
  kpiId: string;
  changedAt: string;
  previousTargetValue: number;
  nextTargetValue: number;
  previousWarningThreshold: number;
  nextWarningThreshold: number;
  previousCriticalThreshold: number;
  nextCriticalThreshold: number;
  persisted: false;
};
