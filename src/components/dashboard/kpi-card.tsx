import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { DashboardKpi } from "@/types/business";

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  stable: ArrowRight
};

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const Icon = trendIcon[kpi.trend];

  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{kpi.value}</p>
        </div>
        <div className="rounded-md bg-slate-100 p-2 text-slate-600">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{kpi.helper}</p>
    </div>
  );
}
