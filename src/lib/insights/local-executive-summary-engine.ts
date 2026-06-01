import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { AtlasMemoryContext } from "@/types/atlas-memory-context";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { LocalExecutiveSummary } from "@/types/local-executive-summary";
import type { LocalInsight } from "@/types/local-insights";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";

const defaultOrganizationId = "org-atlas-demo";
const maxSummaryItems = 3;

type LocalExecutiveSummaryInput = {
  kpiResults: LocalKpiResult[];
  histories: LocalKpiHistoryPoint[];
  alerts: LocalKpiAlert[];
  alertRules: LocalAlertRule[];
  insights: LocalInsight[];
  memoryContext?: AtlasMemoryContext;
  organizationId?: string;
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function kpiLabel(result: LocalKpiResult) {
  return result.displayFieldLabel ? `${result.name} (${result.displayFieldLabel})` : result.name;
}

function formatValue(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value);
}

function buildGlobalSituation(kpiResults: LocalKpiResult[], alerts: LocalKpiAlert[], alertRules: LocalAlertRule[]) {
  if (kpiResults.length === 0) {
    return "Aucun KPI personnalisé n'alimente encore la lecture dirigeant locale.";
  }

  const criticalCount = kpiResults.filter((result) => result.status === "critical").length;
  const watchCount = kpiResults.filter((result) => result.status === "watch").length;
  const ruleAlertCount = alerts.filter((alert) => alert.alertSource === "rule").length;
  const activeRuleCount = alertRules.filter((rule) => rule.isActive).length;

  if (criticalCount > 0) {
    return `${criticalCount} KPI personnalisé critique et ${ruleAlertCount} règle déclenchée : la situation locale demande une décision prioritaire.`;
  }

  if (watchCount > 0) {
    return `${watchCount} KPI personnalisé à surveiller : la situation reste pilotable, mais certains écarts doivent être confirmés.`;
  }

  if (activeRuleCount > 0) {
    return "Les KPI personnalisés sont sous contrôle selon les règles locales actuellement actives.";
  }

  return "Les KPI personnalisés ne signalent pas de risque immédiat, mais les règles métier restent à renforcer.";
}

export function generateLocalRiskSummary(
  kpiResults: LocalKpiResult[],
  alerts: LocalKpiAlert[],
  insights: LocalInsight[]
) {
  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical");
  const criticalInsights = insights.filter((insight) => insight.severity === "critical");

  const risks = [
    ...criticalAlerts.map((alert) => `${alert.title} : ${alert.businessImpact}`),
    ...criticalInsights.map((insight) => insight.summary),
    ...kpiResults
      .filter((result) => result.status === "watch")
      .map((result) => `${kpiLabel(result)} s'écarte de la zone attendue et doit être surveillé.`)
  ];

  if (risks.length === 0 && kpiResults.length > 0) {
    risks.push("Aucun risque local prioritaire n'est détecté sur les KPI personnalisés disponibles.");
  }

  return unique(risks).slice(0, maxSummaryItems);
}

export function generateLocalActionPriorities(alerts: LocalKpiAlert[], insights: LocalInsight[]) {
  const actions = [
    ...alerts.map((alert) => alert.recommendedAction),
    ...insights.map((insight) => insight.recommendedAction)
  ];

  if (actions.length === 0) {
    actions.push("Créer ou recalculer des KPI personnalisés pour produire des priorités d'action locales.");
  }

  return unique(actions).slice(0, maxSummaryItems);
}

export function generateLocalDataReliabilitySummary(
  kpiResults: LocalKpiResult[],
  histories: LocalKpiHistoryPoint[],
  insights: LocalInsight[]
) {
  const notes: string[] = [];
  const kpisWithoutEnoughHistory = kpiResults.filter((result) =>
    histories.filter((point) => point.kpiId === result.kpiId).length < 2
  );
  const notTestedCount = kpiResults.filter((result) => result.status === "not-tested").length;
  const dataQualityInsights = insights.filter((insight) => insight.insightType === "data_quality");

  if (kpisWithoutEnoughHistory.length > 0) {
    notes.push(`${kpisWithoutEnoughHistory.length} KPI personnalisé manque encore d'historique pour confirmer une tendance.`);
  }

  if (notTestedCount > 0) {
    notes.push(`${notTestedCount} KPI local doit être recalculé avant d'être utilisé comme signal de décision.`);
  }

  notes.push(...dataQualityInsights.map((insight) => insight.summary));

  if (notes.length === 0 && kpiResults.length > 0) {
    notes.push("Les KPI locaux disposent d'assez d'éléments pour une première lecture, mais restent non persistés.");
  }

  if (kpiResults.length === 0) {
    notes.push("La fiabilité ne peut pas encore être évaluée sans KPI personnalisé calculé.");
  }

  return unique(notes).slice(0, maxSummaryItems);
}

function generateKeyFindings(kpiResults: LocalKpiResult[], insights: LocalInsight[]) {
  const findings = [
    ...insights.slice(0, maxSummaryItems).map((insight) => insight.summary),
    ...kpiResults
      .filter((result) => result.status === "healthy")
      .slice(0, 1)
      .map((result) => `${kpiLabel(result)} reste conforme avec une valeur de ${formatValue(result.value)}.`)
  ];

  if (findings.length === 0) {
    findings.push("Aucun constat local exploitable n'est disponible pour l'instant.");
  }

  return unique(findings).slice(0, maxSummaryItems);
}

function generateMemoryHighlights(insights: LocalInsight[], memoryContext?: AtlasMemoryContext) {
  const insightHighlights = insights
    .filter((insight) => insight.memoryReferences?.length)
    .flatMap((insight) =>
      (insight.memoryReferences ?? []).map((reference) =>
        `${insight.title} utilise la mémoire métier : ${reference}`
      )
    );

  const contextHighlights = [
    ...(memoryContext?.objectives.slice(0, 1).map((item) => `Objectif stratégique détecté (${item.source}) : ${item.text}`) ?? []),
    ...(memoryContext?.businessRules.slice(0, 1).map((item) => `Règle métier détectée (${item.source}) : ${item.text}`) ?? []),
    ...(memoryContext?.decisions.slice(0, 1).map((item) => `Décision historique détectée (${item.source}) : ${item.text}`) ?? [])
  ];

  return unique([...insightHighlights, ...contextHighlights]).slice(0, maxSummaryItems);
}

export function generateLocalExecutiveSummary(input: LocalExecutiveSummaryInput): LocalExecutiveSummary {
  const { kpiResults, histories, alerts, alertRules, insights, memoryContext } = input;

  return {
    id: `local-executive-summary-${input.organizationId ?? defaultOrganizationId}`,
    organizationId: input.organizationId ?? defaultOrganizationId,
    generatedAt: new Date().toISOString(),
    globalSituation: buildGlobalSituation(kpiResults, alerts, alertRules),
    mainRisks: generateLocalRiskSummary(kpiResults, alerts, insights),
    keyFindings: generateKeyFindings(kpiResults, insights),
    recommendedActions: generateLocalActionPriorities(alerts, insights),
    dataReliabilityNotes: generateLocalDataReliabilitySummary(kpiResults, histories, insights),
    memoryHighlights: generateMemoryHighlights(insights, memoryContext),
    relatedKpiIds: unique(kpiResults.map((result) => result.kpiId)),
    relatedAlertIds: unique(alerts.map((alert) => alert.id)),
    persisted: false
  };
}
