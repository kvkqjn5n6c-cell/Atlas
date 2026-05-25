import type { Report } from "@/types/atlas";

export const reportsMock: Report[] = [
  {
    id: "report-monthly-performance",
    organizationId: "org-atlas-demo",
    title: "Rapport performance mensuel",
    type: "monthly",
    period: "Mai 2026",
    status: "ready",
    generatedAt: "25/05/2026 09:00",
    globalScore: 62,
    criticalKpiCount: 1,
    alertCount: 4,
    mainInsight: "Activité stable, mais cash J+30, marge et surcharge Est doivent être traités cette semaine.",
    executiveSummary:
      "Nova Services Maintenance tient son volume d'interventions, mais la performance se fragilise par la marge, les retards Est et une trésorerie partiellement fiable.",
    keyRisks: [
      "Tension cash possible sous 21 jours",
      "Sous-traitance Est qui compresse la marge",
      "Source activité régionale en erreur"
    ],
    criticalKpis: ["Cash a 30 jours"],
    unreliableData: ["Trésorerie partielle", "Historique activité régionale non synchronisé"],
    priorityActions: [
      "Confirmer les paiements Maison Lumen et Helio Conseil",
      "Reprioriser le planning Est",
      "Relancer l'import activité régionale"
    ],
    trends: ["Activité stable", "Marge en baisse", "Cash en baisse", "Satisfaction en baisse"],
    directionSummary:
      "Décision recommandée : protéger le cash et restaurer la marge avant d'absorber de nouvelles urgences.",
    dataReliabilityScore: 68
  },
  {
    id: "report-cash-risk",
    organizationId: "org-atlas-demo",
    title: "Point risque trésorerie",
    type: "alert",
    period: "J+30",
    status: "draft",
    generatedAt: "25/05/2026 08:30",
    globalScore: 58,
    criticalKpiCount: 1,
    alertCount: 1,
    mainInsight: "Deux encaissements concentrent le risque court terme.",
    executiveSummary:
      "Le point bas de trésorerie dépend de deux paiements clients et d'une donnée trésorerie encore partielle.",
    keyRisks: ["Glissement paiement client", "Dépenses sous-traitance engagées trop tôt"],
    criticalKpis: ["Cash a 30 jours"],
    unreliableData: ["Flux trésorerie incomplet"],
    priorityActions: ["Obtenir une date ferme de paiement", "Reporter les dépenses variables non critiques"],
    trends: ["Cash en baisse", "Encaissements concentrés"],
    directionSummary: "Décision recommandée : verrouiller les encaissements avant validation des dépenses de fin de mois.",
    dataReliabilityScore: 61
  },
  {
    id: "report-executive-summary",
    organizationId: "org-atlas-demo",
    title: "Synthèse dirigeant",
    type: "summary",
    period: "Semaine 22",
    status: "ready",
    generatedAt: "25/05/2026 10:15",
    globalScore: 64,
    criticalKpiCount: 1,
    alertCount: 3,
    mainInsight: "Situation sous contrôle si les priorités cash, Est et data sont traitées cette semaine.",
    executiveSummary:
      "La direction dispose d'un plan court terme clair : cash, planning Est, fiabilité données avant rapport mensuel.",
    keyRisks: ["Surcharge Est", "Marge dégradée", "Données régionales incomplètes"],
    criticalKpis: ["Cash a 30 jours"],
    unreliableData: ["Historique activité régionale", "Satisfaction intervention obsolète"],
    priorityActions: ["Reprioriser la région Est", "Contrôler les missions sous marge cible", "Corriger les mappings"],
    trends: ["Activité stable", "Qualité en recul", "Marge en baisse"],
    directionSummary: "Décision recommandée : arbitrer la capacité opérationnelle avant d'augmenter le volume vendu.",
    dataReliabilityScore: 66
  }
];
