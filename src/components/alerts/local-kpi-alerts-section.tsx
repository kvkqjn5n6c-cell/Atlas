"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateLocalKpiAlerts, type LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import { getLocalKpiResults } from "@/lib/local/local-kpi-results-store";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function LocalKpiAlertsSection() {
  const [alerts, setAlerts] = useState<LocalKpiAlert[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setAlerts(generateLocalKpiAlerts(getLocalKpiResults())), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertes locales KPI personnalisés</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Aucun KPI personnalisé local ne déclenche d&apos;alerte pour l&apos;instant.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Alertes locales KPI personnalisés</CardTitle>
          <Badge variant="brand">Alerte locale</Badge>
          <Badge>KPI personnalisé</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-2">
          {alerts.map((alert) => (
            <article key={alert.id} className="rounded-md border border-line bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-ink">{alert.title}</h3>
                <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>
                  {alert.severity === "critical" ? "Critique" : "À surveiller"}
                </Badge>
                <Badge>Local</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">Cause probable : {alert.cause}</p>
              <p className="mt-2 text-sm font-medium text-slate-700">Impact : {alert.businessImpact}</p>
              <p className="mt-3 text-sm font-semibold text-ink">{alert.recommendedAction}</p>
              <p className="mt-3 text-xs text-slate-500">
                Source : {alert.sourceFileName} - calculé le {formatDate(alert.calculatedAt)}
              </p>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
