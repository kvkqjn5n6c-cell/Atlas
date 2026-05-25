import type { ExecutiveDashboardMock } from "@/types/dashboard";

export const executiveDashboardMock: ExecutiveDashboardMock = {
  organizationName: "Atlas Demo PME",
  periodLabel: "Mai 2026",
  healthScore: {
    value: 72,
    status: "stable",
    drivers: {
      cash: 76,
      overduePayments: 58,
      growth: 81,
      criticalAlerts: 64,
      margin: 79
    }
  },
  kpis: [
    {
      id: "signed-revenue",
      label: "CA signe",
      value: "74 800 EUR",
      detail: "8 devis acceptes ou en validation",
      evolution: 14,
      trend: "up",
      state: "good"
    },
    {
      id: "invoiced-revenue",
      label: "CA facture",
      value: "53 100 EUR",
      detail: "12 factures sur la période",
      evolution: 9,
      trend: "up",
      state: "good"
    },
    {
      id: "collected-revenue",
      label: "CA encaissé",
      value: "21 840 EUR",
      detail: "41% du facturé déjà encaissé",
      evolution: -6,
      trend: "down",
      state: "warning"
    },
    {
      id: "outstanding",
      label: "Reste à encaisser",
      value: "31 260 EUR",
      detail: "dont 6 600 EUR en retard",
      evolution: 18,
      trend: "up",
      state: "warning"
    },
    {
      id: "cash",
      label: "Trésorerie",
      value: "28 400 EUR",
      detail: "projection positive a 30 jours",
      evolution: 4,
      trend: "up",
      state: "neutral"
    },
    {
      id: "margin",
      label: "Marge estimee",
      value: "32%",
      detail: "stable malgré dépenses marketing",
      evolution: 2,
      trend: "stable",
      state: "good"
    }
  ],
  alerts: [
    {
      id: "late-invoices",
      title: "2 factures en retard",
      severity: "critical",
      impact: "6 600 EUR immobilises et un risque de tension sur le cash debut juin.",
      suggestedAction: "Relancer Maison Lumen et Mercure Habitat aujourd'hui."
    },
    {
      id: "pdp-rejected",
      title: "Facture rejetee",
      severity: "warning",
      impact: "FAC-2026-003 ne pourra pas etre traitee tant que l'adresse client est incomplete.",
      suggestedAction: "Corriger la fiche Groupe Horizon puis préparer le renvoi."
    },
    {
      id: "quote-aging",
      title: "Devis sans reponse",
      severity: "warning",
      impact: "18 400 EUR d'opportunités restent sans décision après 12 jours.",
      suggestedAction: "Programmer une relance courte sur Atelier Nova et Nacre Digital."
    },
    {
      id: "expense-overrun",
      title: "Dépenses à surveiller",
      severity: "warning",
      impact: "La sous-traitance et l'acquisition locale augmentent les sorties prevues.",
      suggestedAction: "Verifier la rentabilite des missions avant nouvel engagement."
    }
  ],
  actions: [
    {
      id: "action-1",
      title: "Relancer le solde FAC-2026-002",
      priority: "high",
      dueDate: "Aujourd'hui",
      context: "Maison Lumen - 5 160 EUR restants"
    },
    {
      id: "action-2",
      title: "Traiter la facture rejetee",
      priority: "high",
      dueDate: "25/05/2026",
      context: "Groupe Horizon - données PDP incomplètes"
    },
    {
      id: "action-3",
      title: "Valider la conversion du devis",
      priority: "medium",
      dueDate: "27/05/2026",
      context: "Helio Conseil - mission prête à facturer"
    },
    {
      id: "action-4",
      title: "Clôturer le projet Nova",
      priority: "medium",
      dueDate: "30/05/2026",
      context: "Livrables signes, facture finale a emettre"
    }
  ],
  cashflow: [
    { period: "Mai", projectedCash: 28400, criticalThreshold: 18000 },
    { period: "Juin", projectedCash: 24600, criticalThreshold: 18000 },
    { period: "Juil.", projectedCash: 31800, criticalThreshold: 18000 },
    { period: "Aout", projectedCash: 35200, criticalThreshold: 18000 },
    { period: "Sept.", projectedCash: 42100, criticalThreshold: 18000 },
    { period: "Oct.", projectedCash: 47600, criticalThreshold: 18000 }
  ],
  revenue: [
    { period: "Jan.", signed: 42000, invoiced: 36000, collected: 31000 },
    { period: "Fev.", signed: 48000, invoiced: 39000, collected: 33000 },
    { period: "Mars", signed: 51000, invoiced: 45000, collected: 37000 },
    { period: "Avr.", signed: 62000, invoiced: 49000, collected: 41000 },
    { period: "Mai", signed: 74800, invoiced: 53100, collected: 21840 },
    { period: "Juin", signed: 69000, invoiced: 57000, collected: 42000 }
  ],
  operations: [
    {
      id: "critical-tasks",
      label: "Tâches critiques",
      value: "5",
      detail: "3 relances et 2 corrections facture",
      state: "warning"
    },
    {
      id: "late-projects",
      label: "Projets en retard",
      value: "2",
      detail: "Nova et Mercure Habitat",
      state: "warning"
    },
    {
      id: "workload",
      label: "Charge equipe",
      value: "78%",
      detail: "capacite correcte cette semaine",
      state: "neutral"
    },
    {
      id: "objectives",
      label: "Objectifs mensuels",
      value: "82%",
      detail: "objectif CA signe presque atteint",
      state: "good"
    }
  ],
  summary: [
    {
      id: "summary-1",
      title: "Situation globale",
      content:
        "L'entreprise reste stable : la croissance commerciale est bonne et la marge estimee reste saine.",
      state: "good"
    },
    {
      id: "summary-2",
      title: "Point de tension",
      content:
        "Le principal risque vient de l'encaissement : deux retards et un paiement partiel réduisent la visibilité cash de début juin.",
      state: "warning"
    },
    {
      id: "summary-3",
      title: "Clients a risque",
      content:
        "Maison Lumen, Mercure Habitat et Groupe Horizon demandent une action rapide pour éviter l'effet domino sur trésorerie et facturation.",
      state: "critical"
    },
    {
      id: "summary-4",
      title: "Décision conseillée",
      content:
        "Prioriser les relances a fort montant, corriger la facture rejetee, puis convertir les devis acceptes en factures.",
      state: "neutral"
    }
  ]
};
