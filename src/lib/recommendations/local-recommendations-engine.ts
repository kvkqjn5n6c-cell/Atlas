import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { AtlasContextPack } from "@/types/atlas-context-pack";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { LocalExecutiveSummary } from "@/types/local-executive-summary";
import type { LocalInsight } from "@/types/local-insights";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalRecommendation, RecommendationPriority } from "@/types/local-recommendations";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";

type RecommendationInput = {
  organizationId?: string;
  kpiResults: LocalKpiResult[];
  histories?: LocalKpiHistoryPoint[];
  alerts?: LocalKpiAlert[];
  alertRules?: LocalAlertRule[];
  insights?: LocalInsight[];
  executiveSummary?: LocalExecutiveSummary;
  approvedMemoryKnowledge?: AtlasKnowledgeItem[];
  contextPacks?: AtlasContextPack[];
  datasetGroupByInsights?: DatasetGroupByInsight[];
};

const defaultOrganizationId = "org-atlas-demo";

function now() {
  return new Date().toISOString();
}

function normalizedLabel(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isLabelLike(result: LocalKpiResult, keywords: string[]) {
  const label = normalizedLabel(`${result.name} ${result.displayFieldLabel ?? ""}`);
  return keywords.some((keyword) => label.includes(normalizedLabel(keyword)));
}

function valueEvidence(result: LocalKpiResult) {
  return {
    type: "kpi" as const,
    label: result.name,
    value: result.value,
    source: result.sourceFileName
  };
}

function alertEvidence(alert: LocalKpiAlert) {
  return {
    type: "alert" as const,
    label: alert.title,
    value: alert.severity,
    source: alert.sourceFileName
  };
}

function insightEvidence(insight: LocalInsight) {
  return {
    type: "insight" as const,
    label: insight.title,
    value: insight.summary
  };
}

function groupByInsightEvidence(insight: DatasetGroupByInsight) {
  return {
    type: "dataset_groupby_insight" as const,
    label: insight.title,
    value: insight.value,
    source: insight.groupByAnalysisId
  };
}

function recommendation(input: Omit<LocalRecommendation, "createdAt" | "persisted" | "organizationId"> & { organizationId?: string }): LocalRecommendation {
  return {
    ...input,
    organizationId: input.organizationId ?? defaultOrganizationId,
    createdAt: now(),
    persisted: false
  };
}

export function generateCostRecommendations(input: RecommendationInput): LocalRecommendation[] {
  return input.kpiResults
    .filter((result) => result.status === "critical" && isLabelLike(result, ["cout", "coût", "sous-traitance", "fournisseur"]))
    .map((result) => {
      const relatedAlerts = (input.alerts ?? []).filter((alert) => alert.kpiId === result.kpiId);

      return recommendation({
        id: `local-rec-cost-${result.kpiId}`,
        organizationId: input.organizationId,
        title: "Analyser les postes de coût prioritaires",
        summary: `${result.name} est critique et doit être rapproché des postes ou fournisseurs qui créent l'écart.`,
        priority: result.value >= (result.criticalThreshold ?? result.value) ? "critical" : "high",
        category: "cost",
        sourceType: "kpi",
        relatedKpiIds: [result.kpiId],
        relatedAlertIds: relatedAlerts.map((alert) => alert.id),
        relatedInsightIds: (input.insights ?? []).filter((insight) => insight.relatedKpiIds.includes(result.kpiId)).map((insight) => insight.id),
        relatedMemoryReferences: (input.insights ?? []).flatMap((insight) => insight.memoryReferences ?? []),
        evidence: [valueEvidence(result), ...relatedAlerts.map(alertEvidence)],
        recommendedActions: [
          {
            label: "Isoler les 3 postes de coût les plus élevés",
            description: "Comparer les lignes importées, les fournisseurs ou les zones qui pèsent le plus sur ce KPI.",
            ownerSuggestion: "Direction / opérations",
            timeframe: "48 h"
          },
          {
            label: "Renégocier ou plafonner les recours externes",
            description: "Prioriser les contrats ou interventions qui dépassent le seuil critique.",
            ownerSuggestion: "Direction",
            timeframe: "7 jours"
          }
        ],
        expectedImpact: "Réduire la pression coût et protéger la marge opérationnelle.",
        effort: "medium",
        urgency: "immediate"
      });
    });
}

export function generateMarginRecommendations(input: RecommendationInput): LocalRecommendation[] {
  return input.kpiResults
    .filter((result) => (result.status === "watch" || result.status === "critical") && isLabelLike(result, ["marge", "rentabilite", "rentabilité"]))
    .map((result) => recommendation({
      id: `local-rec-margin-${result.kpiId}`,
      organizationId: input.organizationId,
      title: "Identifier les missions ou clients à faible marge",
      summary: `${result.name} s'écarte de la zone attendue. Atlas recommande de segmenter les causes par client, mission ou offre.`,
      priority: result.status === "critical" ? "critical" : "high",
      category: "margin",
      sourceType: "kpi",
      relatedKpiIds: [result.kpiId],
      relatedAlertIds: (input.alerts ?? []).filter((alert) => alert.kpiId === result.kpiId).map((alert) => alert.id),
      relatedInsightIds: (input.insights ?? []).filter((insight) => insight.relatedKpiIds.includes(result.kpiId)).map((insight) => insight.id),
      relatedMemoryReferences: [],
      evidence: [valueEvidence(result)],
      recommendedActions: [
        {
          label: "Lister les clients ou missions sous le seuil",
          description: "Comparer les marges par segment avant d'engager une correction large.",
          ownerSuggestion: "Direction",
          timeframe: "7 jours"
        }
      ],
      expectedImpact: "Cibler les pertes de marge sans transformer tout le pilotage en audit comptable.",
      effort: "medium",
      urgency: result.status === "critical" ? "immediate" : "high"
    }));
}

export function generateQualityRecommendations(input: RecommendationInput): LocalRecommendation[] {
  return input.kpiResults
    .filter((result) => (result.status === "watch" || result.status === "critical" || (result.variation ?? 0) < -10) && isLabelLike(result, ["satisfaction", "qualite", "qualité"]))
    .map((result) => recommendation({
      id: `local-rec-quality-${result.kpiId}`,
      organizationId: input.organizationId,
      title: "Analyser les retours clients récents",
      summary: `${result.name} signale une dégradation ou un niveau à surveiller côté qualité perçue.`,
      priority: result.status === "critical" ? "high" : "medium",
      category: "quality",
      sourceType: "kpi",
      relatedKpiIds: [result.kpiId],
      relatedAlertIds: (input.alerts ?? []).filter((alert) => alert.kpiId === result.kpiId).map((alert) => alert.id),
      relatedInsightIds: [],
      relatedMemoryReferences: [],
      evidence: [valueEvidence(result)],
      recommendedActions: [
        {
          label: "Relire les retours clients des 30 derniers jours",
          description: "Identifier les motifs récurrents avant de modifier le processus opérationnel.",
          ownerSuggestion: "Qualité / opérations",
          timeframe: "7 jours"
        }
      ],
      expectedImpact: "Réduire les signaux faibles qualité avant qu'ils ne deviennent un risque commercial.",
      effort: "medium",
      urgency: "high"
    }));
}

export function generateRiskRecommendations(input: RecommendationInput): LocalRecommendation[] {
  return (input.alerts ?? [])
    .filter((alert) => alert.alertSource === "rule")
    .map((alert) => {
      const rule = (input.alertRules ?? []).find((item) => item.id === alert.ruleId);

      return recommendation({
        id: `local-rec-rule-${alert.id}`,
        organizationId: input.organizationId,
        title: rule?.name ?? "Traiter la règle personnalisée déclenchée",
        summary: `La règle "${rule?.name ?? alert.ruleName ?? "personnalisée"}" est déclenchée et doit être traitée explicitement.`,
        priority: alert.severity === "critical" ? "critical" : "high",
        category: "risk",
        sourceType: "rule",
        relatedKpiIds: [alert.kpiId],
        relatedAlertIds: [alert.id],
        relatedInsightIds: (input.insights ?? []).filter((insight) => insight.relatedAlertIds?.includes(alert.id)).map((insight) => insight.id),
        relatedMemoryReferences: [],
        evidence: [alertEvidence(alert), ...(rule ? [{ type: "rule" as const, label: rule.name, value: rule.condition }] : [])],
        recommendedActions: [
          {
            label: alert.recommendedAction,
            description: "Transformer la règle déclenchée en action courte et vérifiable.",
            ownerSuggestion: "Responsable du KPI",
            timeframe: alert.severity === "critical" ? "48 h" : "7 jours"
          }
        ],
        expectedImpact: "Réduire le risque signalé par une règle métier déjà configurée.",
        effort: "low",
        urgency: alert.severity === "critical" ? "immediate" : "high"
      });
    });
}

export function generateDataQualityRecommendations(input: RecommendationInput): LocalRecommendation[] {
  const dataQualityInsights = (input.insights ?? []).filter((insight) => insight.insightType === "data_quality");
  if (dataQualityInsights.length === 0) return [];

  return [recommendation({
    id: "local-rec-data-quality-history",
    organizationId: input.organizationId,
    title: "Consolider l'historique avant décision lourde",
    summary: `${dataQualityInsights.length} signal indique que l'historique ou la fiabilité locale reste insuffisante.`,
    priority: "medium",
    category: "data_quality",
    sourceType: "insight",
    relatedKpiIds: dataQualityInsights.flatMap((insight) => insight.relatedKpiIds),
    relatedAlertIds: [],
    relatedInsightIds: dataQualityInsights.map((insight) => insight.id),
    relatedMemoryReferences: [],
    evidence: dataQualityInsights.map(insightEvidence),
    recommendedActions: [
      {
        label: "Recalculer les KPI sur plusieurs imports",
        description: "Créer au moins deux points historiques supplémentaires avant d'engager une décision structurante.",
        ownerSuggestion: "Consultant Atlas",
        timeframe: "Prochain cycle d'import"
      }
    ],
    expectedImpact: "Éviter une décision disproportionnée basée sur un échantillon local trop court.",
    effort: "low",
    urgency: "medium"
  })];
}

export function generateStrategyRecommendations(input: RecommendationInput): LocalRecommendation[] {
  return (input.insights ?? [])
    .filter((insight) => insight.memoryReferences?.length)
    .map((insight) => recommendation({
      id: `local-rec-strategy-${insight.id}`,
      organizationId: input.organizationId,
      title: "Aligner le plan d'action avec l'objectif stratégique",
      summary: `${insight.title} recoupe une connaissance mémoire validée. L'action doit rester cohérente avec cet objectif.`,
      priority: insight.severity === "critical" ? "high" : "medium",
      category: "strategy",
      sourceType: "memory",
      relatedKpiIds: insight.relatedKpiIds,
      relatedAlertIds: insight.relatedAlertIds ?? [],
      relatedInsightIds: [insight.id],
      relatedMemoryReferences: insight.memoryReferences ?? [],
      evidence: [insightEvidence(insight), ...(insight.memoryReferences ?? []).map((reference) => ({ type: "memory" as const, label: "Connaissance mémoire validée", value: reference }))],
      recommendedActions: [
        {
          label: "Relier la correction à l'objectif mémoire",
          description: "Vérifier que l'action choisie ne traite pas seulement le symptôme mais respecte l'objectif validé.",
          ownerSuggestion: "Direction",
          timeframe: "7 jours"
        }
      ],
      expectedImpact: "Transformer une alerte locale en décision alignée avec la stratégie documentée.",
      effort: "medium",
      urgency: insight.severity === "critical" ? "high" : "medium"
    }));
}

function groupByInsightPriority(insight: DatasetGroupByInsight): RecommendationPriority {
  if (insight.severity === "critical") return "high";
  if (insight.severity === "watch") return "medium";
  return "low";
}

function groupByInsightAction(insight: DatasetGroupByInsight) {
  if (insight.insightType === "concentration") {
    return {
      title: `Analyser la concentration observee sur ${insight.groupValue}`,
      summary: `${insight.summary} Atlas recommande de comprendre pourquoi ce groupe concentre une part importante du signal compare.`,
      action: "Identifier les causes de concentration",
      description: "Comparer les volumes, couts ou pratiques du groupe concerne avec les autres groupes avant arbitrage.",
      impact: "Reduire un risque de dependance ou de concentration operationnelle."
    };
  }

  if (insight.insightType === "weak_group") {
    return {
      title: "Examiner le groupe le moins performant",
      summary: `${insight.groupValue} ressort comme groupe faible dans l'analyse comparative.`,
      action: "Comparer le groupe faible aux meilleurs groupes",
      description: "Identifier les ecarts de pratiques, de portefeuille ou de donnees qui expliquent la sous-performance.",
      impact: "Cibler l'effort d'amelioration sur le groupe qui tire la performance vers le bas."
    };
  }

  if (insight.insightType === "anomaly_candidate") {
    return {
      title: "Auditer le groupe atypique",
      summary: `${insight.groupValue} se distingue fortement du reste du dataset et merite une verification metier.`,
      action: "Verifier le groupe atypique",
      description: "Controler les donnees et qualifier si l'ecart est une anomalie, une opportunite ou un risque reel.",
      impact: "Eviter une decision basee sur un ecart non qualifie."
    };
  }

  return {
    title: "Comparer les pratiques entre groupes",
    summary: `${insight.summary} L'ecart observe invite a comparer les pratiques des groupes concernes.`,
    action: "Organiser une comparaison entre groupes",
    description: "Analyser les differences de pratiques entre les groupes extremes et isoler les leviers reproductibles.",
    impact: "Transformer une comparaison Dataset en action operationnelle ciblee."
  };
}

export function generateGroupByInsightRecommendations(input: RecommendationInput): LocalRecommendation[] {
  return (input.datasetGroupByInsights ?? [])
    .filter((insight) => insight.insightType !== "best_group")
    .map((insight) => {
      const wording = groupByInsightAction(insight);

      return recommendation({
        id: `local-rec-groupby-${insight.id}`,
        organizationId: input.organizationId,
        title: wording.title,
        summary: wording.summary,
        priority: groupByInsightPriority(insight),
        category: insight.insightType === "weak_group" ? "operations" : "risk",
        sourceType: "dataset_groupby_insight",
        relatedKpiIds: [],
        relatedAlertIds: [],
        relatedInsightIds: [],
        relatedDatasetIds: [insight.datasetId],
        relatedGroupByInsightIds: [insight.id],
        groupValue: insight.groupValue,
        datasetSourceLabel: `Dataset ${insight.datasetId}`,
        relatedMemoryReferences: [],
        evidence: [
          groupByInsightEvidence(insight),
          ...insight.reasons.map((reason) => ({
            type: "dataset_groupby_insight" as const,
            label: "Raison comparative",
            value: reason,
            source: insight.groupByAnalysisId
          }))
        ],
        recommendedActions: [
          {
            label: insight.recommendedAction ?? wording.action,
            description: wording.description,
            ownerSuggestion: "Direction / operations",
            timeframe: insight.severity === "critical" ? "48 h" : "7 jours"
          }
        ],
        expectedImpact: wording.impact,
        effort: insight.insightType === "anomaly_candidate" ? "low" : "medium",
        urgency: insight.severity === "critical" ? "high" : insight.severity === "watch" ? "medium" : "low"
      });
    });
}

function priorityScore(priority: RecommendationPriority) {
  if (priority === "critical") return 100;
  if (priority === "high") return 70;
  if (priority === "medium") return 40;
  return 10;
}

function urgencyScore(urgency: LocalRecommendation["urgency"]) {
  if (urgency === "immediate") return 30;
  if (urgency === "high") return 20;
  if (urgency === "medium") return 10;
  return 0;
}

export function rankLocalRecommendations(recommendations: LocalRecommendation[]) {
  const seenRecommendations = new Set<string>();

  return [...recommendations]
    .filter((recommendationItem) => {
      if (seenRecommendations.has(recommendationItem.id)) return false;
      seenRecommendations.add(recommendationItem.id);
      return true;
    })
    .sort((first, second) =>
      priorityScore(second.priority) + urgencyScore(second.urgency) -
      (priorityScore(first.priority) + urgencyScore(first.urgency))
    );
}

export function generateLocalRecommendations(input: RecommendationInput) {
  const recommendations = [
    ...generateCostRecommendations(input),
    ...generateMarginRecommendations(input),
    ...generateQualityRecommendations(input),
    ...generateRiskRecommendations(input),
    ...generateDataQualityRecommendations(input),
    ...generateStrategyRecommendations(input),
    ...generateGroupByInsightRecommendations(input)
  ];

  return rankLocalRecommendations(recommendations);
}
