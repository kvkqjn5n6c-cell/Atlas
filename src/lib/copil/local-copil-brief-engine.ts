import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { AtlasContextPack } from "@/types/atlas-context-pack";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalCopilBrief, LocalCopilSection } from "@/types/local-copil";
import type { LocalExecutiveSummary } from "@/types/local-executive-summary";
import type { LocalInsight, LocalInsightMemoryReference } from "@/types/local-insights";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalPriorityItem } from "@/types/local-priorities";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";
import type { RecommendationConfidence } from "@/types/recommendation-confidence";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";

type LocalCopilBriefInput = {
  organizationId: string;
  periodLabel: string;
  kpiResults?: LocalKpiResult[];
  alerts?: LocalKpiAlert[];
  insights?: LocalInsight[];
  executiveSummary?: LocalExecutiveSummary;
  recommendations?: LocalRecommendation[];
  actionPlans?: LocalActionPlan[];
  impacts?: LocalActionPlanImpact[];
  feedbackItems?: LocalRecommendationFeedback[];
  confidenceScores?: RecommendationConfidence[];
  priorities?: LocalPriorityItem[];
  memoryReferences?: LocalInsightMemoryReference[];
  decisionJournalEntries?: DecisionJournalEntry[];
  copilContextPack?: AtlasContextPack;
  datasetGroupByInsights?: DatasetGroupByInsight[];
};

function now() {
  return new Date().toISOString();
}

function limit(items: string[], count: number) {
  return items.filter(Boolean).slice(0, count);
}

function statusLabel(status: LocalKpiResult["status"]) {
  if (status === "critical") return "critique";
  if (status === "watch") return "à surveiller";
  if (status === "healthy") return "conforme";
  return "non testé";
}

function impactStatusLabel(status: LocalActionPlanImpact["status"]) {
  if (status === "positive") return "impact positif";
  if (status === "negative") return "impact négatif";
  if (status === "neutral") return "impact neutre";
  if (status === "pending") return "impact en attente";
  return "impact non mesurable";
}

function journalLabel(entry: DecisionJournalEntry) {
  return `${entry.title} (${new Date(entry.createdAt).toLocaleDateString("fr-FR")})`;
}

export function generateCopilRiskSummary(input: {
  alerts?: LocalKpiAlert[];
  insights?: LocalInsight[];
  executiveSummary?: LocalExecutiveSummary;
  datasetGroupByInsights?: DatasetGroupByInsight[];
}) {
  const alertRisks = (input.alerts ?? [])
    .filter((alert) => alert.severity === "critical")
    .map((alert) => `${alert.title} : ${alert.businessImpact}`);
  const insightRisks = (input.insights ?? [])
    .filter((insight) => insight.severity === "critical")
    .map((insight) => insight.summary);
  const summaryRisks = input.executiveSummary?.mainRisks ?? [];
  const comparativeRisks = (input.datasetGroupByInsights ?? [])
    .filter((insight) => insight.severity === "critical" || insight.severity === "watch")
    .map((insight) => `${insight.title} (${insight.groupValue}) : ${insight.summary}`);

  return limit([...alertRisks, ...comparativeRisks, ...insightRisks, ...summaryRisks], 6);
}

