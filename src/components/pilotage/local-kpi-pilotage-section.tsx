"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocalKpiWorkspace } from "@/hooks/use-local-kpi-workspace";
import { formatKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { calculateScoreWithLocalKpis } from "@/lib/kpi-engine/local-kpi-results";
import { formatVariation } from "@/lib/kpi-engine/local-kpi-trends";
import { getAvailableApprovedMemoryKnowledge } from "@/lib/services/local-data/local-kpis-data.service";
import type { AtlasKnowledgeItem, AtlasKnowledgeType } from "@/types/atlas-memory-knowledge";
import type { LocalInsightMemoryReference } from "@/types/local-insights";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalRecommendation, RecommendationPriority } from "@/types/local-recommendations";

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

const insightVariant = {
  info: "default",
  watch: "warning",
  critical: "danger"
} as const;

const insightLabels = {
  info: "Information",
  watch: "À surveiller",
  critical: "Critique"
} as const;

const knowledgeTypeLabels: Record<AtlasKnowledgeType, string> = {
  objective: "Objectif validé",
  business_rule: "Règle métier validée",
  decision: "Décision historique validée",
  glossary: "Glossaire validé"
};

const recommendationPriorityVariant: Record<RecommendationPriority, "default" | "warning" | "danger"> = {
  low: "default",
  medium: "default",
  high: "warning",
  critical: "danger"
};

