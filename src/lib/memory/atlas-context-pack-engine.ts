import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { AtlasContextPack, AtlasContextPurpose, AtlasContextSource } from "@/types/atlas-context-pack";
import type { AtlasMemoryDocument, AtlasMemoryDocumentKey } from "@/types/atlas-memory";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { LocalInsight } from "@/types/local-insights";
import type { LocalKpiConfiguration } from "@/types/local-kpi";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalPriorityItem } from "@/types/local-priorities";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type { LocalRecommendation } from "@/types/local-recommendations";
import type { RecommendationConfidence } from "@/types/recommendation-confidence";

type ContextPackInput = {
  organizationId: string;
  documents: AtlasMemoryDocument[];
  knowledgeItems: AtlasKnowledgeItem[];
  kpiConfigurations?: LocalKpiConfiguration[];
  kpiResults?: LocalKpiResult[];
  alerts?: LocalKpiAlert[];
  alertRules?: LocalAlertRule[];
  insights?: LocalInsight[];
  recommendations?: LocalRecommendation[];
  recommendationFeedback?: LocalRecommendationFeedback[];
  recommendationConfidence?: RecommendationConfidence[];
  actionPlans?: LocalActionPlan[];
  actionPlanImpacts?: LocalActionPlanImpact[];
  decisionJournalEntries?: DecisionJournalEntry[];
  priorities?: LocalPriorityItem[];
};

const purposeConfig: Record<AtlasContextPurpose, {
  title: string;
  documents: AtlasMemoryDocumentKey[];
  keywords: string[];
}> = {
  kpi_analysis: {
    title: "Analyse KPI",
    documents: ["kpi.md", "objectifs.md", "regles_metier.md", "strategie.md"],
    keywords: ["kpi", "marge", "cash", "retard", "satisfaction", "cout", "coût", "objectif"]
  },
  executive_summary: {
    title: "Synthèse dirigeant",
    documents: ["entreprise.md", "strategie.md", "objectifs.md", "historique_decisions.md", "kpi.md"],
    keywords: ["strategie", "stratégie", "objectif", "decision", "décision", "marge", "cash", "risque"]
  },
  risk_review: {
    title: "Revue des risques",
    documents: ["regles_metier.md", "historique_decisions.md", "clients.md", "fournisseurs.md"],
    keywords: ["risque", "retard", "marge", "sous-traitance", "client", "fournisseur", "critique"]
  },
  copil_preparation: {
    title: "Préparation COPIL",
    documents: ["strategie.md", "objectifs.md", "processus.md", "historique_decisions.md", "kpi.md"],
    keywords: ["priorite", "priorité", "objectif", "decision", "décision", "processus", "kpi"]
  },
  operational_recommendations: {
    title: "Recommandations opérationnelles",
    documents: ["processus.md", "regles_metier.md", "equipe.md", "fournisseurs.md"],
    keywords: ["processus", "operation", "opération", "retard", "intervention", "equipe", "équipe", "fournisseur"]
  },
  commercial_review: {
    title: "Revue commerciale",
    documents: ["clients.md", "offres.md", "strategie.md", "objectifs.md"],
    keywords: ["client", "offre", "contrat", "satisfaction", "commercial", "renouvellement"]
  }
};

function now() {
  return new Date().toISOString();
}