export function generateCopilArbitrationPoints(input: {
  alerts?: LocalKpiAlert[];
  recommendations?: LocalRecommendation[];
  actionPlans?: LocalActionPlan[];
  impacts?: LocalActionPlanImpact[];
  confidenceScores?: RecommendationConfidence[];
  datasetGroupByInsights?: DatasetGroupByInsight[];
}) {
  const criticalAlerts = (input.alerts ?? [])
    .filter((alert) => alert.severity === "critical")
    .map((alert) => `Arbitrer le traitement de l'alerte critique : ${alert.title}.`);
  const criticalRecommendations = (input.recommendations ?? [])
    .filter((recommendation) => recommendation.priority === "critical")
    .map((recommendation) => `Décider si la recommandation prioritaire doit être lancée : ${recommendation.title}.`);
  const latePlans = (input.actionPlans ?? [])
    .filter((plan) => plan.status === "todo" || plan.status === "in_progress")
    .map((plan) => `Confirmer le responsable et l'échéance du plan : ${plan.title}.`);
  const negativeImpacts = (input.impacts ?? [])
    .filter((impact) => impact.status === "negative")
    .map((impact) => `Réexaminer le plan ${impact.actionPlanId}, dont l'impact mesuré est défavorable.`);
  const lowConfidence = (input.confidenceScores ?? [])
    .filter((confidence) => confidence.score < 50)
    .map((confidence) => `Décider si la recommandation ${confidence.recommendationId} est exploitable malgré une confiance faible (${confidence.score} %).`);

  const comparativePoints = (input.datasetGroupByInsights ?? [])
    .filter((insight) => insight.severity === "critical" || insight.severity === "watch")
    .map((insight) => {
      if (insight.insightType === "concentration") {
        return `Pourquoi ${insight.groupValue} concentre-t-il autant de valeur ?`;
      }

      if (insight.insightType === "weak_group") {
        return `Faut-il revoir les pratiques de ${insight.groupValue} ?`;
      }

      if (insight.insightType === "anomaly_candidate") {
        return `Faut-il auditer le groupe atypique ${insight.groupValue} ?`;
      }

      return `Faut-il comparer les pratiques entre groupes autour de ${insight.groupValue} ?`;
    });

  return limit([...criticalAlerts, ...criticalRecommendations, ...comparativePoints, ...negativeImpacts, ...latePlans, ...lowConfidence], 8);
}

export function generateCopilNextActions(input: {
  recommendations?: LocalRecommendation[];
  actionPlans?: LocalActionPlan[];
  feedbackItems?: LocalRecommendationFeedback[];
}) {
  const recommendationActions = (input.recommendations ?? [])
    .filter((recommendation) => recommendation.priority === "critical" || recommendation.priority === "high")
    .flatMap((recommendation) =>
      recommendation.recommendedActions.slice(0, 1).map((action) => `${action.label} - ${action.description}`)
    );
  const planActions = (input.actionPlans ?? [])
    .filter((plan) => plan.status !== "done" && plan.status !== "cancelled")
    .flatMap((plan) =>
      plan.actions
        .filter((task) => task.status !== "done")
        .slice(0, 2)
        .map((task) => `${task.label} (${plan.title})`)
    );
  const feedbackActions = (input.feedbackItems ?? [])
    .filter((feedback) => feedback.actionTaken === "planned")
    .map((feedback) => `Transformer le feedback prévu en action suivie pour ${feedback.recommendationId}.`);

  return limit([...planActions, ...recommendationActions, ...feedbackActions], 8);
}

function generateConfidenceNotes(confidenceScores: RecommendationConfidence[] = []) {
  if (confidenceScores.length === 0) {
    return ["Aucun score de confiance disponible pour les recommandations locales."];
  }

  return limit(confidenceScores.map((confidence) =>
    `${confidence.recommendationId} : confiance ${confidence.score} % (${confidence.level}).`
  ), 6);
}

function generateKeyKpis(results: LocalKpiResult[] = []) {
  const prioritized = [...results].sort((a, b) => {
    const priority = { critical: 0, watch: 1, healthy: 2, "not-tested": 3 } as const;
    return priority[a.status] - priority[b.status];
  });

  return limit(prioritized.map((result) =>
    `${result.name} : ${result.value} (${statusLabel(result.status)}) - source ${result.sourceFileName}.`
  ), 6);
}

function buildSection(title: string, summary: string, items: string[]): LocalCopilSection {
  return {
    title,
    summary,
    items
  };
}

