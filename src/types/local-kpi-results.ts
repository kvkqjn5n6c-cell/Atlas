import type { KPIConfigurationDraft } from "@/types/atlas";
import type { LocalKpiTestStatus } from "@/types/local-kpi";

export type LocalKpiResult = {
  id: string;
  kpiId: string;
  importId?: string;
  name: string;
  displayFieldLabel?: string;
  calculationType: KPIConfigurationDraft["calculationType"];
  value: number;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  status: LocalKpiTestStatus;
  trend?: "up" | "down" | "stable";
  variation?: number;
  calculatedAt: string;
  sourceFileName: string;
  persisted: false;
};
