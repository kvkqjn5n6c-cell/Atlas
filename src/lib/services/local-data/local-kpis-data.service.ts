import { generateLocalExecutiveSummary } from "@/lib/insights/local-executive-summary-engine";
import { generateLocalKpiInsights } from "@/lib/insights/local-insights-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { generateLocalRecommendations } from "@/lib/recommendations/local-recommendations-engine";
import { activeOrganizationId } from "@/lib/context/scope-defaults";
import { getAtlasMemoryKnowledge } from "@/lib/local/atlas-memory-knowledge-store";
import { getAtlasMemoryDocuments } from "@/lib/local/atlas-memory-store";
import { extractAtlasKnowledgeItems, generateMemoryContext } from "@/lib/memory/atlas-memory-engine";
import { getLocalAlertRules } from "@/lib/local/local-alert-rules-store";
import { getLocalActionPlanImpacts } from "@/lib/local/local-action-plan-impact-store";
import { getLocalActionPlans } from "@/lib/local/local-action-plans-store";
import { getLocalKpiHistory } from "@/lib/local/local-kpi-history-store";
import { getLocalKpiResults } from "@/lib/local/local-kpi-results-store";
import { getLocalKpiConfigurations } from "@/lib/local/local-kpi-store";
import { getRecommendationFeedback } from "@/lib/local/local-recommendation-feedback-store";
import { getJournalEntries } from "@/lib/local/decision-journal-store";
import { getGroupByInsights } from "@/lib/local/dataset-groupby-insights-store";
import { getDatasets } from "@/lib/local/atlas-datasets-store";
import { getDatasetGroupByAnalyses } from "@/lib/local/dataset-groupby-store";
import {
  recordConfidenceCalculated,
  recordRecommendationCreated
} from "@/lib/journal/decision-journal-engine";
import { generateLocalExecutiveDashboard } from "@/lib/executive/local-executive-dashboard-engine";
import { generateLocalPriorities } from "@/lib/priorities/local-priorities-engine";
import { calculateRecommendationsConfidence } from "@/lib/recommendations/recommendation-confidence-engine";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalExecutiveSummary } from "@/types/local-executive-summary";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { LocalInsight, LocalInsightMemoryReference } from "@/types/local-insights";
import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { LocalKpiConfiguration } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalDataResult } from "@/types/local-data-result";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";
import type { RecommendationConfidence } from "@/types/recommendation-confidence";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { LocalPriorityItem } from "@/types/local-priorities";
import type { LocalExecutiveDashboard } from "@/types/local-executive-dashboard";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";

export type LocalKpiWorkspaceData = {
  configurations: LocalKpiConfiguration[];
  results: LocalKpiResult[];
  history: LocalKpiHistoryPoint[];
  historyByKpiId: Record<string, LocalKpiHistoryPoint[]>;
  alertRules: LocalAlertRule[];
  alerts: LocalKpiAlert[];
  insights: LocalInsight[];
  executiveSummary: LocalExecutiveSummary;
  recommendations: LocalRecommendation[];
  recommendationConfidence: RecommendationConfidence[];
  actionPlans: LocalActionPlan[];
  actionPlanImpacts: LocalActionPlanImpact[];
  recommendationFeedback: LocalRecommendationFeedback[];
  decisionJournalEntries: DecisionJournalEntry[];
  datasets: AtlasDataset[];
  datasetGroupByAnalyses: DatasetGroupByAnalysis[];
  datasetGroupByInsights: DatasetGroupByInsight[];
  priorities: LocalPriorityItem[];
  executiveDashboard: LocalExecutiveDashboard;
  approvedMemoryKnowledge: AtlasKnowledgeItem[];
  usedMemoryReferences: LocalInsightMemoryReference[];
};

const emptyExecutiveSummary: LocalExecutiveSummary = {
  id: "local-executive-summary-empty",
  organizationId: "org-atlas-demo",
  generatedAt: "",
  globalSituation: "Aucun KPI personnalisé n'alimente encore la lecture dirigeant locale.",
  mainRisks: [],
  keyFindings: [],
  recommendedActions: [],
  dataReliabilityNotes: [],
  memoryHighlights: [],
  relatedKpiIds: [],
  relatedAlertIds: [],
  persisted: false
};

export const emptyLocalKpiWorkspaceData: LocalKpiWorkspaceData = {
  configurations: [],
  results: [],
  history: [],
  historyByKpiId: {},
  alertRules: [],
  alerts: [],
  insights: [],
  executiveSummary: emptyExecutiveSummary,
  recommendations: [],
  recommendationConfidence: [],
  actionPlans: [],
  actionPlanImpacts: [],
  recommendationFeedback: [],
  decisionJournalEntries: [],
  datasets: [],
  datasetGroupByAnalyses: [],
  datasetGroupByInsights: [],
  priorities: [],
  executiveDashboard: {
    id: "local-executive-dashboard-empty",
    organizationId: "org-atlas-demo",
    generatedAt: "",
    globalStatus: "watch",
    globalScore: 0,
    confidenceLevel: "low",
    topPriorities: [],
    criticalRisks: [],
    keyRecommendations: [],
    activeActionPlans: [],
    recentImpacts: [],
    recentDecisions: [],
    memorySignals: [],
    comparativeSignals: [],
    datasetSignals: [],
    datasetDecisionFlow: [],
    dataReliabilityNotes: ["Aucune donnée locale suffisante."],
    nextBestActions: [],
    persisted: false
  },
  approvedMemoryKnowledge: [],
  usedMemoryReferences: []
};

