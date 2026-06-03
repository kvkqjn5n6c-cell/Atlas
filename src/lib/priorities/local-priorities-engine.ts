import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";
import type { LocalPriorityItem, LocalPrioritySourceType, PriorityImpact, PriorityUrgency } from "@/types/local-priorities";
import type { RecommendationConfidence } from "@/types/recommendation-confidence";

type LocalPrioritiesInput = {
  organizationId: string;
  kpiResults?: LocalKpiResult[];
  alerts?: LocalKpiAlert[];
  recommendations?: LocalRecommendation[];
  confidenceScores?: RecommendationConfidence[];
  actionPlans?: LocalActionPlan[];
  impacts?: LocalActionPlanImpact[];
  feedbackItems?: LocalRecommendationFeedback[];
  decisionJournalEntries?: DecisionJournalEntry[];
  approvedMemoryKnowledge?: AtlasKnowledgeItem[];
  histories?: LocalKpiHistoryPoint[];
};

type ScoreContext = {
  recommendation?: LocalRecommendation;
  alert?: LocalKpiAlert;
  kpiResult?: LocalKpiResult;
  confidence?: RecommendationConfidence;
  actionPlans: LocalActionPlan[];
  impacts: LocalActionPlanImpact[];
  feedbackItems: LocalRecommendationFeedback[];
  histories: LocalKpiHistoryPoint[];
  approvedMemoryKnowledge: AtlasKnowledgeItem[];
};

const priorityWeight = {
  low: 5,
  medium: 10,
  high: 20,
  critical: 30
} as const;

