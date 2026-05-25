import type { ExecutiveVerdict, PerformanceTrend, SevenDayPriority } from "@/types/atlas";

export const executiveVerdictMock: ExecutiveVerdict = {
  status: "watch",
  title: "Activite solide, tension cash et marge a traiter",
  summary:
    "Nova Services Maintenance garde une activité stable, mais la marge baisse sous l'effet de la sous-traitance et le cash J+30 devient fragile. La région Est concentre la surcharge opérationnelle et dégrade la satisfaction intervention.",
  decisionFocus:
    "Sécuriser les deux encaissements critiques, réduire la sous-traitance subie en région Est et fiabiliser la trésorerie avant le rapport dirigeant."
};

export const globalTrendsMock: PerformanceTrend[] = [
  {
    axis: "activite",
    label: "Activite",
    trend: "hausse",
    value: "+8%",
    insight: "Volume d'interventions stable avec une legere progression des contrats recurrents.",
    points: [62, 64, 63, 66, 67, 68]
  },
  {
    axis: "marge",
    label: "Marge",
    trend: "baisse",
    value: "27%",
    insight: "Sous-traitance en hausse sur la region Est et missions urgentes moins rentables.",
    points: [34, 33, 31, 30, 28, 27]
  },
  {
    axis: "cash",
    label: "Cash",
    trend: "baisse",
    value: "-21%",
    insight: "Tension prévisible sous 21 jours si deux encaissements clients glissent.",
    points: [74, 69, 62, 55, 48, 41]
  },
  {
    axis: "qualite",
    label: "Qualité",
    trend: "baisse",
    value: "88/100",
    insight: "Satisfaction en recul sur les interventions replanifiees.",
    points: [94, 93, 92, 90, 89, 88]
  }
];

export const sevenDayPrioritiesMock: SevenDayPriority[] = [
  {
    id: "prio-001",
    priority: "haute",
    title: "Obtenir confirmation de paiement Maison Lumen et Helio Conseil",
    impact: "31 800 EUR de cash a securiser",
    owner: "Nadia",
    dueDate: "27/05/2026"
  },
  {
    id: "prio-002",
    priority: "haute",
    title: "Compléter l'import trésorerie incomplet",
    impact: "Fiabilite cash remontee au-dessus de 80%",
    owner: "Remi",
    dueDate: "28/05/2026"
  },
  {
    id: "prio-003",
    priority: "moyenne",
    title: "Replanifier la sous-traitance Est",
    impact: "+4 pts marge potentiels et moins de retards",
    owner: "Claire",
    dueDate: "31/05/2026"
  },
  {
    id: "prio-004",
    priority: "moyenne",
    title: "Préparer le rapport performance mai",
    impact: "Décision comité dirigeant",
    owner: "Nadia",
    dueDate: "02/06/2026"
  }
];