function excerpt(value: string, limit = 220) {
  const cleanValue = value.replace(/\s+/g, " ").trim();
  return cleanValue.length > limit ? `${cleanValue.slice(0, limit)}...` : cleanValue;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesAnyKeyword(value: string, keywords: string[]) {
  const normalizedValue = normalize(value);
  return keywords.some((keyword) => normalizedValue.includes(normalize(keyword)));
}

function documentSource(document: AtlasMemoryDocument): AtlasContextSource {
  return {
    type: "document",
    id: document.id,
    title: document.title,
    sourceDocument: document.key,
    excerpt: excerpt(document.description || document.content)
  };
}

function knowledgeSource(item: AtlasKnowledgeItem): AtlasContextSource {
  return {
    type: "knowledge",
    id: item.id,
    title: item.type === "business_rule" ? "Règle métier validée" : item.type === "objective" ? "Objectif validé" : item.type === "decision" ? "Décision validée" : "Glossaire validé",
    sourceDocument: item.sourceDocument,
    excerpt: excerpt(item.value),
    status: item.status
  };
}

function kpiSource(result: LocalKpiResult): AtlasContextSource {
  return {
    type: "kpi",
    id: result.kpiId,
    title: result.name,
    excerpt: `${result.value} - statut ${result.status}`,
    status: result.status === "critical" ? "critical" : result.status === "watch" ? "warning" : undefined
  };
}

function kpiConfigurationSource(configuration: LocalKpiConfiguration): AtlasContextSource {
  return {
    type: "kpi",
    id: configuration.id,
    title: configuration.name,
    excerpt: `Objectif ${configuration.targetValue}, seuil surveillance ${configuration.warningThreshold}, seuil critique ${configuration.criticalThreshold}`
  };
}

function alertSource(alert: LocalKpiAlert): AtlasContextSource {
  return {
    type: "alert",
    id: alert.id,
    title: alert.title,
    excerpt: alert.cause,
    status: alert.severity
  };
}

function ruleSource(rule: LocalAlertRule): AtlasContextSource {
  return {
    type: "rule",
    id: rule.id,
    title: rule.name,
    excerpt: rule.condition,
    status: rule.isActive ? "active" : "inactive"
  };
}

function recommendationSource(recommendation: LocalRecommendation): AtlasContextSource {
  return {
    type: "recommendation",
    id: recommendation.id,
    title: recommendation.title,
    excerpt: `${recommendation.summary} Impact attendu : ${recommendation.expectedImpact}`,
    status: recommendation.priority === "critical" ? "critical" : recommendation.priority === "high" ? "warning" : undefined
  };
}

function recommendationFeedbackSource(feedback: LocalRecommendationFeedback): AtlasContextSource {
  return {
    type: "recommendation_feedback",
    id: feedback.id,
    title: `Feedback recommandation ${feedback.recommendationId}`,
    excerpt: `Pertinence : ${feedback.relevance}. Action : ${feedback.actionTaken}. Impact : ${feedback.impactObserved}.${feedback.comment ? ` Commentaire : ${feedback.comment}` : ""}`,
    status: feedback.relevance === "not_relevant" || feedback.impactObserved === "negative" ? "warning" : feedback.actionTaken === "yes" ? "active" : undefined
  };
}

function recommendationConfidenceSource(confidence: RecommendationConfidence): AtlasContextSource {
  return {
    type: "recommendation_confidence",
    id: `confidence-${confidence.recommendationId}`,
    title: `Confiance recommandation ${confidence.recommendationId}`,
    excerpt: `Score ${confidence.score} %. Niveau ${confidence.level}. ${confidence.factors.slice(0, 3).map((factor) => factor.label).join(", ")}`,
    status: confidence.level === "low" ? "warning" : confidence.level === "medium" ? "active" : "active"
  };
}

function actionPlanSource(plan: LocalActionPlan): AtlasContextSource {
  return {
    type: "action_plan",
    id: plan.id,
    title: plan.title,
    excerpt: `${plan.description} Impact attendu : ${plan.expectedImpact}`,
    status: plan.status === "done" ? "active" : plan.priority === "critical" ? "critical" : plan.priority === "high" ? "warning" : undefined
  };
}

function actionPlanImpactSource(impact: LocalActionPlanImpact): AtlasContextSource {
  return {
    type: "action_plan_impact",
    id: impact.id,
    title: `Impact plan ${impact.actionPlanId}`,
    excerpt: `${impact.interpretation} Variation : ${impact.variation === undefined ? "non disponible" : `${impact.variation.toFixed(1)}%`}`,
    status: impact.status === "positive" ? "active" : impact.status === "negative" ? "critical" : impact.status === "pending" ? "warning" : undefined
  };
}

function decisionHistorySource(entry: DecisionJournalEntry): AtlasContextSource {
  return {
    type: "decision_history",
    id: entry.id,
    title: entry.title,
    excerpt: `${entry.description} Source : ${entry.sourceType}.`,
    status: entry.type === "memory_knowledge_rejected" ? "warning" : entry.priority === "critical" ? "critical" : undefined
  };
}

function prioritySource(priority: LocalPriorityItem): AtlasContextSource {
  return {
    type: "priority",
    id: priority.id,
    title: `#${priority.rank} ${priority.title}`,
    excerpt: `Score ${priority.priorityScore}/100. ${priority.summary} Action suivante : ${priority.recommendedNextAction}`,
    status: priority.urgency === "critical" ? "critical" : priority.urgency === "high" ? "warning" : undefined
  };
}

function filterKnowledge(
  approvedKnowledge: AtlasKnowledgeItem[],
  config: typeof purposeConfig[AtlasContextPurpose]
) {
  return approvedKnowledge.filter((item) =>
    config.documents.includes(item.sourceDocument) || includesAnyKeyword(item.value, config.keywords)
  );
}

function filterAlerts(purpose: AtlasContextPurpose, alerts: LocalKpiAlert[]) {
  if (purpose === "risk_review") return alerts.filter((alert) => alert.severity === "critical");
  return alerts;
}

function filterRules(purpose: AtlasContextPurpose, rules: LocalAlertRule[]) {
  if (purpose === "commercial_review") return [];
  if (purpose === "risk_review") return rules.filter((rule) => rule.severity === "critical" || rule.isActive);
  return rules.filter((rule) => rule.isActive);
}

function filterRecommendations(purpose: AtlasContextPurpose, recommendations: LocalRecommendation[]) {
  if (purpose === "operational_recommendations") return recommendations;
  if (purpose === "risk_review") return recommendations.filter((item) => item.priority === "critical" || item.category === "risk");
  if (purpose === "executive_summary") return recommendations.filter((item) => item.priority === "critical" || item.priority === "high");
  return [];
}

function filterRecommendationFeedback(purpose: AtlasContextPurpose, feedbackItems: LocalRecommendationFeedback[]) {
  if (purpose === "operational_recommendations") return feedbackItems;
  if (purpose === "executive_summary") return feedbackItems;
  if (purpose === "risk_review") return feedbackItems.filter((feedback) =>
    feedback.relevance === "not_relevant" || feedback.actionTaken === "no" || feedback.impactObserved === "negative"
  );
  if (purpose === "copil_preparation") return feedbackItems;
  return [];
}

function filterRecommendationConfidence(purpose: AtlasContextPurpose, confidenceItems: RecommendationConfidence[]) {
  if (purpose === "executive_summary") return confidenceItems;
  if (purpose === "operational_recommendations") return confidenceItems;
  if (purpose === "risk_review") return confidenceItems.filter((confidence) => confidence.level === "low" || confidence.score < 75);
  return [];
}

function filterActionPlans(purpose: AtlasContextPurpose, actionPlans: LocalActionPlan[]) {
  if (purpose === "operational_recommendations") return actionPlans;
  if (purpose === "risk_review") return actionPlans.filter((plan) => plan.priority === "critical" || plan.priority === "high");
  if (purpose === "executive_summary") return actionPlans.filter((plan) => plan.status !== "cancelled");
  return [];
}

function filterActionPlanImpacts(purpose: AtlasContextPurpose, impacts: LocalActionPlanImpact[]) {
  if (purpose === "executive_summary") return impacts;
  if (purpose === "operational_recommendations") return impacts;
  if (purpose === "risk_review") return impacts.filter((impact) => impact.status === "negative" || impact.status === "pending");
  if (purpose === "copil_preparation") return impacts;
  return [];
}

function filterDecisionHistory(purpose: AtlasContextPurpose, entries: DecisionJournalEntry[]) {
  if (purpose === "executive_summary") return entries.slice(0, 10);
  if (purpose === "copil_preparation") return entries.slice(0, 12);
  if (purpose === "operational_recommendations") {
    return entries.filter((entry) =>
      entry.type === "recommendation_created" ||
      entry.type === "action_plan_created" ||
      entry.type === "action_plan_updated" ||
      entry.type === "impact_measured" ||
      entry.type === "feedback_recorded"
    ).slice(0, 10);
  }
  return [];
}

function filterPriorities(purpose: AtlasContextPurpose, priorities: LocalPriorityItem[]) {
  if (purpose === "executive_summary") return priorities.slice(0, 5);
  if (purpose === "risk_review") return priorities.filter((priority) => priority.urgency === "critical" || priority.category === "risk").slice(0, 8);
  if (purpose === "copil_preparation") return priorities.slice(0, 8);
  if (purpose === "operational_recommendations") return priorities.filter((priority) => priority.sourceTypes.includes("recommendation")).slice(0, 8);
  return [];
}

function buildLimitations(input: {
  approvedKnowledge: AtlasKnowledgeItem[];
  includedKnowledge: AtlasContextSource[];
  includedKpis: AtlasContextSource[];
  includedAlerts: AtlasContextSource[];
  includedRules: AtlasContextSource[];
  includedRecommendations: AtlasContextSource[];
  includedRecommendationFeedback: AtlasContextSource[];
  includedRecommendationConfidence: AtlasContextSource[];
  includedActionPlans: AtlasContextSource[];
  includedActionPlanImpacts: AtlasContextSource[];
  includedDecisionHistory: AtlasContextSource[];
  includedPriorities: AtlasContextSource[];
  rawKnowledgeItems: AtlasKnowledgeItem[];
}) {
  const limitations: string[] = [];
  const pendingKnowledgeCount = input.rawKnowledgeItems.filter((item) => item.status === "detected").length;
  const rejectedKnowledgeCount = input.rawKnowledgeItems.filter((item) => item.status === "rejected").length;

  if (input.approvedKnowledge.length === 0) limitations.push("Aucune connaissance validée disponible dans Atlas Memory.");
  if (input.includedKnowledge.length === 0) limitations.push("Aucune connaissance validée pertinente pour ce contexte.");
  if (input.includedKpis.length === 0) limitations.push("Aucun KPI local disponible pour enrichir ce contexte.");
  if (input.includedAlerts.length === 0) limitations.push("Aucune alerte locale disponible pour ce contexte.");
  if (input.includedRules.length === 0) limitations.push("Aucune règle d'alerte active pertinente pour ce contexte.");
  if (input.includedRecommendations.length === 0) limitations.push("Aucune recommandation déterministe incluse dans ce contexte.");
  if (input.includedRecommendationFeedback.length === 0) limitations.push("Aucun feedback utilisateur sur recommandation inclus dans ce contexte.");
  if (input.includedRecommendationConfidence.length === 0) limitations.push("Aucun score de confiance de recommandation inclus dans ce contexte.");
  if (input.includedActionPlans.length === 0) limitations.push("Aucun plan d'action local inclus dans ce contexte.");
  if (input.includedActionPlanImpacts.length === 0) limitations.push("Aucun impact de plan d'action mesuré inclus dans ce contexte.");
  if (input.includedDecisionHistory.length === 0) limitations.push("Aucun historique décisionnel local inclus dans ce contexte.");
  if (pendingKnowledgeCount > 0) limitations.push(`${pendingKnowledgeCount} connaissance(s) détectée(s) ignorée(s) car non validée(s).`);
  if (rejectedKnowledgeCount > 0) limitations.push(`${rejectedKnowledgeCount} connaissance(s) rejetée(s) exclue(s).`);

  if (input.includedPriorities.length === 0) limitations.push("Aucune prioritÃ© Atlas incluse dans ce contexte.");

  return limitations;
}

function buildSummary(title: string, counts: {
  documents: number;
  knowledge: number;
  kpis: number;
  alerts: number;
  rules: number;
  recommendations: number;
  recommendationFeedback: number;
  recommendationConfidence: number;
  actionPlans: number;
  actionPlanImpacts: number;
  decisionHistory: number;
}) {
  return `${title} préparé avec ${counts.documents} document(s), ${counts.knowledge} connaissance(s) validée(s), ${counts.kpis} KPI, ${counts.alerts} alerte(s), ${counts.rules} règle(s), ${counts.recommendations} recommandation(s), ${counts.recommendationFeedback} feedback(s), ${counts.recommendationConfidence} score(s) de confiance, ${counts.actionPlans} plan(s) d'action, ${counts.actionPlanImpacts} impact(s) mesuré(s) et ${counts.decisionHistory} événement(s) décisionnel(s).`;
}

export function buildAtlasContextPack(
  purpose: AtlasContextPurpose,
  input: ContextPackInput
): AtlasContextPack {
  const config = purposeConfig[purpose];
  const approvedKnowledge = input.knowledgeItems.filter((item) => item.status === "approved");
  const includedDocuments = input.documents
    .filter((document) => config.documents.includes(document.key))
    .map(documentSource);
  const includedKnowledge = filterKnowledge(approvedKnowledge, config).map(knowledgeSource);
  const includedKpis = [
    ...(input.kpiResults ?? []).map(kpiSource),
    ...(input.kpiConfigurations ?? []).filter((configuration) => !(input.kpiResults ?? []).some((result) => result.kpiId === configuration.id)).map(kpiConfigurationSource)
  ];
  const includedAlerts = filterAlerts(purpose, input.alerts ?? []).map(alertSource);
  const includedRules = filterRules(purpose, input.alertRules ?? []).map(ruleSource);
  const includedRecommendations = filterRecommendations(purpose, input.recommendations ?? []).map(recommendationSource);
  const includedRecommendationFeedback = filterRecommendationFeedback(purpose, input.recommendationFeedback ?? []).map(recommendationFeedbackSource);
  const includedRecommendationConfidence = filterRecommendationConfidence(purpose, input.recommendationConfidence ?? []).map(recommendationConfidenceSource);
  const includedActionPlans = filterActionPlans(purpose, input.actionPlans ?? []).map(actionPlanSource);
  const includedActionPlanImpacts = filterActionPlanImpacts(purpose, input.actionPlanImpacts ?? []).map(actionPlanImpactSource);
  const includedDecisionHistory = filterDecisionHistory(purpose, input.decisionJournalEntries ?? []).map(decisionHistorySource);
  const includedPriorities = filterPriorities(purpose, input.priorities ?? []).map(prioritySource);
  const limitations = buildLimitations({
    approvedKnowledge,
    includedKnowledge,
    includedKpis,
    includedAlerts,
    includedRules,
    includedRecommendations,
    includedRecommendationFeedback,
    includedRecommendationConfidence,
    includedActionPlans,
    includedActionPlanImpacts,
    includedDecisionHistory,
    includedPriorities,
    rawKnowledgeItems: input.knowledgeItems
  });

  return {
    id: `${input.organizationId}-${purpose}`,
    organizationId: input.organizationId,
    purpose,
    title: config.title,
    generatedAt: now(),
    includedDocuments,
    includedKnowledge,
    includedKpis,
    includedAlerts,
    includedRules,
    includedRecommendations,
    includedRecommendationFeedback,
    includedRecommendationConfidence,
    includedActionPlans,
    includedActionPlanImpacts,
    includedDecisionHistory,
    includedPriorities,
    summary: buildSummary(config.title, {
      documents: includedDocuments.length,
      knowledge: includedKnowledge.length,
      kpis: includedKpis.length,
      alerts: includedAlerts.length,
      rules: includedRules.length,
      recommendations: includedRecommendations.length,
      recommendationFeedback: includedRecommendationFeedback.length,
      recommendationConfidence: includedRecommendationConfidence.length,
      actionPlans: includedActionPlans.length,
      actionPlanImpacts: includedActionPlanImpacts.length,
      decisionHistory: includedDecisionHistory.length
    }),
    limitations,
    persisted: false
  };
}

export function buildKpiAnalysisContext(input: ContextPackInput) {
  return buildAtlasContextPack("kpi_analysis", input);
}

export function buildExecutiveSummaryContext(input: ContextPackInput) {
  return buildAtlasContextPack("executive_summary", input);
}

export function buildRiskReviewContext(input: ContextPackInput) {
  return buildAtlasContextPack("risk_review", input);
}

export function buildCopilPreparationContext(input: ContextPackInput) {
  return buildAtlasContextPack("copil_preparation", input);
}

export function buildOperationalRecommendationsContext(input: ContextPackInput) {
  return buildAtlasContextPack("operational_recommendations", input);
}

export function buildCommercialReviewContext(input: ContextPackInput) {
  return buildAtlasContextPack("commercial_review", input);
}
