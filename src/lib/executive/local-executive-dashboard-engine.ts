import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalExecutiveDashboard, ExecutiveDashboardCard, ExecutiveGlobalStatus } from "@/types/local-executive-dashboard";
import type { LocalExecutiveSummary } from "@/types/local-executive-summary";
import type { LocalInsight } from "@/types/local-insights";
import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalPriorityItem } from "@/types/local-priorities";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";
import type { ConfidenceLevel, RecommendationConfidence } from "@/types/recommendation-confidence";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";

type LocalExecutiveDashboardInput = {
  organizationId: string;
  kpiResults?: LocalKpiResult[];
  alerts?: LocalKpiAlert[];
  insights?: LocalInsight[];
  executiveSummary?: LocalExecutiveSummary;
  recommendations?: LocalRecommendation[];
  priorities?: LocalPriorityItem[];
  actionPlans?: LocalActionPlan[];
  impacts?: LocalActionPlanImpact[];
  feedbackItems?: LocalRecommendationFeedback[];
  decisionJournalEntries?: DecisionJournalEntry[];
  approvedMemoryKnowledge?: AtlasKnowledgeItem[];
  confidenceScores?: RecommendationConfidence[];
  histories?: LocalKpiHistoryPoint[];
  datasetGroupByInsights?: DatasetGroupByInsight[];
};

function now() {
  return new Date().toISOString();
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusFromScore(score: number): ExecutiveGlobalStatus {
  if (score >= 75) return "healthy";
  if (score >= 50) return "watch";
  return "critical";
}

function dashboardStatusFromSeverity(severity?: string): ExecutiveGlobalStatus {
  if (severity === "critical") return "critical";
  if (severity === "warning" || severity === "watch" || severity === "high") return "watch";
  return "healthy";
}

function averageConfidence(confidenceScores: RecommendationConfidence[] = []) {
  if (confidenceScores.length === 0) return 50;
  return Math.round(confidenceScores.reduce((sum, item) => sum + item.score, 0) / confidenceScores.length);
}

function confidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 90) return "very_high";
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export function determineExecutiveGlobalStatus(score: number): ExecutiveGlobalStatus {
  return statusFromScore(score);
}

export function calculateExecutiveGlobalScore(input: LocalExecutiveDashboardInput) {
  let score = 82;
  const priorities = input.priorities ?? [];
  const alerts = input.alerts ?? [];
  const actionPlans = input.actionPlans ?? [];
  const impacts = input.impacts ?? [];
  const confidenceAverage = averageConfidence(input.confidenceScores);
  const datasetGroupByInsights = input.datasetGroupByInsights ?? [];

  score -= priorities.filter((priority) => priority.urgency === "critical").length * 12;
  score -= priorities.filter((priority) => priority.urgency === "high").length * 6;
  score -= alerts.filter((alert) => alert.severity === "critical").length * 10;
  score -= alerts.filter((alert) => alert.severity === "warning").length * 4;
  score -= datasetGroupByInsights.filter((insight) => insight.severity === "critical").length * 6;
  score -= datasetGroupByInsights.filter((insight) => insight.severity === "watch").length * 3;
  score -= impacts.filter((impact) => impact.status === "negative").length * 8;
  score += Math.min(6, actionPlans.filter((plan) => plan.status === "in_progress" || plan.status === "todo").length * 2);
  score += Math.min(10, impacts.filter((impact) => impact.status === "positive").length * 5);
  if (confidenceAverage >= 80) score += 5;
  if (confidenceAverage < 50) score -= 5;

  return clampScore(score);
}

