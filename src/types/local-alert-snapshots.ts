import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";

export type LocalAlertSnapshotStatus = "open" | "resolved" | "ignored";

export type LocalAlertSnapshot = {
  id: string;
  organizationId: string;
  alertId: string;
  sourceType: "kpi_status" | "alert_rule";
  sourceId: string;
  severity: LocalKpiAlert["severity"];
  status: LocalAlertSnapshotStatus;
  title: string;
  message: string;
  relatedKpiId?: string;
  relatedRuleId?: string;
  generatedAt: string;
  metadata?: {
    value?: number;
    targetValue?: number;
    warningThreshold?: number;
    criticalThreshold?: number;
    sourceFileName?: string;
    alertSource?: LocalKpiAlert["alertSource"];
    recommendedAction?: string;
  };
  persisted: false;
};
