export type ImpactStatus = "not_measurable" | "pending" | "positive" | "neutral" | "negative";

export type ImpactEvidence = {
  label: string;
  value: string | number;
  source: string;
};

export type LocalActionPlanImpact = {
  id: string;
  actionPlanId: string;
  relatedKpiId: string;
  measuredAt: string;
  beforeValue?: number;
  afterValue?: number;
  variation?: number;
  trend: "up" | "down" | "stable" | "unknown";
  status: ImpactStatus;
  interpretation: string;
  evidence: ImpactEvidence[];
  persisted: false;
};
