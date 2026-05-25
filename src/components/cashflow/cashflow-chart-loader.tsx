"use client";

import dynamic from "next/dynamic";
import type { CashflowForecastPoint } from "@/types/cashflow";

const CashflowForecastChart = dynamic(
  () =>
    import("@/components/cashflow/cashflow-forecast-chart").then(
      (mod) => mod.CashflowForecastChart
    ),
  {
    ssr: false,
    loading: () => <div className="h-96 rounded-lg border border-line bg-white shadow-soft" />
  }
);

export function CashflowChartLoader({ data }: { data: CashflowForecastPoint[] }) {
  return <CashflowForecastChart data={data} />;
}
