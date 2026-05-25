import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAlert } from "@/types/dashboard";

export function CriticalAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Alertes critiques</CardTitle>
          <Badge variant="danger">
            {criticalCount} {criticalCount > 1 ? "critiques" : "critique"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-white p-2 text-rose-600">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">{alert.title}</h3>
                  <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>
                    {alert.severity === "critical" ? "critique" : "attention"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-600">{alert.impact}</p>
                <p className="mt-3 text-sm font-medium text-ink">{alert.suggestedAction}</p>
              </div>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