export function generateExecutiveReliabilityNotes(input: LocalExecutiveDashboardInput) {
  const notes = [...(input.executiveSummary?.dataReliabilityNotes ?? [])];
  const histories = input.histories ?? [];
  const kpiResults = input.kpiResults ?? [];
  const insufficientHistoryCount = kpiResults.filter((result) =>
    histories.filter((point) => point.kpiId === result.kpiId).length < 2
  ).length;

  if (insufficientHistoryCount > 0) {
    notes.push(`${insufficientHistoryCount} KPI local(aux) disposent d'un historique encore insuffisant.`);
  }
  if ((input.confidenceScores ?? []).length === 0) {
    notes.push("Aucun score de confiance disponible sur les recommandations locales.");
  }
  if ((input.datasetGroupByInsights ?? []).length > 0) {
    notes.push(`${input.datasetGroupByInsights?.length ?? 0} signal(aux) comparatifs Dataset pris en compte.`);
  }

  return Array.from(new Set(notes)).slice(0, 5);
}

export function generateExecutiveNextBestActions(input: LocalExecutiveDashboardInput) {
  const priorityActions = (input.priorities ?? []).slice(0, 3).map((priority) => priority.recommendedNextAction);
  const recommendationActions = (input.recommendations ?? [])
    .filter((recommendation) => recommendation.priority === "critical" || recommendation.priority === "high")
    .flatMap((recommendation) => recommendation.recommendedActions.slice(0, 1).map((action) => action.label));
  const planActions = (input.actionPlans ?? [])
    .filter((plan) => plan.status !== "done" && plan.status !== "cancelled")
    .flatMap((plan) => plan.actions.filter((task) => task.status !== "done").slice(0, 1).map((task) => task.label));

  return Array.from(new Set([...priorityActions, ...recommendationActions, ...planActions])).slice(0, 6);
}

function priorityCards(priorities: LocalPriorityItem[] = []): ExecutiveDashboardCard[] {
  return priorities.slice(0, 5).map((priority) => ({
    title: `#${priority.rank} ${priority.title}`,
    summary: priority.summary,
    status: priority.urgency === "critical" ? "critical" : priority.urgency === "high" ? "watch" : "healthy",
    score: priority.priorityScore,
    sourceIds: [priority.id, ...priority.relatedKpiIds, ...priority.relatedAlertIds],
    actionLabel: priority.recommendedNextAction
  }));
}

function riskCards(input: LocalExecutiveDashboardInput): ExecutiveDashboardCard[] {
  const alertRisks = (input.alerts ?? [])
    .filter((alert) => alert.severity === "critical")
    .map((alert) => ({
      title: alert.title,
      summary: alert.businessImpact,
      status: "critical" as const,
      sourceIds: [alert.id, alert.kpiId],
      actionLabel: alert.recommendedAction
    }));
  const summaryRisks = (input.executiveSummary?.mainRisks ?? []).slice(0, 3).map((risk, index) => ({
    title: `Risque dirigeant ${index + 1}`,
    summary: risk,
    status: "watch" as const,
    sourceIds: [input.executiveSummary?.id ?? "executive-summary"]
  }));
  const comparativeRisks = (input.datasetGroupByInsights ?? [])
    .filter((insight) => insight.severity === "critical" || insight.severity === "watch")
    .slice(0, 3)
    .map((insight) => ({
      title: insight.title,
      summary: insight.summary,
      status: insight.severity === "critical" ? "critical" as const : "watch" as const,
      score: Math.round(insight.value),
      sourceIds: [insight.id, insight.datasetId, insight.groupByAnalysisId],
      actionLabel: insight.recommendedAction
    }));

  return [...alertRisks, ...comparativeRisks, ...summaryRisks].slice(0, 5);
}

function recommendationCards(recommendations: LocalRecommendation[] = [], confidenceScores: RecommendationConfidence[] = []): ExecutiveDashboardCard[] {
  return recommendations
    .filter((recommendation) => recommendation.priority === "critical" || recommendation.priority === "high")
    .slice(0, 5)
    .map((recommendation) => {
      const confidence = confidenceScores.find((item) => item.recommendationId === recommendation.id);
      return {
        title: recommendation.title,
        summary: recommendation.summary,
        status: recommendation.priority === "critical" ? "critical" : "watch",
        score: confidence?.score,
        sourceIds: [recommendation.id, ...recommendation.relatedKpiIds],
        actionLabel: recommendation.recommendedActions[0]?.label
      };
    });
}

