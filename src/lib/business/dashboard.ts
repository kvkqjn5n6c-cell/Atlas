import type {
  BusinessHealthScore,
  BusinessHealthStatus,
  DashboardState,
  DashboardTrend
} from "@/types/dashboard";

export function getHealthStatus(score: number): BusinessHealthStatus {
  if (score >= 85) {
    return "excellent";
  }

  if (score >= 65) {
    return "stable";
  }

  if (score >= 45) {
    return "attention";
  }

  return "critique";
}

export function calculateDashboardHealthScore(drivers: BusinessHealthScore["drivers"]) {
  const weightedScore =
    drivers.cash * 0.28 +
    drivers.overduePayments * 0.24 +
    drivers.growth * 0.18 +
    drivers.criticalAlerts * 0.16 +
    drivers.margin * 0.14;

  return Math.round(Math.max(0, Math.min(100, weightedScore)));
}

export function getStateClasses(state: DashboardState) {
  const classes = {
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    critical: "border-rose-200 bg-rose-50 text-rose-700"
  };

  return classes[state];
}

export function getTrendLabel(trend: DashboardTrend, evolution: number) {
  if (trend === "stable") {
    return "stable";
  }

  const sign = evolution > 0 ? "+" : "";
  return `${sign}${evolution}%`;
}

export function getHealthState(status: BusinessHealthStatus): DashboardState {
  const states = {
    excellent: "good",
    stable: "neutral",
    attention: "warning",
    critique: "critical"
  } satisfies Record<BusinessHealthStatus, DashboardState>;

  return states[status];
}
