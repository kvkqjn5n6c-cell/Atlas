"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { calculateScoreWithLocalKpis } from "@/lib/kpi-engine/local-kpi-results";
import { formatVariation } from "@/lib/kpi-engine/local-kpi-trends";
import { getLocalAlertRules } from "@/lib/local/local-alert-rules-store";
import { getLocalKpiHistory, getLocalKpiHistoryByKpiId } from "@/lib/local/local-kpi-history-store";
import { getLocalKpiResults } from "@/lib/local/local-kpi-results-store";
import type { LocalKpiResult } from "@/types/local-kpi-results";

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

const calculationLabels: Record<LocalKpiResult["calculationType"], string> = {
  sum: "Somme",
  average: "Moyenne",
  count: "Comptage",
  "distinct-count": "Comptage unique",
  rate: "Taux",
  ratio: "Ratio",
  "period-change": "Évolution période"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function TrendIcon({ trend }: { trend?: LocalKpiResult["trend"] }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : ArrowRight;
  return <Icon className="h-4 w-4" aria-hidden="true" />;
}

export function LocalKpiPilotageSection({ baseScore }: { baseScore: number }) {
  const [results, setResults] = useState<LocalKpiResult[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setResults(getLocalKpiResults()), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI personnalisés</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Aucun KPI local n&apos;alimente encore le cockpit. Créez un KPI depuis Imports & mappings pour l&apos;exploiter ici.
          </p>
        </CardHeader>
      </Card>
    );
  }

  const adjustedScore = calculateScoreWithLocalKpis(baseScore, results);
  const criticalCount = results.filter((result) => result.status === "critical").length;
  const watchCount = results.filter((result) => result.status === "watch").length;
  const ruleAlertCount = generateLocalKpiAlerts(results, getLocalKpiHistory(), getLocalAlertRules())
    .filter((alert) => alert.alertSource === "rule").length;

  return (
    <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="border-brand-100">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">Données importées</Badge>
            <Badge>{results.length} KPI personnalisés pris en compte</Badge>
          </div>
          <p className="mt-4 text-sm text-slate-500">Score Atlas ajusté localement</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-semibold text-ink">{adjustedScore}</span>
            <span className="pb-1 text-sm text-slate-500">/100</span>
          </div>
          <Progress value={adjustedScore} className="mt-5" />
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Calcul déterministe : un KPI conforme ajoute un léger bonus, un KPI à surveiller ou critique dégrade le score.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant={criticalCount > 0 ? "danger" : "default"}>{criticalCount} critiques</Badge>
            <Badge variant={watchCount > 0 ? "warning" : "default"}>{watchCount} à surveiller</Badge>
            {ruleAlertCount > 0 ? <Badge variant="warning">{ruleAlertCount} règle(s) déclenchée(s)</Badge> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPI personnalisés</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Résultats issus des imports CSV locaux. Ils complètent les KPI historiques sans les remplacer.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-2">
            {results.map((result) => {
              const history = getLocalKpiHistoryByKpiId(result.kpiId);

              return (
                <article key={result.id} className="rounded-md border border-line bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-ink">{result.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{calculationLabels[result.calculationType]} - {result.sourceFileName}</p>
                    </div>
                    <Badge variant={statusVariant[result.status]}>{statusLabels[result.status]}</Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-2xl font-semibold text-ink">{result.value}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <TrendIcon trend={result.trend} />
                      {formatVariation(result.variation)}
                    </div>
                  </div>
                  {history.length > 1 ? (
                    <div className="mt-3 flex h-8 items-end gap-1">
                      {history.slice(0, 8).reverse().map((point) => {
                        const maxValue = Math.max(...history.slice(0, 8).map((item) => Math.abs(item.value)), 1);
                        return (
                          <span
                            key={point.id}
                            className="flex-1 rounded-t bg-brand-200"
                            style={{ height: `${Math.max(20, (Math.abs(point.value) / maxValue) * 100)}%` }}
                          />
                        );
                      })}
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                  {result.displayFieldLabel ? <Badge>Champ personnalisé</Badge> : null}
                  <Badge>{formatKpiDirection(result.direction)}</Badge>
                  <Badge>Local</Badge>
                    <Badge>Non persisté</Badge>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Calculé le {formatDate(result.calculatedAt)}</p>
                </article>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
