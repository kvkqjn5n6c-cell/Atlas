import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStateClasses, getTrendLabel } from "@/lib/business/dashboard";
import type { DashboardKpiCard } from "@/types/dashboard";

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  stable: ArrowRight
};

export function ExecutiveKpiCard({ kpi }: { kpi: DashboardKpiCard }) {
  const Icon = trendIcons[kpi.trend];

  return (
    <Card className="min-h-40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-ink">{kpi.value}</p>
          </div>
          <Badge className={getStateClasses(kpi.state)}>
            <Icon className="mr-1 h-3 w-3" aria-hidden="true" />
            {getTrendLabel(kpi.trend, kpi.evolution)}
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-5 text-slate-500">{kpi.detail}</p>
      </CardContent>
    </Card>
  );
}
