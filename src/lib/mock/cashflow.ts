import type {
  CashflowForecastPoint,
  CashflowMovement,
  CashflowRecommendation
} from "@/types/cashflow";

export const currentCashBalance = 28400;

export const cashflowCriticalThreshold = 18000;

export const cashflowForecastMock: CashflowForecastPoint[] = [
  { day: 0, period: "Aujourd'hui", projectedBalance: 28400, inflows: 0, outflows: 0, criticalThreshold: 18000 },
  { day: 7, period: "J+7", projectedBalance: 23600, inflows: 3000, outflows: 7800, criticalThreshold: 18000 },
  { day: 14, period: "J+14", projectedBalance: 17650, inflows: 5160, outflows: 11110, criticalThreshold: 18000 },
  { day: 30, period: "J+30", projectedBalance: 24600, inflows: 21840, outflows: 25640, criticalThreshold: 18000 },
  { day: 45, period: "J+45", projectedBalance: 29100, inflows: 11400, outflows: 6900, criticalThreshold: 18000 },
  { day: 60, period: "J+60", projectedBalance: 31800, inflows: 9720, outflows: 7020, criticalThreshold: 18000 },
  { day: 75, period: "J+75", projectedBalance: 37400, inflows: 13800, outflows: 8200, criticalThreshold: 18000 },
  { day: 90, period: "J+90", projectedBalance: 42100, inflows: 12900, outflows: 8200, criticalThreshold: 18000 }
];

export const cashflowMovementsMock: CashflowMovement[] = [
  {
    id: "movement-001",
    date: "25/05/2026",
    day: 1,
    type: "outflow",
    counterparty: "Suite Cloud",
    label: "Abonnements logiciels",
    amount: 420,
    status: "confirmed",
    riskLevel: "low",
    recommendedAction: "Aucune action prioritaire."
  },
  {
    id: "movement-002",
    date: "27/05/2026",
    day: 3,
    type: "inflow",
    counterparty: "Maison Lumen",
    label: "Solde facture FAC-2026-002",
    amount: 5160,
    status: "at-risk",
    riskLevel: "critical",
    recommendedAction: "Relancer aujourd'hui et obtenir une date de virement."
  },
  {
    id: "movement-003",
    date: "29/05/2026",
    day: 5,
    type: "inflow",
    counterparty: "Helio Conseil",
    label: "Solde partiel facture FAC-2026-006",
    amount: 5880,
    status: "at-risk",
    riskLevel: "high",
    recommendedAction: "Confirmer le virement annonce avant fin de semaine."
  },
  {
    id: "movement-004",
    date: "31/05/2026",
    day: 7,
    type: "outflow",
    counterparty: "SCI Centre Affaires",
    label: "Loyer bureau",
    amount: 2160,
    status: "confirmed",
    riskLevel: "medium",
    recommendedAction: "Maintenir la sortie, deja integree au point bas."
  },
  {
    id: "movement-005",
    date: "03/06/2026",
    day: 10,
    type: "outflow",
    counterparty: "Assist Pro",
    label: "Sous-traitance administrative",
    amount: 1440,
    status: "planned",
    riskLevel: "medium",
    recommendedAction: "Vérifier que les encaissements critiques sont confirmés avant paiement anticipé."
  },
  {
    id: "movement-006",
    date: "07/06/2026",
    day: 14,
    type: "inflow",
    counterparty: "Bistro Celeste",
    label: "Facture FAC-2026-004",
    amount: 6240,
    status: "expected",
    riskLevel: "medium",
    recommendedAction: "Envoyer un rappel courtois trois jours avant échéance."
  },
  {
    id: "movement-007",
    date: "10/06/2026",
    day: 17,
    type: "outflow",
    counterparty: "Agence Pulse",
    label: "Campagne acquisition locale",
    amount: 1140,
    status: "planned",
    riskLevel: "medium",
    recommendedAction: "Décaler si Maison Lumen reste non encaissé."
  },
  {
    id: "movement-008",
    date: "15/06/2026",
    day: 22,
    type: "inflow",
    counterparty: "Nacre Digital",
    label: "Facture FAC-2026-008",
    amount: 5520,
    status: "expected",
    riskLevel: "medium",
    recommendedAction: "Surveiller acceptation facture avant de compter le cash."
  },
  {
    id: "movement-009",
    date: "20/06/2026",
    day: 27,
    type: "inflow",
    counterparty: "Atelier Nova",
    label: "Facture FAC-2026-011",
    amount: 2280,
    status: "expected",
    riskLevel: "low",
    recommendedAction: "Aucune action avant emission finale."
  },
  {
    id: "movement-010",
    date: "28/06/2026",
    day: 35,
    type: "outflow",
    counterparty: "URSSAF",
    label: "Charges sociales provisionnelles",
    amount: 3900,
    status: "planned",
    riskLevel: "high",
    recommendedAction: "Conserver une réserve cash minimale avant cette échéance."
  },
  {
    id: "movement-011",
    date: "12/07/2026",
    day: 49,
    type: "inflow",
    counterparty: "Vesper Industrie",
    label: "Nouvelle tranche projet",
    amount: 8400,
    status: "expected",
    riskLevel: "medium",
    recommendedAction: "Verrouiller la validation du jalon avant fin juin."
  },
  {
    id: "movement-012",
    date: "25/07/2026",
    day: 62,
    type: "outflow",
    counterparty: "Materiel Pro",
    label: "Renouvellement postes equipe",
    amount: 3600,
    status: "planned",
    riskLevel: "medium",
    recommendedAction: "Décider achat après point trésorerie à 60 jours."
  },
  {
    id: "movement-013",
    date: "15/08/2026",
    day: 83,
    type: "inflow",
    counterparty: "Cabinet Oria",
    label: "Extension mission conseil",
    amount: 6200,
    status: "expected",
    riskLevel: "low",
    recommendedAction: "Transformer le devis en facture des acceptation."
  }
];

export const cashflowRecommendationsMock: CashflowRecommendation[] = [
  {
    id: "recommendation-001",
    title: "Securiser Maison Lumen",
    description: "Le point bas passe sous le seuil critique si le solde Maison Lumen glisse de plus de 7 jours.",
    impact: "+5 160 EUR de cash confirme",
    riskLevel: "critical"
  },
  {
    id: "recommendation-002",
    title: "Décaler la dépense marketing",
    description: "La campagne Agence Pulse peut être décalée sans bloquer l'opérationnel.",
    impact: "1 140 EUR de marge de manoeuvre",
    riskLevel: "high"
  },
  {
    id: "recommendation-003",
    title: "Verrouiller le jalon Vesper",
    description: "La tranche de juillet ameliore fortement la projection a 60 jours.",
    impact: "+8 400 EUR attendus",
    riskLevel: "medium"
  }
];
