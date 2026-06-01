import { inferKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { formatVariation } from "@/lib/kpi-engine/local-kpi-trends";
import { memoryTextMatchesKpi } from "@/lib/memory/atlas-memory-engine";
import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { AtlasMemoryContext, AtlasMemoryContextItem } from "@/types/atlas-memory-context";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { LocalInsight, LocalInsightEvidence, LocalInsightSeverity } from "@/types/local-insights";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";

const defaultOrganizationId = "org-atlas-demo";
const strongVariationThreshold = 10;

function now() {
  return new Date().toISOString();
}

function formatValue(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value);
}

function getLatestPreviousPoint(result: LocalKpiResult, history: LocalKpiHistoryPoint[]) {
  return history
    .filter((point) => point.kpiId === result.kpiId)
    .sort((first, second) => new Date(second.calculatedAt).getTime() - new Date(first.calculatedAt).getTime())[1];
}

function evidenceFromResult(result: LocalKpiResult, history: LocalKpiHistoryPoint[] = []): LocalInsightEvidence {
  const previousPoint = getLatestPreviousPoint(result, history);

  return {
    kpiName: result.name,
    value: result.value,
    previousValue: previousPoint?.value,
    variation: result.variation ?? history.find((point) => point.kpiId === result.kpiId)?.variation,
    threshold: result.status === "critical" ? result.criticalThreshold : result.warningThreshold,
    direction: inferKpiDirection(result),
    source: result.sourceFileName
  };
}

function insight(input: Omit<LocalInsight, "createdAt" | "persisted">): LocalInsight {
  return {
    ...input,
    createdAt: now(),
    persisted: false
  };
}

function isNegativeForDirection(result: LocalKpiResult) {
  const variation = result.variation ?? 0;
  const direction = inferKpiDirection(result);
  if (direction === "higher_is_better") return variation <= -strongVariationThreshold;
  return variation >= strongVariationThreshold;
}

function isPositiveForDirection(result: LocalKpiResult) {
  const variation = result.variation ?? 0;
  const direction = inferKpiDirection(result);
  if (direction === "higher_is_better") return variation >= strongVariationThreshold;
  return variation <= -strongVariationThreshold;
}

function isCostLike(result: LocalKpiResult) {
  const label = `${result.name} ${result.displayFieldLabel ?? ""}`.toLowerCase();
  return label.includes("coût") || label.includes("cout");
}

export function generateRiskInsights(
  kpiResults: LocalKpiResult[],
  histories: LocalKpiHistoryPoint[],
  alerts: LocalKpiAlert[]
): LocalInsight[] {
  const criticalResults = kpiResults.filter((result) => result.status === "critical");
  const watchResults = kpiResults.filter((result) => result.status === "watch");
  const insights: LocalInsight[] = [];

  for (const result of criticalResults) {
    const relatedAlerts = alerts.filter((alert) => alert.kpiId === result.kpiId);
    insights.push(insight({
      id: `local-insight-risk-${result.kpiId}`,
      organizationId: defaultOrganizationId,
      title: isCostLike(result) ? "Coût sous pression" : `${result.name} en risque critique`,
      summary: `${result.name} atteint ${formatValue(result.value)} et pèse directement sur la lecture dirigeant.`,
      severity: "critical",
      insightType: "risk",
      relatedKpiIds: [result.kpiId],
      relatedAlertIds: relatedAlerts.map((alert) => alert.id),
      evidence: [evidenceFromResult(result, histories)],
      recommendedAction: "Qualifier la cause, confirmer le seuil métier et décider d'une action corrective prioritaire."
    }));
  }

  for (const result of watchResults) {
    insights.push(insight({
      id: `local-insight-watch-${result.kpiId}`,
      organizationId: defaultOrganizationId,
      title: `${result.name} à surveiller`,
      summary: `${result.name} n'est pas critique, mais s'écarte déjà de la zone attendue.`,
      severity: "watch",
      insightType: "performance",
      relatedKpiIds: [result.kpiId],
      relatedAlertIds: alerts.filter((alert) => alert.kpiId === result.kpiId).map((alert) => alert.id),
      evidence: [evidenceFromResult(result, histories)],
      recommendedAction: "Surveiller la prochaine période et préparer une action si l'écart se confirme."
    }));
  }

  if (criticalResults.length >= 2) {
    insights.push(insight({
      id: "local-insight-global-risk",
      organizationId: defaultOrganizationId,
      title: "Risque global sur les KPI personnalisés",
      summary: `${criticalResults.length} KPI personnalisés sont critiques en même temps.`,
      severity: "critical",
      insightType: "risk",
      relatedKpiIds: criticalResults.map((result) => result.kpiId),
      relatedAlertIds: alerts.filter((alert) => alert.severity === "critical").map((alert) => alert.id),
      evidence: criticalResults.map((result) => evidenceFromResult(result, histories)),
      recommendedAction: "Prioriser les KPI critiques qui impactent le cash, la marge ou les coûts."
    }));
  }

  return insights;
}

