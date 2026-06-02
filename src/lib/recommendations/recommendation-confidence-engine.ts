import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";
import type { ConfidenceFactor, ConfidenceLevel, RecommendationConfidence } from "@/types/recommendation-confidence";

type RecommendationConfidenceInput = {
  recommendation: LocalRecommendation;
  allRecommendations?: LocalRecommendation[];
  kpiResults?: LocalKpiResult[];
  histories?: LocalKpiHistoryPoint[];
  alerts?: LocalKpiAlert[];
  approvedMemoryKnowledge?: AtlasKnowledgeItem[];
  feedbackItems?: LocalRecommendationFeedback[];
  actionPlans?: LocalActionPlan[];
  actionPlanImpacts?: LocalActionPlanImpact[];
};

const BASE_SCORE = 50;

function now() {
  return new Date().toISOString();
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function relatedHistoryCount(recommendation: LocalRecommendation, histories: LocalKpiHistoryPoint[]) {
  return histories.filter((point) => recommendation.relatedKpiIds.includes(point.kpiId)).length;
}

function factor(label: string, value: number, weight: number, explanation: string): ConfidenceFactor {
  return { label, value, weight, explanation };
}

function matchingRecommendationIds(recommendation: LocalRecommendation, allRecommendations: LocalRecommendation[]) {
  return allRecommendations
    .filter((item) => item.id === recommendation.id || item.category === recommendation.category)
    .map((item) => item.id);
}

function feedbackScore(
  recommendation: LocalRecommendation,
  allRecommendations: LocalRecommendation[],
  feedbackItems: LocalRecommendationFeedback[]
) {
  const candidateIds = new Set(matchingRecommendationIds(recommendation, allRecommendations));
  const relatedFeedback = feedbackItems.filter((item) => candidateIds.has(item.recommendationId));
  const relevantCount = relatedFeedback.filter((item) => item.relevance === "relevant").length;
  const negativeCount = relatedFeedback.filter((item) => item.relevance === "not_relevant").length;

  return { relatedFeedback, relevantCount, negativeCount };
}

function impactScore(
  recommendation: LocalRecommendation,
  actionPlans: LocalActionPlan[],
  impacts: LocalActionPlanImpact[]
) {
  const linkedPlanIds = actionPlans
    .filter((plan) => plan.sourceRecommendationId === recommendation.id)
    .map((plan) => plan.id);
  const linkedImpacts = impacts.filter((impact) => linkedPlanIds.includes(impact.actionPlanId));
  const positiveCount = linkedImpacts.filter((impact) => impact.status === "positive").length;
  const negativeCount = linkedImpacts.filter((impact) => impact.status === "negative").length;

  return { linkedImpacts, positiveCount, negativeCount };
}

export function calculateConfidenceFactors(input: RecommendationConfidenceInput) {
  const histories = input.histories ?? [];
  const alerts = input.alerts ?? [];
  const memory = input.approvedMemoryKnowledge ?? [];
  const feedbackItems = input.feedbackItems ?? [];
  const actionPlans = input.actionPlans ?? [];
  const actionPlanImpacts = input.actionPlanImpacts ?? [];
  const allRecommendations = input.allRecommendations ?? [input.recommendation];
  const factors: ConfidenceFactor[] = [];
  const warnings: string[] = [];

  const historyCount = relatedHistoryCount(input.recommendation, histories);
  if (historyCount >= 3) {
    factors.push(factor("Historique KPI suffisant", 1, 15, `${historyCount} point(s) d'historique alimentent les KPI liés.`));
  } else if (historyCount > 0) {
    factors.push(factor("Historique KPI limité", -1, 6, `${historyCount} point(s) seulement : la recommandation reste à confirmer.`));
    warnings.push("Historique KPI encore limité.");
  } else {
    factors.push(factor("Historique KPI absent", -1, 10, "Aucun point historique local n'appuie les KPI liés."));
    warnings.push("Aucun historique KPI disponible pour les KPI liés.");
  }

  const relatedResults = (input.kpiResults ?? []).filter((result) => input.recommendation.relatedKpiIds.includes(result.kpiId));
  if (input.recommendation.category === "data_quality" || relatedResults.some((result) => result.status === "not-tested")) {
    factors.push(factor("Fiabilité des données à consolider", -1, 12, "La recommandation signale une limite de donnée ou un KPI non testé."));
    warnings.push("Fiabilité de donnée à consolider.");
  } else if (relatedResults.length > 0) {
    factors.push(factor("Données KPI exploitables", 1, 8, `${relatedResults.length} résultat(s) KPI local(aux) soutiennent la recommandation.`));
  }

  const relatedAlerts = alerts.filter((alertItem) => input.recommendation.relatedAlertIds.includes(alertItem.id));
  if (relatedAlerts.some((alertItem) => alertItem.severity === "critical")) {
    factors.push(factor("Alerte critique cohérente", 1, 12, "Une alerte critique liée renforce la priorité de la recommandation."));
  } else if (relatedAlerts.length > 0) {
    factors.push(factor("Alerte liée", 1, 7, "Une alerte locale cohérente soutient la recommandation."));
  }

  const memoryReferences = unique(input.recommendation.relatedMemoryReferences);
  if (memoryReferences.length > 0 || memory.length > 0 && input.recommendation.sourceType === "memory") {
    factors.push(factor("Connaissance Atlas Memory validée", 1, 10, "La recommandation s'appuie sur une connaissance mémoire validée."));
  } else {
    factors.push(factor("Mémoire non mobilisée", -1, 4, "Aucune connaissance mémoire validée n'est directement reliée à cette recommandation."));
  }

  const feedback = feedbackScore(input.recommendation, allRecommendations, feedbackItems);
  if (feedback.relevantCount > feedback.negativeCount) {
    factors.push(factor("Feedback utilisateur favorable", 1, 10, `${feedback.relevantCount} feedback(s) jugent une recommandation similaire pertinente.`));
  } else if (feedback.negativeCount > 0) {
    factors.push(factor("Feedback utilisateur défavorable", -1, 12, `${feedback.negativeCount} feedback(s) signalent une recommandation similaire non pertinente.`));
    warnings.push("Feedback utilisateur défavorable sur recommandation similaire.");
  } else {
    factors.push(factor("Peu de feedback disponible", -1, 5, "Aucun retour utilisateur ne confirme encore cette recommandation."));
    warnings.push("Peu de feedback utilisateur disponible.");
  }

  const impacts = impactScore(input.recommendation, actionPlans, actionPlanImpacts);
  if (impacts.positiveCount > impacts.negativeCount) {
    factors.push(factor("Impact positif observé", 1, 15, `${impacts.positiveCount} impact(s) positif(s) lié(s) à cette recommandation ou son plan.`));
  } else if (impacts.negativeCount > 0) {
    factors.push(factor("Impact négatif observé", -1, 15, `${impacts.negativeCount} impact(s) négatif(s) signalent une efficacité faible.`));
    warnings.push("Impact mesuré défavorable.");
  } else {
    factors.push(factor("Impact non encore confirmé", -1, 4, "Aucun impact positif mesuré ne confirme encore cette recommandation."));
  }

  return { factors, warnings };
}

export function determineConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 90) return "very_high";
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export function calculateRecommendationConfidence(input: RecommendationConfidenceInput): RecommendationConfidence {
  const { factors, warnings } = calculateConfidenceFactors(input);
  const score = clampScore(BASE_SCORE + factors.reduce((total, item) => total + item.value * item.weight, 0));

  return {
    recommendationId: input.recommendation.id,
    score,
    level: determineConfidenceLevel(score),
    factors,
    warnings,
    calculatedAt: now()
  };
}

export function calculateRecommendationsConfidence(input: Omit<RecommendationConfidenceInput, "recommendation"> & {
  recommendations: LocalRecommendation[];
}) {
  return input.recommendations.map((recommendation) =>
    calculateRecommendationConfidence({
      ...input,
      recommendation,
      allRecommendations: input.recommendations
    })
  );
}
