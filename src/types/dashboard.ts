export type DashboardTrend = "up" | "down" | "stable";

export type DashboardState = "good" | "neutral" | "warning" | "critical";

export type BusinessHealthStatus = "excellent" | "stable" | "attention" | "critique";

export type DashboardKpiCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  evolution: number;
  trend: DashboardTrend;
  state: DashboardState;
};

export type DashboardAlert = {
  id: string;
  title: string;
  severity: "warning" | "critical";
  impact: string;
  suggestedAction: string;
};

export type DashboardAction = {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  context: string;
};

export type CashflowForecastPoint = {
  period: string;
  projectedCash: number;
  criticalThreshold: number;
};

export type RevenuePoint = {
  period: string;
  signed: number;
  invoiced: number;
  collected: number;
};

export type OperationalMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  state: DashboardState;
};

export type ExecutiveSummaryItem = {
  id: string;
  title: string;
  content: string;
  state: DashboardState;
};

export type BusinessHealthScore = {
  value: number;
  status: BusinessHealthStatus;
  drivers: {
    cash: number;
    overduePayments: number;
    growth: number;
    criticalAlerts: number;
    margin: number;
  };
};

export type ExecutiveDashboardMock = {
  organizationName: string;
  periodLabel: string;
  healthScore: BusinessHealthScore;
  kpis: DashboardKpiCard[];
  alerts: DashboardAlert[];
  actions: DashboardAction[];
  cashflow: CashflowForecastPoint[];
  revenue: RevenuePoint[];
  operations: OperationalMetric[];
  summary: ExecutiveSummaryItem[];
};