export function generateLocalCopilBrief(input: LocalCopilBriefInput): LocalCopilBrief {
  const kpiResults = input.kpiResults ?? [];
  const alerts = input.alerts ?? [];
  const recommendations = input.recommendations ?? [];
  const actionPlans = input.actionPlans ?? [];
  const impacts = input.impacts ?? [];
  const decisionJournalEntries = input.decisionJournalEntries ?? [];
  const datasetGroupByInsights = input.datasetGroupByInsights ?? [];
  const globalSituation =
    input.executiveSummary?.globalSituation ??
    (kpiResults.length > 0
      ? `${kpiResults.length} KPI local(aux) disponible(s) pour préparer le COPIL.`
      : "Aucune donnée locale suffisante pour produire une lecture COPIL complète.");
  const mainPriorities = limit((input.priorities ?? []).map((priority) =>
    `#${priority.rank} ${priority.title} - score ${priority.priorityScore}/100 - ${priority.recommendedNextAction}`
  ), 5);
  const keyKpis = generateKeyKpis(kpiResults);
  const criticalAlerts = limit(alerts
    .filter((alert) => alert.severity === "critical")
    .map((alert) => `${alert.title} : ${alert.cause}`), 6);
  const keyRecommendations = limit(recommendations
    .filter((recommendation) => recommendation.priority === "critical" || recommendation.priority === "high")
    .map((recommendation) => `${recommendation.title} - ${recommendation.expectedImpact}`), 6);
  const activeActionPlans = limit(actionPlans
    .filter((plan) => plan.status !== "done" && plan.status !== "cancelled")
    .map((plan) => `${plan.title} - ${plan.owner} - statut ${plan.status}.`), 6);
  const measuredImpacts = limit(impacts.map((impact) =>
    `${impactStatusLabel(impact.status)} sur ${impact.relatedKpiId} : ${impact.interpretation}`
  ), 6);
  const recentDecisions = limit(decisionJournalEntries.map(journalLabel), 8);
  const risks = generateCopilRiskSummary({
    alerts,
    insights: input.insights,
    executiveSummary: input.executiveSummary,
    datasetGroupByInsights
  });
  const arbitrationPoints = generateCopilArbitrationPoints({
    alerts,
    recommendations,
    actionPlans,
    impacts,
    confidenceScores: input.confidenceScores,
    datasetGroupByInsights
  });
  const nextActions = generateCopilNextActions({
    recommendations,
    actionPlans,
    feedbackItems: input.feedbackItems
  });
  const memoryReferences = input.memoryReferences ?? [];
  const confidenceNotes = generateConfidenceNotes(input.confidenceScores);
  const comparativeInsights = limit(datasetGroupByInsights.map((insight) =>
    `${insight.title} - groupe ${insight.groupValue} - ${insight.summary}`
  ), 6);

  return {
    id: `${input.organizationId}-local-copil-brief`,
    organizationId: input.organizationId,
    generatedAt: now(),
    title: "Préparation COPIL",
    periodLabel: input.periodLabel,
    globalSituation,
    mainPriorities,
    keyKpis,
    criticalAlerts,
    keyRecommendations,
    activeActionPlans,
    measuredImpacts,
    recentDecisions,
    arbitrationPoints,
    risks,
    nextActions,
    comparativeInsights,
    memoryReferences,
    confidenceNotes,
    sections: [
      buildSection("Situation", globalSituation, keyKpis),
      buildSection("Priorités", `${mainPriorities.length} priorité(s) à traiter.`, mainPriorities),
      buildSection("Risques", `${risks.length} risque(s) à examiner.`, risks),
      buildSection("Arbitrages", `${arbitrationPoints.length} point(s) à décider.`, arbitrationPoints),
      buildSection("Actions", `${nextActions.length} prochaine(s) action(s).`, nextActions)
    ],
    persisted: false
  };
}

function markdownList(items: string[]) {
  if (items.length === 0) return "- Aucun élément disponible.";
  return items.map((item) => `- ${item}`).join("\n");
}

export function generateLocalCopilBriefMarkdown(brief: LocalCopilBrief) {
  return [
    `# ${brief.title}`,
    "",
    `Période : ${brief.periodLabel}`,
    `Généré le : ${new Date(brief.generatedAt).toLocaleString("fr-FR")}`,
    "",
    "## Situation globale",
    brief.globalSituation,
    "",
    "## Priorités principales",
    markdownList(brief.mainPriorities),
    "",
    "## KPI à examiner",
    markdownList(brief.keyKpis),
    "",
    "## Risques",
    markdownList(brief.risks),
    "",
    "## Alertes critiques",
    markdownList(brief.criticalAlerts),
    "",
    "## Recommandations",
    markdownList(brief.keyRecommendations),
    "",
    "## Plans d'action",
    markdownList(brief.activeActionPlans),
    "",
    "## Impacts mesurés",
    markdownList(brief.measuredImpacts),
    "",
    "## Décisions récentes",
    markdownList(brief.recentDecisions),
    "",
    "## Points à arbitrer",
    markdownList(brief.arbitrationPoints),
    "",
    "## Prochaines actions",
    markdownList(brief.nextActions),
    "",
    "## Notes de confiance",
    markdownList(brief.confidenceNotes)
  ].join("\n");
}
