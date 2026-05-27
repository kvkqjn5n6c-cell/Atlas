"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateExecutiveLocalSummary, generateLocalKpiInsights } from "@/lib/insights/local-insights-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { formatKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { formatVariation } from "@/lib/kpi-engine/local-kpi-trends";
import { getLocalAlertRules } from "@/lib/local/local-alert-rules-store";
import { getLocalKpiHistory } from "@/lib/local/local-kpi-history-store";
import { getLocalKpiResults } from "@/lib/local/local-kpi-results-store";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalInsight } from "@/types/local-insights";

const statusVariant = {
  healthy: "success",
  watch: "warning",
  critical: "danger",
  "not-tested": "default"
} as const;

const statusLabels = {
  healthy: "Conforme",
  watch: "À surveiller",
  critical: "Critique",
  "not-tested": "Non testé"
} as const;

function impactForResult(result: LocalKpiResult) {
  if (result.status === "critical") return "À intégrer au rapport dirigeant comme point de risque prioritaire.";
  if (result.status === "watch") return "À suivre dans le prochain point de pilotage.";
  if (result.status === "healthy") return "Confirme une zone stable ou conforme.";
  return "Donnée à recalculer avant diffusion.";
}

export function LocalKpiReportSection() {
  const [results, setResults] = useState<LocalKpiResult[]>([]);
  const [ruleAlertCount, setRuleAlertCount] = useState(0);
  const [insights, setInsights] = useState<LocalInsight[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const localResults = getLocalKpiResults();
      const localHistory = getLocalKpiHistory();
      const localRules = getLocalAlertRules();
      const localAlerts = generateLocalKpiAlerts(localResults, localHistory, localRules);
      setResults(localResults.slice(0, 6));
      setRuleAlertCount(
        localAlerts.filter((alert) => alert.alertSource === "rule").length
      );
      setInsights(generateLocalKpiInsights(localResults, localHistory, localAlerts, localRules));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI personnalisés récents</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Aucun KPI local n&apos;est encore disponible pour enrichir les rapports.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>KPI personnalisés récents</CardTitle>
          <Badge variant="brand">Données importées</Badge>
          <Badge>Non persisté</Badge>
          {ruleAlertCount > 0 ? <Badge variant="warning">{ruleAlertCount} règle(s) personnalisée(s) déclenchée(s)</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 rounded-md border border-brand-100 bg-brand-50 p-4">
          <Badge variant="brand">Analyse déterministe des KPI personnalisés</Badge>
          <p className="mt-3 text-sm font-medium text-ink">{generateExecutiveLocalSummary(insights)}</p>
          {insights.length > 0 ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {insights.slice(0, 6).map((insight) => (
                <article key={insight.id} className="rounded-md bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{insight.title}</p>
                    <Badge variant={insight.severity === "critical" ? "danger" : insight.severity === "watch" ? "warning" : "default"}>
                      {insight.severity === "critical" ? "Critique" : insight.severity === "watch" ? "À surveiller" : "Info"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{insight.summary}</p>
                  <p className="mt-2 text-xs font-medium text-ink">{insight.recommendedAction}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="min-w-[900px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">KPI</th>
                <th className="px-4 py-3 font-medium">Résultat</th>
                <th className="px-4 py-3 font-medium">Tendance</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Sens</th>
                <th className="px-4 py-3 font-medium">Impact potentiel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {results.map((result) => (
                <tr key={result.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-ink">{result.name}</td>
                  <td className="px-4 py-3 text-slate-600">{result.value}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {result.trend === "up" ? "▲" : result.trend === "down" ? "▼" : "→"} {formatVariation(result.variation)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[result.status]}>{statusLabels[result.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{result.sourceFileName}</td>
                  <td className="px-4 py-3 text-slate-600">{formatKpiDirection(result.direction)}</td>
                  <td className="px-4 py-3 font-medium text-ink">{impactForResult(result)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
