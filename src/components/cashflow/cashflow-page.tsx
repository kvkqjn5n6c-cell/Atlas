"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { CashflowChartLoader } from "@/components/cashflow/cashflow-chart-loader";
import { CashflowFilters } from "@/components/cashflow/cashflow-filters";
import { CashflowMovementsTable } from "@/components/cashflow/cashflow-movements-table";
import { CashflowRecommendations } from "@/components/cashflow/cashflow-recommendations";
import { CashflowStatsCards } from "@/components/cashflow/cashflow-stats-cards";
import { Badge } from "@/components/ui/badge";
import {
  applyCashflowFilters,
  calculateCashflowSummary,
  filterForecastByPeriod,
  sortCashflowMovementsByPriority
} from "@/lib/business/cashflow";
import {
  cashflowCriticalThreshold,
  cashflowForecastMock,
  cashflowMovementsMock,
  cashflowRecommendationsMock,
  currentCashBalance
} from "@/lib/mock/cashflow";
import type { CashflowFiltersState } from "@/types/cashflow";

const initialFilters: CashflowFiltersState = {
  period: 30,
  movementType: "all",
  riskOnly: false
};

export function CashflowPage() {
  const [filters, setFilters] = useState<CashflowFiltersState>(initialFilters);

  const visibleForecast = useMemo(
    () => filterForecastByPeriod(cashflowForecastMock, filters.period),
    [filters.period]
  );

  const visibleMovements = useMemo(() => {
    return sortCashflowMovementsByPriority(
      applyCashflowFilters(cashflowMovementsMock, filters)
    );
  }, [filters]);

  const summary = useMemo(
    () =>
      calculateCashflowSummary(
        currentCashBalance,
        cashflowForecastMock,
        cashflowMovementsMock,
        cashflowCriticalThreshold
      ),
    []
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Trésorerie V1</Badge>
              <Badge>
                <TrendingUp className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Prévision et décision
              </Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Trésorerie</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Comprendre combien de cash restera dans 30, 60 et 90 jours, identifier le point bas
              et prioriser les actions qui réduisent le risque de tension.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour dashboard
          </Link>
        </div>
      </section>

      <CashflowStatsCards summary={summary} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <CashflowChartLoader data={visibleForecast} />
        <CashflowRecommendations recommendations={cashflowRecommendationsMock} />
      </section>

      <CashflowFilters filters={filters} onChange={setFilters} />
      <CashflowMovementsTable movements={visibleMovements} />
    </div>
  );
}
