export type CashflowPeriod = 30 | 60 | 90;

export type CashflowMovementType = "inflow" | "outflow";

export type CashflowMovementStatus =
  | "expected"
  | "confirmed"
  | "at-risk"
  | "late"
  | "planned";

export type CashflowRiskLevel = "low" | "medium" | "high" | "critical";

export type CashflowMovement = {
  id: string;
  date: string;
  day: number;
  type: CashflowMovementType;
  counterparty: string;
  label: string;
  amount: number;
  status: CashflowMovementStatus;
  riskLevel: CashflowRiskLevel;
  recommendedAction: string;
};

export type CashflowForecastPoint = {
  day: number;
  period: string;
  projectedBalance: number;
  inflows: number;
  outflows: number;
  criticalThreshold: number;
};

export type CashflowFiltersState = {
  period: CashflowPeriod;
  movementType: CashflowMovementType | "all";
  riskOnly: boolean;
};

export type CashflowSummary = {
  currentBalance: number;
  expectedInflows: number;
  expectedOutflows: number;
  balance30: number;
  balance60: number;
  balance90: number;
  lowestBalance: number;
  tensionDate: string | null;
  riskLevel: CashflowRiskLevel;
};

export type CashflowRecommendation = {
  id: string;
  title: string;
  description: string;
  impact: string;
  riskLevel: CashflowRiskLevel;
};