const recommendationPriorityLabels: Record<RecommendationPriority, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  critical: "Critique"
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

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-md border border-line bg-white px-3 py-2 text-sm leading-5 text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MemoryReferencesCard({
  usedReferences,
  availableKnowledge
}: {
  usedReferences: LocalInsightMemoryReference[];
  availableKnowledge: AtlasKnowledgeItem[];
}) {
  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Références mémoire utilisées</CardTitle>
          <Badge variant="brand">Atlas Memory</Badge>
          <Badge>{usedReferences.length} mobilisée(s)</Badge>
          <Badge>{availableKnowledge.length} disponible(s)</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Séparation entre les connaissances validées qui influencent l&apos;analyse courante et celles qui restent disponibles pour d&apos;autres lectures.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Connaissances mobilisées dans l&apos;analyse</p>
          {usedReferences.length === 0 ? (
            <p className="mt-2 rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune connaissance validée n&apos;est utilisée pour cette analyse.
            </p>
          ) : (
            <div className="mt-2 grid gap-3 lg:grid-cols-2">
              {usedReferences.map((reference) => (
                <article
                  key={`${reference.sourceDocument}-${reference.knowledgeType}-${reference.value}`}
                  className="rounded-md border border-line bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{reference.sourceDocument}</Badge>
                    <Badge variant="success">{reference.status}</Badge>
                    <Badge>{reference.knowledgeType}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{reference.value}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Autres connaissances validées disponibles</p>
          {availableKnowledge.length === 0 ? (
            <p className="mt-2 rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune autre connaissance validée disponible pour cette analyse.
            </p>
          ) : (
            <div className="mt-2 grid gap-3 lg:grid-cols-2">
              {availableKnowledge.map((item) => (
              <article
                key={item.id}
                className="rounded-md border border-line bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{item.sourceDocument}</Badge>
                  <Badge variant="success">Validée</Badge>
                  <Badge>{knowledgeTypeLabels[item.type]}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.value}</p>
              </article>
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function RecommendationsSection({ recommendations }: { recommendations: LocalRecommendation[] }) {
  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Recommandations Atlas</CardTitle>
          <Badge variant="brand">Déterministe</Badge>
          <Badge>{recommendations.length} action(s)</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Actions priorisées à partir des KPI, alertes, règles, insights et connaissances mémoire validées.
        </p>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Aucune recommandation prioritaire pour l&apos;instant. Les KPI locaux restent insuffisants ou conformes.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {recommendations.slice(0, 5).map((recommendation) => (
              <article key={recommendation.id} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={recommendationPriorityVariant[recommendation.priority]}>
                    Priorité {recommendationPriorityLabels[recommendation.priority]}
                  </Badge>
                  <Badge>{recommendation.category}</Badge>
                  <Badge>Effort {recommendation.effort}</Badge>
                  <Badge>Urgence {recommendation.urgency}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-ink">{recommendation.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.summary}</p>
                <p className="mt-3 text-sm font-medium text-ink">Impact attendu : {recommendation.expectedImpact}</p>
                {recommendation.recommendedActions[0] ? (
                  <div className="mt-3 rounded-md bg-white p-3">
                    <p className="text-sm font-semibold text-ink">{recommendation.recommendedActions[0].label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{recommendation.recommendedActions[0].description}</p>
                  </div>
                ) : null}
                {recommendation.evidence[0] ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Preuve : {recommendation.evidence[0].label} - {recommendation.evidence[0].value}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LocalKpiPilotageSection({ baseScore }: { baseScore: number }) {
  const [mounted, setMounted] = useState(false);
  const { data: workspace } = useLocalKpiWorkspace();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI personnalisés</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Chargement des données locales du cockpit.
          </p>
        </CardHeader>
      </Card>
    );
  }

  const results = workspace.results;
  const insights = workspace.insights;
  const summary = workspace.executiveSummary;
  const usedMemoryReferences = workspace.usedMemoryReferences;
  const availableMemoryKnowledge = getAvailableApprovedMemoryKnowledge(workspace.approvedMemoryKnowledge, usedMemoryReferences);
  const recommendations = workspace.recommendations;

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>KPI personnalisés</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Aucun KPI local n&apos;alimente encore le cockpit. Créez un KPI depuis Imports & mappings pour l&apos;exploiter ici.
            </p>
          </CardHeader>
        </Card>
        <MemoryReferencesCard usedReferences={usedMemoryReferences} availableKnowledge={availableMemoryKnowledge} />
      </div>
    );
  }

  const adjustedScore = calculateScoreWithLocalKpis(baseScore, results);
  const criticalCount = results.filter((result) => result.status === "critical").length;
  const watchCount = results.filter((result) => result.status === "watch").length;
  const ruleAlertCount = workspace.alerts.filter((alert) => alert.alertSource === "rule").length;

  return (
    <div className="space-y-6">
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
                const history = workspace.historyByKpiId[result.kpiId] ?? [];

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

      {summary ? (
        <Card className="border-brand-100">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Synthèse dirigeant locale</CardTitle>
              <Badge variant="brand">Générée par Atlas</Badge>
              <Badge>Non persistée</Badge>
            </div>
            <p className="mt-2 text-base font-medium leading-7 text-ink">{summary.globalSituation}</p>
            <p className="text-xs text-slate-500">
              Éléments utilisés : {summary.relatedKpiIds.length} KPI, {summary.relatedAlertIds.length} alerte(s), tendances et règles locales.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <SummaryList title="Risques prioritaires" items={summary.mainRisks} />
            <SummaryList title="Actions recommandées" items={summary.recommendedActions} />
            <SummaryList title="Fiabilité des données" items={summary.dataReliabilityNotes} />
            {summary.memoryHighlights.length > 0 ? (
              <SummaryList title="Mémoire Atlas" items={summary.memoryHighlights} />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <RecommendationsSection recommendations={recommendations} />

      <MemoryReferencesCard usedReferences={usedMemoryReferences} availableKnowledge={availableMemoryKnowledge} />

      <Card className="border-brand-100">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Lecture Atlas des KPI personnalisés</CardTitle>
            <Badge variant="brand">Déterministe</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Analyse locale basée sur les valeurs, seuils, tendances, règles d&apos;alerte et historique disponible.
          </p>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucun insight local prioritaire pour l&apos;instant. Recalculez un KPI ou ajoutez une règle d&apos;alerte pour enrichir la lecture.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {insights.slice(0, 5).map((insight) => (
                <article key={insight.id} className="rounded-md border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{insight.title}</h3>
                    <Badge variant={insightVariant[insight.severity]}>{insightLabels[insight.severity]}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{insight.summary}</p>
                  {insight.evidence[0] ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Preuve : {insight.evidence[0].kpiName} = {insight.evidence[0].value}
                      {insight.evidence[0].variation !== undefined ? ` (${formatVariation(insight.evidence[0].variation)})` : ""}
                    </p>
                  ) : null}
                  {insight.memorySources?.length ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Source mémoire : {insight.memorySources.join(", ")}. Connaissance : {insight.memoryKnowledgeLabels?.join(", ") ?? "validée"}.
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm font-medium text-ink">{insight.recommendedAction}</p>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
