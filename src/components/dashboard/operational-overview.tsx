import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStateClasses } from "@/lib/business/dashboard";
import { cn } from "@/lib/utils";
import type { OperationalMetric } from "@/types/dashboard";

function metricProgress(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 50;
}

export function OperationalOverview({ metrics }: { metrics: OperationalMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilotage opérationnel</CardTitle>
        <p className="mt-1 text-sm text-slate-500">Les signaux terrain à surveiller cette semaine.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{metric.value}</p>
                </div>
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full border",
                    getStateClasses(metric.state)
                  )}
                />
              </div>
              <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">{metric.detail}</p>
              <Progress value={metricProgress(metric.value)} className="mt-4" />
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
