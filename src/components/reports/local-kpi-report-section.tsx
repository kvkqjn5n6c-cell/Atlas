"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalKpiWorkspace } from "@/hooks/use-local-kpi-workspace";
import { buildLocalActionPlanFromRecommendation } from "@/lib/action-plans/local-action-plan-builder";
import { generateExecutiveLocalSummary } from "@/lib/insights/local-insights-engine";
import { formatKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { formatVariation } from "@/lib/kpi-engine/local-kpi-trends";
import { saveLocalActionPlan } from "@/lib/local/local-action-plans-store";
import { recordActionPlanCreated } from "@/lib/journal/decision-journal-engine";
import { getAvailableApprovedMemoryKnowledge } from "@/lib/services/local-data/local-kpis-data.service";
import type { AtlasKnowledgeItem, AtlasKnowledgeType } from "@/types/atlas-memory-knowledge";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalInsightMemoryReference } from "@/types/local-insights";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation, RecommendationPriority } from "@/types/local-recommendations";
import type { ConfidenceLevel, RecommendationConfidence } from "@/types/recommendation-confidence";
import type { DecisionJournalEntry, DecisionJournalEntryType } from "@/types/decision-journal";

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

const feedbackRelevanceLabel: Record<LocalRecommendationFeedback["relevance"], string> = {
  relevant: "Pertinente",
  not_relevant: "Non pertinente",
  unknown: "Pertinence à confirmer"
};

const feedbackActionLabel: Record<LocalRecommendationFeedback["actionTaken"], string> = {
  yes: "Action suivie",
  no: "Action non suivie",
  planned: "Action prévue"
};

const feedbackImpactLabel: Record<LocalRecommendationFeedback["impactObserved"], string> = {
  positive: "Impact positif",
  neutral: "Impact neutre",
  negative: "Impact négatif",
  unknown: "Impact inconnu"
};

const confidenceLevelLabels: Record<ConfidenceLevel, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  very_high: "Très élevée"
};

function confidenceVariant(level: ConfidenceLevel) {
  if (level === "very_high" || level === "high") return "success";
  if (level === "medium") return "warning";
  return "danger";
}

const journalEntryTypeLabels: Record<DecisionJournalEntryType, string> = {
  recommendation_created: "Recommandation",
  action_plan_created: "Plan créé",
  action_plan_updated: "Plan mis à jour",
  impact_measured: "Impact mesuré",
  feedback_recorded: "Feedback",
  confidence_calculated: "Confiance",
  memory_knowledge_approved: "Mémoire validée",
  memory_knowledge_rejected: "Mémoire rejetée"
};

function formatJournalDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function impactForResult(result: LocalKpiResult) {
  if (result.status === "critical") return "À intégrer au rapport dirigeant comme point de risque prioritaire.";
  if (result.status === "watch") return "À suivre dans le prochain point de pilotage.";
  if (result.status === "healthy") return "Confirme une zone stable ou conforme.";
  return "Donnée à recalculer avant diffusion.";
}

function ReportSummaryColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <p key={`${title}-${index}-${item}`} className="rounded-md border border-line bg-white px-3 py-2 text-sm leading-5 text-slate-700">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function MemoryMobilizedBlock({
  usedReferences,
  availableKnowledge
}: {
  usedReferences: LocalInsightMemoryReference[];
  availableKnowledge: AtlasKnowledgeItem[];
}) {
  return (
    <div className="mb-5 rounded-md border border-brand-100 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">Mémoire Atlas mobilisée</Badge>
        <Badge>{usedReferences.length} mobilisée(s)</Badge>
        <Badge>{availableKnowledge.length} disponible(s)</Badge>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Séparation entre les connaissances validées qui influencent ce rapport et celles qui restent disponibles pour d&apos;autres lectures.
      </p>
      <div className="mt-4 space-y-5">
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Connaissances validées disponibles</p>
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
      </div>
    </div>
  );
}

