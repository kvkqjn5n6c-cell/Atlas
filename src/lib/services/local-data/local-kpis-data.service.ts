import { generateLocalExecutiveSummary } from "@/lib/insights/local-executive-summary-engine";
import { generateLocalKpiInsights } from "@/lib/insights/local-insights-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { activeOrganizationId } from "@/lib/context/scope-defaults";
import { getAtlasMemoryKnowledge } from "@/lib/local/atlas-memory-knowledge-store";
import { getAtlasMemoryDocuments } from "@/lib/local/atlas-memory-store";
import { extractAtlasKnowledgeItems, generateMemoryContext } from "@/lib/memory/atlas-memory-engine";
import { getLocalAlertRules } from "@/lib/local/local-alert-rules-store";
import { getLocalKpiHistory } from "@/lib/local/local-kpi-history-store";
import { getLocalKpiResults } from "@/lib/local/local-kpi-results-store";
import { getLocalKpiConfigurations } from "@/lib/local/local-kpi-store";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { LocalExecutiveSummary } from "@/types/local-executive-summary";
import type { LocalInsight } from "@/types/local-insights";
import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { LocalKpiConfiguration } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalDataResult } from "@/types/local-data-result";

export type LocalKpiWorkspaceData = {
  configurations: LocalKpiConfiguration[];
  results: LocalKpiResult[];
  history: LocalKpiHistoryPoint[];
  historyByKpiId: Record<string, LocalKpiHistoryPoint[]>;
  alertRules: LocalAlertRule[];
  alerts: LocalKpiAlert[];
  insights: LocalInsight[];
  executiveSummary: LocalExecutiveSummary;
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
  executiveSummary: emptyExecutiveSummary
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

export function getLocalKpiWorkspaceData(): LocalDataResult<LocalKpiWorkspaceData> {
  const configurations = getLocalKpiConfigurations();
  const results = getLocalKpiResults();
  const history = getLocalKpiHistory();
  const alertRules = getLocalAlertRules();
  const memoryDocuments = getAtlasMemoryDocuments(activeOrganizationId);
  const detectedKnowledge = extractAtlasKnowledgeItems(memoryDocuments, activeOrganizationId);
  const governedKnowledge = getAtlasMemoryKnowledge(activeOrganizationId, detectedKnowledge);
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

  return {
    data: {
      configurations,
      results,
      history,
      historyByKpiId: buildHistoryByKpiId(history),
      alertRules,
      alerts,
      insights,
      executiveSummary
    },
    source: "localStorage",
    fallbackUsed: false,
    warnings: [],
    lastUpdated: new Date().toISOString()
  };
}
