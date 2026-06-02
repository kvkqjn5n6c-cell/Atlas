import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { AtlasContextPack, AtlasContextPurpose, AtlasContextSource } from "@/types/atlas-context-pack";
import type { AtlasMemoryDocument, AtlasMemoryDocumentKey } from "@/types/atlas-memory";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { LocalInsight } from "@/types/local-insights";
import type { LocalKpiConfiguration } from "@/types/local-kpi";
import type { LocalKpiResult } from "@/types/local-kpi-results";

type ContextPackInput = {
  organizationId: string;
  documents: AtlasMemoryDocument[];
  knowledgeItems: AtlasKnowledgeItem[];
  kpiConfigurations?: LocalKpiConfiguration[];
  kpiResults?: LocalKpiResult[];
  alerts?: LocalKpiAlert[];
  alertRules?: LocalAlertRule[];
  insights?: LocalInsight[];
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

function buildLimitations(input: {
  approvedKnowledge: AtlasKnowledgeItem[];
  includedKnowledge: AtlasContextSource[];
  includedKpis: AtlasContextSource[];
  includedAlerts: AtlasContextSource[];
  includedRules: AtlasContextSource[];
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
  if (pendingKnowledgeCount > 0) limitations.push(`${pendingKnowledgeCount} connaissance(s) détectée(s) ignorée(s) car non validée(s).`);
  if (rejectedKnowledgeCount > 0) limitations.push(`${rejectedKnowledgeCount} connaissance(s) rejetée(s) exclue(s).`);

  return limitations;
}

function buildSummary(title: string, counts: {
  documents: number;
  knowledge: number;
  kpis: number;
  alerts: number;
  rules: number;
}) {
  return `${title} préparé avec ${counts.documents} document(s), ${counts.knowledge} connaissance(s) validée(s), ${counts.kpis} KPI, ${counts.alerts} alerte(s) et ${counts.rules} règle(s).`;
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
  const limitations = buildLimitations({
    approvedKnowledge,
    includedKnowledge,
    includedKpis,
    includedAlerts,
    includedRules,
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
    summary: buildSummary(config.title, {
      documents: includedDocuments.length,
      knowledge: includedKnowledge.length,
      kpis: includedKpis.length,
      alerts: includedAlerts.length,
      rules: includedRules.length
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