export function generateTrendInsights(
  kpiResults: LocalKpiResult[],
  histories: LocalKpiHistoryPoint[]
): LocalInsight[] {
  return kpiResults.flatMap((result) => {
    const history = histories.filter((point) => point.kpiId === result.kpiId);
    const direction = inferKpiDirection(result);

    if (history.length < 2) {
      return [insight({
        id: `local-insight-data-quality-${result.kpiId}`,
        organizationId: defaultOrganizationId,
        title: "Historique encore insuffisant",
        summary: `${result.name} dispose de trop peu de points pour confirmer une tendance.`,
        severity: "info",
        insightType: "data_quality",
        relatedKpiIds: [result.kpiId],
        evidence: [evidenceFromResult(result, history)],
        recommendedAction: "Recalculer ce KPI sur plusieurs imports avant d'en faire un signal de décision fort."
      })];
    }

    if (isNegativeForDirection(result)) {
      return [insight({
        id: `local-insight-trend-down-${result.kpiId}`,
        organizationId: defaultOrganizationId,
        title: direction === "lower_is_better" ? `${result.name} augmente trop vite` : `${result.name} se dégrade`,
        summary: `La variation récente est défavorable (${formatVariation(result.variation)}).`,
        severity: result.status === "critical" ? "critical" : "watch",
        insightType: "trend",
        relatedKpiIds: [result.kpiId],
        evidence: [evidenceFromResult(result, history)],
        recommendedAction: "Identifier la cause de variation et décider si un seuil d'alerte plus strict est nécessaire."
      })];
    }

    if (isPositiveForDirection(result)) {
      return [insight({
        id: `local-insight-trend-up-${result.kpiId}`,
        organizationId: defaultOrganizationId,
        title: `${result.name} s'améliore`,
        summary: `La variation récente est favorable (${formatVariation(result.variation)}).`,
        severity: "info",
        insightType: "opportunity",
        relatedKpiIds: [result.kpiId],
        evidence: [evidenceFromResult(result, history)],
        recommendedAction: "Comprendre ce qui explique l'amélioration pour la stabiliser ou la reproduire."
      })];
    }

    return [];
  });
}

export function generateAlertRuleInsights(
  kpiResults: LocalKpiResult[],
  histories: LocalKpiHistoryPoint[],
  alerts: LocalKpiAlert[],
  alertRules: LocalAlertRule[]
): LocalInsight[] {
  return alerts
    .filter((alert) => alert.alertSource === "rule")
    .map((alert) => {
      const result = kpiResults.find((item) => item.kpiId === alert.kpiId);
      const rule = alertRules.find((item) => item.id === alert.ruleId);
      const evidence = result ? [evidenceFromResult(result, histories)] : [];

      return insight({
        id: `local-insight-rule-${alert.id}`,
        organizationId: defaultOrganizationId,
        title: rule?.name ?? "Règle personnalisée déclenchée",
        summary: `${alert.condition ?? "Une règle métier"} est déclenchée sur ${result?.name ?? "un KPI personnalisé"}.`,
        severity: alert.severity === "critical" ? "critical" : "watch",
        insightType: "alert_rule",
        relatedKpiIds: [alert.kpiId],
        relatedAlertIds: [alert.id],
        evidence,
        recommendedAction: alert.recommendedAction
      });
    });
}

function findMemoryMatches(result: LocalKpiResult, memoryContext?: AtlasMemoryContext) {
  if (!memoryContext) return [];
  const label = `${result.name} ${result.displayFieldLabel ?? ""}`;
  const candidates: Array<AtlasMemoryContextItem & { kind: "objective" | "rule" | "decision" }> = [
    ...memoryContext.objectives.map((item) => ({ ...item, kind: "objective" as const })),
    ...memoryContext.businessRules.map((item) => ({ ...item, kind: "rule" as const })),
    ...memoryContext.decisions.map((item) => ({ ...item, kind: "decision" as const }))
  ];

  return candidates.filter((item) => memoryTextMatchesKpi(item.text, label));
}

const memoryKnowledgeLabels = {
  objective: "Objectif validé",
  rule: "Règle métier validée",
  decision: "Décision historique validée"
} as const;

