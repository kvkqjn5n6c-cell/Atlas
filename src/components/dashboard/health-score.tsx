import { Activity, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getHealthState, getStateClasses } from "@/lib/business/dashboard";
import type { BusinessHealthScore } from "@/types/dashboard";

const statusLabels = {
  excellent: "excellent",
  stable: "stable",
  attention: "attention",
  critique: "critique"
};

const driverLabels = {
  cash: "cash",
  overduePayments: "retards",
  growth: "croissance",
  criticalAlerts: "alertes",
  margin: "marge"
};

export function HealthScore({ score }: { score: BusinessHealthScore }) {
  const state = getHealthState(score.status);

  return (
    <Card className="bg-ink text-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Sante globale
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-semibold">{score.value}</span>
              <span className="pb-1 text-sm text-slate-300">/100</span>
            </div>
          </div>
          <Badge className={getStateClasses(state)}>{statusLabels[score.status]}</Badge>
        </div>

        <Progress
          value={score.value}
          className="mt-5 bg-white/15"
          indicatorClassName="bg-brand-500"
        />

        <div className="mt-4 grid grid-cols-5 gap-2 text-xs text-slate-300">
          {Object.entries(score.drivers).map(([key, value]) => (
            <div key={key} className="min-w-0">
              <div className="mb-1 flex items-center gap-1">
                <Activity className="h-3 w-3" aria-hidden="true" />
                <span className="truncate">{driverLabels[key as keyof typeof driverLabels]}</span>
              </div>
              <span className="font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