export function getEmptyLocalKpiWorkspaceResult(): LocalDataResult<LocalKpiWorkspaceData> {
  return {
    data: emptyLocalKpiWorkspaceData,
    source: "localStorage",
    fallbackUsed: false,
    warnings: [],
    lastUpdated: ""
  };
}

function buildHistoryByKpiId(history: LocalKpiHistoryPoint[]) {
  return history.reduce<Record<string, LocalKpiHistoryPoint[]>>((accumulator, point) => {
    accumulator[point.kpiId] = [...(accumulator[point.kpiId] ?? []), point];
    return accumulator;
  }, {});
}

export function getUsedMemoryReferences(insights: LocalInsight[]) {
  const references = insights.flatMap((insight) => insight.memoryReferenceItems ?? []);
  const seenReferences = new Set<string>();

  return references.filter((reference) => {
    const key = reference.knowledgeId ?? `${reference.sourceDocument}-${reference.knowledgeType}-${reference.value}`;
    if (seenReferences.has(key)) return false;
    seenReferences.add(key);
    return true;
  });
}

export function getAvailableApprovedMemoryKnowledge(
  approvedKnowledge: AtlasKnowledgeItem[],
  usedReferences: LocalInsightMemoryReference[]
) {
  const usedKnowledgeIds = new Set(usedReferences.map((reference) => reference.knowledgeId).filter(Boolean));
  const usedFallbackKeys = new Set(usedReferences.map((reference) => `${reference.sourceDocument}-${reference.value}`));

  return approvedKnowledge.filter((item) =>
    !usedKnowledgeIds.has(item.id) && !usedFallbackKeys.has(`${item.sourceDocument}-${item.value}`)
  );
}

export function getLocalKpiWorkspaceData(): LocalDataResult<LocalKpiWorkspaceData> {
  const configurations = getLocalKpiConfigurations();
  const results = getLocalKpiResults();
  const history = getLocalKpiHistory();
  const alertRules = getLocalAlertRules();
  const actionPlans = getLocalActionPlans();
  const actionPlanImpacts = getLocalActionPlanImpacts();
  const recommendationFeedback = getRecommendationFeedback();
  const datasets = getDatasets();
  const datasetGroupByAnalyses = getDatasetGroupByAnalyses();
  const datasetGroupByInsights = getGroupByInsights();
  const memoryDocuments = getAtlasMemoryDocuments(activeOrganizationId);
  const detectedKnowledge = extractAtlasKnowledgeItems(memoryDocuments, activeOrganizationId);
  const governedKnowledge = getAtlasMemoryKnowledge(activeOrganizationId, detectedKnowledge);
  const approvedMemoryKnowledge = governedKnowledge.filter((item) => item.status === "approved");
  const memoryContext = generateMemoryContext(memoryDocuments, governedKnowledge);
  const alerts = generateLocalKpiAlerts(results, history, alertRules);
  const insights = generateLocalKpiInsights(results, history, alerts, alertRules, memoryContext);
  const executiveSummary = generateLocalExecutiveSummary({
    kpiResults: results,
    histories: history,
    alerts,
    alertRules,
    insights,
    memoryContext
  });
  const usedMemoryReferences = getUsedMemoryReferences(insights);
  const recommendations = generateLocalRecommendations({
    organizationId: activeOrganizationId,
    kpiResults: results,
    histories: history,
    alerts,
    alertRules,
    insights,
    executiveSummary,
    approvedMemoryKnowledge,
    datasetGroupByInsights
  });
  const recommendationConfidence = calculateRecommendationsConfidence({
    recommendations,
    kpiResults: results,
    histories: history,
    alerts,
    approvedMemoryKnowledge,
    feedbackItems: recommendationFeedback,
    actionPlans,
    actionPlanImpacts
  });
  recommendations.forEach(recordRecommendationCreated);
  recommendationConfidence.forEach(recordConfidenceCalculated);
  const decisionJournalEntries = getJournalEntries();
  const priorities = generateLocalPriorities({
    organizationId: activeOrganizationId,
    kpiResults: results,
    alerts,
    recommendations,
    confidenceScores: recommendationConfidence,
    actionPlans,
    impacts: actionPlanImpacts,
    feedbackItems: recommendationFeedback,
    decisionJournalEntries,
    approvedMemoryKnowledge,
    histories: history,
    datasetGroupByInsights
  });
  const executiveDashboard = generateLocalExecutiveDashboard({
    organizationId: activeOrganizationId,
    kpiResults: results,
    alerts,
    insights,
    executiveSummary,
    recommendations,
    priorities,
    actionPlans,
    impacts: actionPlanImpacts,
    feedbackItems: recommendationFeedback,
    decisionJournalEntries,
    approvedMemoryKnowledge,
    confidenceScores: recommendationConfidence,
    histories: history,
    datasets,
    datasetGroupByAnalyses,
    datasetGroupByInsights
  });

  return {
    data: {
      configurations,
      results,
      history,
      historyByKpiId: buildHistoryByKpiId(history),
      alertRules,
      alerts,
      insights,
      executiveSummary,
      recommendations,
      recommendationConfidence,
      actionPlans,
      actionPlanImpacts,
      recommendationFeedback,
      decisionJournalEntries,
      datasets,
      datasetGroupByAnalyses,
      datasetGroupByInsights,
      priorities,
      executiveDashboard,
      approvedMemoryKnowledge,
      usedMemoryReferences
    },
    source: "localStorage",
    fallbackUsed: false,
    warnings: [],
    lastUpdated: new Date().toISOString()
  };
}