export function generateMemoryInsights(
  kpiResults: LocalKpiResult[],
  histories: LocalKpiHistoryPoint[],
  alerts: LocalKpiAlert[],
  memoryContext?: AtlasMemoryContext
): LocalInsight[] {
  if (!memoryContext) return [];

  return kpiResults.flatMap((result) => {
    if (result.status !== "critical" && result.status !== "watch") return [];

    const matches = findMemoryMatches(result, memoryContext);
    if (matches.length === 0) return [];

    const objective = matches.find((match) => match.kind === "objective");
    const rule = matches.find((match) => match.kind === "rule");
    const decision = matches.find((match) => match.kind === "decision");
    const sourceItems = [objective, rule, decision].filter(Boolean) as typeof matches;
    const sourceLabels = Array.from(new Set(sourceItems.map((item) => item.source)));
    const relatedAlerts = alerts.filter((alert) => alert.kpiId === result.kpiId);

    return [insight({
      id: `local-insight-memory-${result.kpiId}`,
      organizationId: defaultOrganizationId,
      title: `${result.name} confronté à la mémoire métier`,
      summary: objective
        ? `${result.name} est en contradiction possible avec l'objectif déclaré : ${objective.text}`
        : `${result.name} recoupe une connaissance métier documentée dans Atlas Memory.`,
      severity: result.status === "critical" ? "critical" : "watch",
      insightType: "risk",
      relatedKpiIds: [result.kpiId],
      relatedAlertIds: relatedAlerts.map((alert) => alert.id),
      memorySources: sourceLabels,
      memoryReferences: sourceItems.map((item) => item.text),
      memoryKnowledgeLabels: sourceItems.map((item) => memoryKnowledgeLabels[item.kind]),
      evidence: [evidenceFromResult(result, histories)],
      recommendedAction: rule
        ? `Appliquer ou revoir la règle métier documentée : ${rule.text}`
        : decision
          ? `Comparer la situation avec la décision historique : ${decision.text}`
          : "Relire l'objectif mémoire lié et décider si le plan d'action doit être renforcé."
    })];
  });
}

export function generateLocalKpiInsights(
  kpiResults: LocalKpiResult[],
  histories: LocalKpiHistoryPoint[],
  alerts: LocalKpiAlert[],
  alertRules: LocalAlertRule[],
  memoryContext?: AtlasMemoryContext
): LocalInsight[] {
  return rankLocalInsights([
    ...generateRiskInsights(kpiResults, histories, alerts),
    ...generateTrendInsights(kpiResults, histories),
    ...generateAlertRuleInsights(kpiResults, histories, alerts, alertRules),
    ...generateMemoryInsights(kpiResults, histories, alerts, memoryContext)
  ]);
}

function severityScore(severity: LocalInsightSeverity) {
  if (severity === "critical") return 100;
  if (severity === "watch") return 60;
  return 20;
}

function typeScore(localInsight: LocalInsight) {
  if (localInsight.insightType === "alert_rule") return 50;
  if (localInsight.insightType === "trend" && localInsight.severity !== "info") return 40;
  if (localInsight.insightType === "risk") return 35;
  if (localInsight.insightType === "performance") return 25;
  if (localInsight.insightType === "opportunity") return 10;
  return 0;
}

export function rankLocalInsights(insights: LocalInsight[]) {
  return [...insights].sort((first, second) => {
    const firstScore = severityScore(first.severity) + typeScore(first);
    const secondScore = severityScore(second.severity) + typeScore(second);
    return secondScore - firstScore;
  });
}

export function generateExecutiveLocalSummary(insights: LocalInsight[]) {
  const criticalCount = insights.filter((insightItem) => insightItem.severity === "critical").length;
  const watchCount = insights.filter((insightItem) => insightItem.severity === "watch").length;
  const ruleCount = insights.filter((insightItem) => insightItem.insightType === "alert_rule").length;

  if (criticalCount > 0) {
    return `${criticalCount} signal critique et ${ruleCount} règle personnalisée déclenchée : les KPI locaux doivent être priorisés dans la prochaine décision.`;
  }
  if (watchCount > 0) {
    return `${watchCount} signal à surveiller : les KPI locaux enrichissent la lecture dirigeant sans créer d'urgence immédiate.`;
  }
  if (insights.length > 0) {
    return "Les KPI locaux apportent surtout des signaux de tendance ou de fiabilité à confirmer.";
  }
  return "Aucun insight local disponible : créez ou recalculez des KPI personnalisés pour produire une lecture dirigeant.";
}
