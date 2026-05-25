import type { MappingReview } from "@/types/atlas";

export const mappingReviewsMock: MappingReview[] = [
  {
    id: "review-commentaire-interne",
    dataSourceId: "source-erp-csv",
    organizationId: "org-atlas-demo",
    sourceColumn: "commentaire_interne",
    detectedType: "text",
    suggestedAtlasField: "NonMappe",
    impactedKpiId: "kpi-cash",
    impactLevel: "low",
    recommendedAction: "Ignorer la colonne pour les KPI V1, mais conserver le libelle en contexte.",
    potentialKpiImpact: "Peut expliquer les causes de retard cash, mais ne bloque pas les KPI principaux."
  },
  {
    id: "review-region-vente",
    dataSourceId: "source-bi-mysql",
    organizationId: "org-atlas-demo",
    sourceColumn: "region_vente",
    detectedType: "text",
    suggestedAtlasField: "Region",
    impactedKpiId: "kpi-revenue",
    impactLevel: "medium",
    recommendedAction: "Mapper vers Region pour fiabiliser les lectures commerciales par zone.",
    potentialKpiImpact: "Impact possible sur les analyses de performance commerciale par zone."
  },
  {
    id: "review-score-service",
    dataSourceId: "source-care-quality",
    organizationId: "org-care-services",
    sourceColumn: "score_service",
    detectedType: "number",
    suggestedAtlasField: "Qualite",
    impactedKpiId: "kpi-care-quality",
    impactLevel: "high",
    recommendedAction: "Valider le mapping vers Qualité avant le prochain rapport client.",
    potentialKpiImpact: "Impact direct sur le KPI satisfaction intervention."
  }
];
