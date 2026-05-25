"use client";

import dynamic from "next/dynamic";
import type { CashflowPoint } from "@/types/business";

const CashflowChart = dynamic(
  () => import("@/components/dashboard/cashflow-chart").then((mod) => mod.CashflowChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="mb-5">
          <div className="h-5 w-56 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-64 rounded bg-slate-100" />
        </div>
        <div className="h-56 rounded-md bg-slate-50" />
      </div>
    )
  }
);

export function CashflowChartLoader({ data }: { data: CashflowPoint[] }) {
  return <CashflowChart data={data} />;
}