function now() {
  return new Date().toISOString();
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isPlanLate(plan: LocalActionPlan) {
  if (!plan.dueDate || plan.status === "done" || plan.status === "cancelled") return false;
  return new Date(plan.dueDate).getTime() < Date.now();
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function hasMemoryLink(recommendation: LocalRecommendation | undefined, knowledge: AtlasKnowledgeItem[]) {
  if (!recommendation) return false;
  if (recommendation.relatedMemoryReferences.length > 0) return true;

  const normalizedTitle = recommendation.title.toLowerCase();
  return knowledge.some((item) => normalizedTitle.includes(item.value.toLowerCase()));
}

function hasInsufficientHistory(kpiIds: string[], histories: LocalKpiHistoryPoint[]) {
  if (kpiIds.length === 0) return false;
  return kpiIds.some((kpiId) => histories.filter((point) => point.kpiId === kpiId).length < 2);
}

function scoreParts(context: ScoreContext) {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  if (context.alert?.severity === "critical" || context.kpiResult?.status === "critical") {
    score += 40;
    reasons.push("Alerte critique ou KPI critique détecté (+40).");
  } else if (context.alert?.severity === "warning" || context.kpiResult?.status === "watch") {
    score += 20;
    reasons.push("Alerte de surveillance ou KPI à surveiller détecté (+20).");
  }

  if (context.recommendation) {
    const weight = priorityWeight[context.recommendation.priority];
    score += weight;
    reasons.push(`Recommandation ${context.recommendation.priority} associée (+${weight}).`);
  }

  if ((context.confidence?.score ?? 0) > 80) {
    score += 10;
    reasons.push("Confiance Atlas supérieure à 80 % (+10).");
  }

  if (context.recommendation && context.actionPlans.length === 0) {
    score += 15;
    reasons.push("Aucun plan d'action local associé (+15).");
  }

  if (context.actionPlans.some(isPlanLate)) {
    score += 20;
    reasons.push("Plan d'action en retard ou à reprendre (+20).");
  }

  if (context.impacts.some((impact) => impact.status === "negative")) {
    score += 15;
    reasons.push("Impact négatif observé (+15).");
  }

  if (context.feedbackItems.some((feedback) => feedback.relevance === "not_relevant" || feedback.impactObserved === "negative")) {
    score += 10;
    reasons.push("Feedback métier négatif ou non pertinent (+10).");
  }

  if (hasMemoryLink(context.recommendation, context.approvedMemoryKnowledge)) {
    score += 10;
    reasons.push("Objectif ou connaissance stratégique mémoire lié (+10).");
  }

  const relatedKpiIds = unique([
    ...(context.recommendation?.relatedKpiIds ?? []),
    ...(context.alert ? [context.alert.kpiId] : []),
    ...(context.kpiResult ? [context.kpiResult.kpiId] : [])
  ]);

  if (hasInsufficientHistory(relatedKpiIds, context.histories)) {
    score -= 10;
    warnings.push("Historique KPI insuffisant pour confirmer la tendance (-10).");
  }

  return { score: clampScore(score), reasons, warnings };
}

export function calculatePriorityScore(context: ScoreContext) {
  return scoreParts(context).score;
}

export function determinePriorityUrgency(score: number): PriorityUrgency {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export function determinePriorityImpact(context: ScoreContext, score = calculatePriorityScore(context)): PriorityImpact {
  if (context.alert?.severity === "critical" || context.recommendation?.priority === "critical" || score >= 70) return "high";
  if (context.alert?.severity === "warning" || context.recommendation?.priority === "high" || score >= 40) return "medium";
  return "low";
}

function sourceTypes(context: ScoreContext): LocalPrioritySourceType[] {
  return unique([
    context.kpiResult ? "kpi" : undefined,
    context.alert ? "alert" : undefined,
    context.recommendation ? "recommendation" : undefined,
    context.confidence ? "confidence" : undefined,
    context.actionPlans.length > 0 ? "action_plan" : undefined,
    context.impacts.length > 0 ? "impact" : undefined,
    context.feedbackItems.length > 0 ? "feedback" : undefined,
    hasMemoryLink(context.recommendation, context.approvedMemoryKnowledge) ? "memory" : undefined
  ].filter((item): item is LocalPrioritySourceType => Boolean(item)));
}

function buildPriorityItem(context: ScoreContext, organizationId: string): LocalPriorityItem {
  const { score, reasons, warnings } = scoreParts(context);
  const urgency =
    context.alert?.severity === "critical" || context.kpiResult?.status === "critical"
      ? "critical"
      : determinePriorityUrgency(score);
  const impact = determinePriorityImpact(context, score);
  const relatedKpiIds = unique([
    ...(context.recommendation?.relatedKpiIds ?? []),
    ...(context.alert ? [context.alert.kpiId] : []),
    ...(context.kpiResult ? [context.kpiResult.kpiId] : [])
  ]);
  const relatedAlertIds = unique([
    ...(context.recommendation?.relatedAlertIds ?? []),
    ...(context.alert ? [context.alert.id] : [])
  ]);
  const relatedRecommendationIds = context.recommendation ? [context.recommendation.id] : [];
  const relatedActionPlanIds = context.actionPlans.map((plan) => plan.id);
  const title = context.recommendation?.title ?? context.alert?.title ?? context.kpiResult?.name ?? "Priorité Atlas";
  const summary = context.recommendation?.summary ?? context.alert?.cause ?? `KPI ${context.kpiResult?.name ?? "local"} à examiner.`;
  const nextAction =
    context.recommendation?.recommendedActions[0]?.label ??
    context.alert?.recommendedAction ??
    "Qualifier le sujet, désigner un responsable et décider de l'action à lancer.";

  return {
    id: `priority-${context.recommendation?.id ?? context.alert?.id ?? context.kpiResult?.id ?? title}`,
    organizationId,
    title,
    summary,
    rank: 0,
    priorityScore: score,
    urgency,
    impact,
    confidenceScore: context.confidence?.score,
    category: context.recommendation?.category ?? (context.alert?.severity === "critical" ? "risk" : "operations"),
    sourceTypes: sourceTypes(context),
    relatedKpiIds,
    relatedAlertIds,
    relatedRecommendationIds,
    relatedActionPlanIds,
    relatedMemoryReferences: context.recommendation?.relatedMemoryReferences ?? [],
    recommendedNextAction: nextAction,
    reasons,
    warnings,
    createdAt: now(),
    persisted: false
  };
}

export function rankLocalPriorities(priorities: LocalPriorityItem[]) {
  return [...priorities]
    .sort((a, b) => b.priorityScore - a.priorityScore || a.title.localeCompare(b.title))
    .map((priority, index) => ({ ...priority, rank: index + 1 }));
}

export function generateLocalPriorities(input: LocalPrioritiesInput) {
  const kpiResults = input.kpiResults ?? [];
  const alerts = input.alerts ?? [];
  const recommendations = input.recommendations ?? [];
  const actionPlans = input.actionPlans ?? [];
  const impacts = input.impacts ?? [];
  const feedbackItems = input.feedbackItems ?? [];
  const confidenceScores = input.confidenceScores ?? [];
  const histories = input.histories ?? [];
  const approvedMemoryKnowledge = input.approvedMemoryKnowledge ?? [];

  const prioritiesFromRecommendations = recommendations.map((recommendation) => {
    const recommendationPlans = actionPlans.filter((plan) => plan.sourceRecommendationId === recommendation.id);
    const relatedKpiIds = new Set(recommendation.relatedKpiIds);
    const relatedPlanIds = new Set(recommendationPlans.map((plan) => plan.id));

    return buildPriorityItem({
      recommendation,
      alert: alerts.find((alert) => recommendation.relatedAlertIds.includes(alert.id) || relatedKpiIds.has(alert.kpiId)),
      kpiResult: kpiResults.find((result) => relatedKpiIds.has(result.kpiId)),
      confidence: confidenceScores.find((confidence) => confidence.recommendationId === recommendation.id),
      actionPlans: recommendationPlans,
      impacts: impacts.filter((impact) => relatedPlanIds.has(impact.actionPlanId) || relatedKpiIds.has(impact.relatedKpiId)),
      feedbackItems: feedbackItems.filter((feedback) => feedback.recommendationId === recommendation.id),
      histories,
      approvedMemoryKnowledge
    }, input.organizationId);
  });

  const recommendationAlertIds = new Set(recommendations.flatMap((recommendation) => recommendation.relatedAlertIds));
  const prioritiesFromStandaloneAlerts = alerts
    .filter((alert) => !recommendationAlertIds.has(alert.id))
    .map((alert) => buildPriorityItem({
      alert,
      kpiResult: kpiResults.find((result) => result.kpiId === alert.kpiId),
      actionPlans: actionPlans.filter((plan) => plan.sourceAlertId === alert.id || plan.relatedKpiIds.includes(alert.kpiId)),
      impacts: impacts.filter((impact) => impact.relatedKpiId === alert.kpiId),
      feedbackItems: [],
      histories,
      approvedMemoryKnowledge
    }, input.organizationId));

  const priorities = rankLocalPriorities([...prioritiesFromRecommendations, ...prioritiesFromStandaloneAlerts])
    .filter((priority) => priority.priorityScore > 0);

  return priorities;
}