function planCards(actionPlans: LocalActionPlan[] = []): ExecutiveDashboardCard[] {
  return actionPlans
    .filter((plan) => plan.status !== "done" && plan.status !== "cancelled")
    .slice(0, 5)
    .map((plan) => ({
      title: plan.title,
      summary: `${plan.owner} - ${plan.expectedImpact}`,
      status: plan.priority === "critical" ? "critical" : plan.priority === "high" ? "watch" : "healthy",
      sourceIds: [plan.id, ...(plan.sourceRecommendationId ? [plan.sourceRecommendationId] : [])],
      actionLabel: plan.actions.find((task) => task.status !== "done")?.label
    }));
}

function impactCards(impacts: LocalActionPlanImpact[] = []): ExecutiveDashboardCard[] {
  return impacts.slice(0, 5).map((impact) => ({
    title: `Impact sur ${impact.relatedKpiId}`,
    summary: impact.interpretation,
    status: impact.status === "negative" ? "critical" : impact.status === "positive" ? "healthy" : "watch",
    score: impact.variation,
    sourceIds: [impact.id, impact.actionPlanId, impact.relatedKpiId]
  }));
}

function decisionCards(entries: DecisionJournalEntry[] = []): ExecutiveDashboardCard[] {
  return entries.slice(0, 5).map((entry) => ({
    title: entry.title,
    summary: entry.description,
    status: dashboardStatusFromSeverity(entry.priority ?? entry.status),
    score: entry.confidenceScore,
    sourceIds: [entry.id, entry.sourceId]
  }));
}

function memoryCards(knowledge: AtlasKnowledgeItem[] = []): ExecutiveDashboardCard[] {
  return knowledge.slice(0, 5).map((item) => ({
    title: item.type === "objective" ? "Objectif validé" : item.type === "business_rule" ? "Règle métier validée" : item.type === "decision" ? "Décision validée" : "Glossaire validé",
    summary: item.value,
    status: "healthy",
    sourceIds: [item.id, item.sourceDocument]
  }));
}

function comparativeCards(insights: DatasetGroupByInsight[] = []): ExecutiveDashboardCard[] {
  return insights.slice(0, 5).map((insight) => ({
    title: insight.title,
    summary: insight.summary,
    status: insight.severity === "critical" ? "critical" : insight.severity === "watch" ? "watch" : "healthy",
    score: Math.round(insight.value),
    sourceIds: [insight.id, insight.datasetId, insight.groupByAnalysisId],
    actionLabel: insight.recommendedAction
  }));
}

export function generateLocalExecutiveDashboard(input: LocalExecutiveDashboardInput): LocalExecutiveDashboard {
  const globalScore = calculateExecutiveGlobalScore(input);
  const confidenceAverage = averageConfidence(input.confidenceScores);

  return {
    id: `${input.organizationId}-local-executive-dashboard`,
    organizationId: input.organizationId,
    generatedAt: now(),
    globalStatus: determineExecutiveGlobalStatus(globalScore),
    globalScore,
    confidenceLevel: confidenceLevelFromScore(confidenceAverage),
    topPriorities: priorityCards(input.priorities),
    criticalRisks: riskCards(input),
    keyRecommendations: recommendationCards(input.recommendations, input.confidenceScores),
    activeActionPlans: planCards(input.actionPlans),
    recentImpacts: impactCards(input.impacts),
    recentDecisions: decisionCards(input.decisionJournalEntries),
    memorySignals: memoryCards(input.approvedMemoryKnowledge),
    comparativeSignals: comparativeCards(input.datasetGroupByInsights),
    dataReliabilityNotes: generateExecutiveReliabilityNotes(input),
    nextBestActions: generateExecutiveNextBestActions(input),
    persisted: false
  };
}