function RecommendedActionPlan({
  recommendations,
  actionPlans,
  feedbackItems,
  confidenceItems
}: {
  recommendations: LocalRecommendation[];
  actionPlans: LocalActionPlan[];
  feedbackItems: LocalRecommendationFeedback[];
  confidenceItems: RecommendationConfidence[];
}) {
  const [createdRecommendationIds, setCreatedRecommendationIds] = useState<string[]>(() =>
    actionPlans.map((plan) => plan.sourceRecommendationId).filter((id): id is string => Boolean(id))
  );
  const [message, setMessage] = useState("");
  const knownRecommendationIds = new Set([
    ...actionPlans.map((plan) => plan.sourceRecommendationId).filter((id): id is string => Boolean(id)),
    ...createdRecommendationIds
  ]);

  function createPlan(recommendation: LocalRecommendation) {
    if (knownRecommendationIds.has(recommendation.id)) {
      setMessage("Un plan d'action local existe déjà pour cette recommandation.");
      return;
    }

    const plan = saveLocalActionPlan(buildLocalActionPlanFromRecommendation(recommendation));
    recordActionPlanCreated(plan);
    setCreatedRecommendationIds((current) => [...current, recommendation.id]);
    setMessage(`Plan d'action local créé : ${plan.title}`);
  }

  return (
    <div className="mb-5 rounded-md border border-brand-100 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">Plan d&apos;action recommandé</Badge>
        <Badge>{recommendations.length} recommandation(s)</Badge>
      </div>
      {message ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
      {recommendations.length === 0 ? (
        <p className="mt-4 rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
          Aucune recommandation déterministe prioritaire pour ce rapport.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {recommendations.slice(0, 5).map((recommendation) => (
            <article key={recommendation.id} className="rounded-md border border-line bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={recommendationPriorityVariant[recommendation.priority]}>{recommendation.priority}</Badge>
                <Badge>{recommendation.category}</Badge>
                <Badge>Effort {recommendation.effort}</Badge>
                {knownRecommendationIds.has(recommendation.id) ? <Badge variant="success">Plan créé</Badge> : null}
                {feedbackItems.some((feedback) => feedback.recommendationId === recommendation.id) ? <Badge variant="success">Feedback enregistré</Badge> : null}
              </div>
              {(() => {
                const confidence = confidenceItems.find((item) => item.recommendationId === recommendation.id);
                if (!confidence) return null;

                return (
                  <div className="mt-3 rounded-md border border-brand-100 bg-white p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="brand">Confiance Atlas : {confidence.score} %</Badge>
                      <Badge variant={confidenceVariant(confidence.level)}>{confidenceLevelLabels[confidence.level]}</Badge>
                    </div>
                    <div className="mt-2 space-y-1">
                      {confidence.factors.slice(0, 3).map((factor) => (
                        <p key={`${recommendation.id}-${factor.label}`} className="text-xs leading-5 text-slate-600">
                          {factor.value >= 0 ? "+" : "-"} {factor.label} : {factor.explanation}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <h3 className="mt-3 text-sm font-semibold text-ink">{recommendation.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.summary}</p>
              {recommendation.recommendedActions[0] ? (
                <p className="mt-2 text-sm font-medium text-ink">
                  Action : {recommendation.recommendedActions[0].label}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">Impact attendu : {recommendation.expectedImpact}</p>
              <Button
                className="mt-4"
                disabled={knownRecommendationIds.has(recommendation.id)}
                onClick={() => createPlan(recommendation)}
              >
                {knownRecommendationIds.has(recommendation.id) ? "Plan créé" : "Créer un plan d'action"}
              </Button>
              {recommendation.relatedMemoryReferences.length > 0 ? (
                <p className="mt-2 text-xs text-slate-500">
                  Mémoire liée : {recommendation.relatedMemoryReferences.slice(0, 2).join(" | ")}
                </p>
              ) : null}
              {feedbackItems.find((feedback) => feedback.recommendationId === recommendation.id) ? (
                <div className="mt-3 rounded-md border border-line bg-white p-3 text-xs text-slate-600">
                  {(() => {
                    const feedback = feedbackItems.find((item) => item.recommendationId === recommendation.id);
                    if (!feedback) return null;

                    return (
                      <>
                        <div className="flex flex-wrap gap-2">
                          <Badge>{feedbackRelevanceLabel[feedback.relevance]}</Badge>
                          <Badge>{feedbackActionLabel[feedback.actionTaken]}</Badge>
                          <Badge>{feedbackImpactLabel[feedback.impactObserved]}</Badge>
                        </div>
                        {feedback.comment ? <p className="mt-2 leading-5">{feedback.comment}</p> : null}
                      </>
                    );
                  })()}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionPlanEffectivenessReport({ impacts }: { impacts: LocalActionPlanImpact[] }) {
  return (
    <div className="mb-5 rounded-md border border-brand-100 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">Efficacité des plans d&apos;action</Badge>
        <Badge>{impacts.length} mesure(s)</Badge>
      </div>
      {impacts.length === 0 ? (
        <p className="mt-4 rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
          Aucun impact local mesuré pour ce rapport.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {impacts.slice(0, 6).map((impact) => (
            <article key={impact.id} className="rounded-md border border-line bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={impact.status === "positive" ? "success" : impact.status === "negative" ? "danger" : impact.status === "pending" ? "warning" : "default"}>
                  {impact.status === "positive" ? "Impact positif" : impact.status === "negative" ? "Impact négatif" : impact.status === "neutral" ? "Impact neutre" : impact.status === "pending" ? "En attente" : "Non mesurable"}
                </Badge>
                <Badge>KPI {impact.relatedKpiId}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{impact.interpretation}</p>
              <p className="mt-2 text-xs text-slate-500">
                Avant : {impact.beforeValue ?? "N/A"} - Après : {impact.afterValue ?? "N/A"} - Variation : {impact.variation === undefined ? "N/A" : `${impact.variation > 0 ? "+" : ""}${impact.variation.toFixed(1)}%`}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function DecisionHistoryReport({ entries }: { entries: DecisionJournalEntry[] }) {
  const visibleEntries = entries.slice(0, 6);

  return (
    <div className="mb-5 rounded-md border border-brand-100 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">Historique décisionnel récent</Badge>
        <Badge>{entries.length} événement(s)</Badge>
      </div>
      {visibleEntries.length === 0 ? (
        <p className="mt-4 rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
          Aucun événement décisionnel local à intégrer au rapport.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {visibleEntries.map((entry, index) => (
            <article key={`${entry.id}-${index}`} className="rounded-md border border-line bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{journalEntryTypeLabels[entry.type]}</Badge>
                {entry.priority ? <Badge>Priorité {entry.priority}</Badge> : null}
                {entry.status ? <Badge>{entry.status}</Badge> : null}
                {entry.confidenceScore !== undefined ? <Badge variant="brand">{entry.confidenceScore} %</Badge> : null}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">{entry.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{entry.description}</p>
              <p className="mt-2 text-xs text-slate-500">{formatJournalDate(entry.createdAt)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function LocalKpiReportSection() {
  const { data: workspace } = useLocalKpiWorkspace();
  const results = workspace.results.slice(0, 6);
  const insights = workspace.insights;
  const summary = workspace.executiveSummary;
  const ruleAlertCount = workspace.alerts.filter((alert) => alert.alertSource === "rule").length;
  const usedMemoryReferences = workspace.usedMemoryReferences;
  const availableMemoryKnowledge = getAvailableApprovedMemoryKnowledge(workspace.approvedMemoryKnowledge, usedMemoryReferences);
  const recommendations = workspace.recommendations;
  const actionPlans = workspace.actionPlans;
  const actionPlanImpacts = workspace.actionPlanImpacts;
  const recommendationFeedback = workspace.recommendationFeedback;
  const recommendationConfidence = workspace.recommendationConfidence;
  const decisionJournalEntries = workspace.decisionJournalEntries;

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI personnalisés récents</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Aucun KPI local n&apos;est encore disponible pour enrichir les rapports.
          </p>
        </CardHeader>
        <CardContent>
          <MemoryMobilizedBlock usedReferences={usedMemoryReferences} availableKnowledge={availableMemoryKnowledge} />
          <DecisionHistoryReport entries={decisionJournalEntries} />
        </CardContent>
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
        {summary ? (
          <div className="mb-5 rounded-md border border-brand-100 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Synthèse dirigeant générée par Atlas</Badge>
              <Badge>Déterministe</Badge>
            </div>
            <p className="mt-3 text-base font-semibold leading-7 text-ink">{summary.globalSituation}</p>
            <p className="mt-1 text-xs text-slate-500">
              Pourquoi Atlas le signale : synthèse construite à partir de {summary.relatedKpiIds.length} KPI, {summary.relatedAlertIds.length} alerte(s), règles locales, tendances et fiabilité disponible.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <ReportSummaryColumn title="Risques" items={summary.mainRisks} />
              <ReportSummaryColumn title="Constats" items={summary.keyFindings} />
              <ReportSummaryColumn title="Actions" items={summary.recommendedActions} />
              <ReportSummaryColumn title="Limites de fiabilité" items={summary.dataReliabilityNotes} />
              {summary.memoryHighlights.length > 0 ? (
                <ReportSummaryColumn title="Mémoire Atlas" items={summary.memoryHighlights} />
              ) : null}
            </div>
          </div>
        ) : null}

        <RecommendedActionPlan
          recommendations={recommendations}
          actionPlans={actionPlans}
          feedbackItems={recommendationFeedback}
          confidenceItems={recommendationConfidence}
        />

        <ActionPlanEffectivenessReport impacts={actionPlanImpacts} />

        <DecisionHistoryReport entries={decisionJournalEntries} />

        <MemoryMobilizedBlock usedReferences={usedMemoryReferences} availableKnowledge={availableMemoryKnowledge} />

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
                  {insight.memorySources?.length ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Source mémoire : {insight.memorySources.join(", ")}. Connaissance : {insight.memoryKnowledgeLabels?.join(", ") ?? "validée"}.
                    </p>
                  ) : null}
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
