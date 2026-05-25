import type { ActionPlanItem, Alert } from "@/types/atlas";

export function generateRecommendationsFromAlerts(
  alerts: Alert[],
  organizationId: string
): ActionPlanItem[] {
  return alerts.slice(0, 5).map((alert, index) => ({
    id: `engine-reco-${alert.id}`,
    organizationId,
    title: alert.recommendedDecision,
    owner: "Direction",
    dueDate: index < 2 ? "7 jours" : "30 jours",
    priority: alert.severity === "critical" ? "high" : "medium",
    status: "todo",
    expectedImpact: alert.title
  }));
}

export function summarizeRecommendedDecisions(recommendations: ActionPlanItem[]) {
  if (recommendations.length === 0) {
    return "Aucune décision prioritaire détectée sur les données normalisées.";
  }

  return `${recommendations.length} décisions recommandées à intégrer au plan d'action.`;
}

// TODO Phase 4: brancher Atlas IA en lecture seule sur les données normalisées et recommandations.
