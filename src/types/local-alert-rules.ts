export type LocalAlertRuleType = "threshold" | "target-gap" | "variation" | "persistence";
export type LocalAlertRuleSeverity = "warning" | "critical";
export type LocalAlertComparisonOperator =
  | "greater_than"
  | "less_than"
  | "target_gap_greater_than"
  | "target_gap_less_than"
  | "variation_up_greater_than"
  | "variation_down_greater_than"
  | "consecutive_periods";

export type LocalAlertRule = {
  id: string;
  kpiId: string;
  name: string;
  isActive: boolean;
  ruleType: LocalAlertRuleType;
  severity: LocalAlertRuleSeverity;
  condition: string;
  thresholdValue?: number;
  comparisonOperator: LocalAlertComparisonOperator;
  consecutivePeriods?: number;
  variationPercent?: number;
  message: string;
  recommendedAction: string;
  createdAt: string;
  updatedAt: string;
  persisted: false;
};
