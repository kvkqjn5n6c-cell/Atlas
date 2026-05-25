"use client";

import dynamic from "next/dynamic";
import type { CashflowForecastPoint, RevenuePoint } from "@/types/dashboard";

const CashflowForecastChart = dynamic(
  () => import("@/components/dashboard/cockpit-charts").then((mod) => mod.CashflowForecastChart),
  {
    ssr: false,
    loading: () => <div className="h-96 rounded-lg border border-line bg-white shadow-soft" />
  }
);

const RevenueChart = dynamic(
  () => import("@/components/dashboard/cockpit-charts").then((mod) => mod.RevenueChart),
  {
    ssr: false,
    loading: () => <div className="h-96 rounded-lg border border-line bg-white shadow-soft" />
  }
);

export function CockpitChartsLoader({
  cashflow,
  revenue
}: {
  cashflow: CashflowForecastPoint[];
  revenue: RevenuePoint[];
}) {
  return (
    <>
      <CashflowForecastChart data={cashflow} />
      <RevenueChart data={revenue} />
    </>
  );
}
