import type {
  CashflowFiltersState,
  CashflowForecastPoint,
  CashflowMovement,
  CashflowRiskLevel,
  CashflowSummary
} from "@/types/cashflow";

const riskPriority: Record<CashflowRiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

export function calculateCashflowSummary(
  currentBalance: number,
  forecast: CashflowForecastPoint[],
  movements: CashflowMovement[],
  criticalThreshold: number
): CashflowSummary {
  const balance30 = getBalanceAtHorizon(forecast, 30);
  const balance60 = getBalanceAtHorizon(forecast, 60);
  const balance90 = getBalanceAtHorizon(forecast, 90);
  const lowestPoint = forecast.reduce((lowest, point) =>
    point.projectedBalance < lowest.projectedBalance ? point : lowest
  );
  const tensionPoint = forecast.find((point) => point.projectedBalance < criticalThreshold);
  const expectedInflows = movements
    .filter((movement) => movement.type === "inflow")
    .reduce((total, movement) => total + movement.amount, 0);
  const expectedOutflows = movements
    .filter((movement) => movement.type === "outflow")
    .reduce((total, movement) => total + movement.amount, 0);

  return {
    currentBalance,
    expectedInflows,
    expectedOutflows,
    balance30,
    balance60,
    balance90,
    lowestBalance: lowestPoint.projectedBalance,
    tensionDate: tensionPoint?.period ?? null,
    riskLevel: getCashflowRiskLevel(lowestPoint.projectedBalance, criticalThreshold)
  };
}

export function applyCashflowFilters(
  movements: CashflowMovement[],
  filters: CashflowFiltersState
) {
  return movements.filter((movement) => {
    const matchesPeriod = movement.day <= filters.period;
    const matchesType = filters.movementType === "all" || movement.type === filters.movementType;
    const matchesRisk =
      !filters.riskOnly || movement.riskLevel === "high" || movement.riskLevel === "critical";

    return matchesPeriod && matchesType && matchesRisk;
  });
}

export function filterForecastByPeriod(
  forecast: CashflowForecastPoint[],
  period: CashflowFiltersState["period"]
) {
  return forecast.filter((point) => point.day <= period);
}

export function sortCashflowMovementsByPriority(movements: CashflowMovement[]) {
  return [...movements].sort((a, b) => {
    const riskDelta = riskPriority[b.riskLevel] - riskPriority[a.riskLevel];

    if (riskDelta !== 0) {
      return riskDelta;
    }

    return a.day - b.day;
  });
}

function getBalanceAtHorizon(forecast: CashflowForecastPoint[], horizon: number) {
  const exactPoint = forecast.find((point) => point.day === horizon);

  if (exactPoint) {
    return exactPoint.projectedBalance;
  }

  const previousPoints = forecast.filter((point) => point.day <= horizon);
  return previousPoints[previousPoints.length - 1]?.projectedBalance ?? 0;
}

function getCashflowRiskLevel(balance: number, criticalThreshold: number): CashflowRiskLevel {
  if (balance < criticalThreshold) {
    return "critical";
  }

  if (balance < criticalThreshold * 1.25) {
    return "high";
  }

  if (balance < criticalThreshold * 1.75) {
    return "medium";
  }

  return "low";
}
