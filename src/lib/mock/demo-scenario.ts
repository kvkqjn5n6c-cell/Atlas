import type { Alert, Report } from "@/types/atlas";

export type DemoStepStatus = "source" | "mapping" | "configured" | "detected" | "action" | "ready";

export type DemoScenarioStep = {
  id: string;
  order: number;
  title: string;
  shortExplanation: string;
  businessValue: string;
  href: string;
  ctaLabel: string;
  status: DemoStepStatus;
};

export type DemoScenario = {
  organizationName: string;
  headline: string;
  pitch: string;
  beforeAtlas: string[];
  afterAtlas: string[];
  atlasValue: string[];
  steps: DemoScenarioStep[];
  keyAlertIds: Alert["id"][];
  keyReportIds: Report["id"][];
};

export const demoScenarioMock: DemoScenario = {
  organizationName: "Nova Services Maintenance",
  headline: "Atlas transforme des données dispersées en décisions opérationnelles.",
  pitch:
    "Le parcours démo montre comment une PME de maintenance terrain passe d'exports Excel, CSV et ERP dispersés à une lecture dirigeant claire : risques, priorités, plan d'action et rapport.",
  beforeAtlas: [
    "Trésorerie suivie dans un Excel hebdomadaire incomplet.",
    "Ventes et facturation exportees en CSV depuis l'ERP.",
    "Planning interventions stocké dans une base opérationnelle.",
    "Satisfaction client disponible mais rarement reliee aux retards."
  ],
  afterAtlas: [
    "Les sources sont centralisees et qualifiees.",
    "Les KPI distinguent performance réelle et fiabilité de donnée.",
    "Les alertes expliquent cause, impact et urgence.",
    "Le dirigeant voit les décisions à prendre cette semaine."
  ],
  atlasValue: [
    "Comprendre ou est le risque cash.",
    "Voir pourquoi la marge baisse alors que l'activite reste stable.",
    "Prioriser la region Est avant que les retards degradent la satisfaction.",
    "Produire un rapport dirigeant fiable et présentable."
  ],
  keyAlertIds: ["alert-cash", "alert-margin", "alert-operations-east", "alert-data-source"],
  keyReportIds: ["report-monthly-performance", "report-executive-summary"],
  steps: [
    {
      id: "initial-situation",
      order: 1,
      title: "Situation initiale",
      shortExplanation:
        "Nova Services Maintenance pilote son activite avec plusieurs fichiers et exports non relies.",
      businessValue:
        "Le décideur comprend le problème de départ : les chiffres existent, mais la décision reste lente.",
      href: "/organizations/org-atlas-demo",
      ctaLabel: "Voir l'organisation",
      status: "source"
    },
    {
      id: "data-sources",
      order: 2,
      title: "Sources de données",
      shortExplanation:
        "Atlas centralise Excel trésorerie, CSV facturation, ERP interventions et données qualité.",
      businessValue:
        "Chaque source porte un usage métier et un niveau de fiabilité visible.",
      href: "/data-sources",
      ctaLabel: "Voir les sources",
      status: "source"
    },
    {
      id: "mapping",
      order: 3,
      title: "Mapping",
      shortExplanation:
        "Les colonnes client comme montant_ht, region_vente ou score_service sont reliees aux champs Atlas.",
      businessValue:
        "La qualité du mapping évite de produire des KPI séduisants mais faux.",
      href: "/imports-mappings",
      ctaLabel: "Voir les mappings",
      status: "mapping"
    },
    {
      id: "kpi-configuration",
      order: 4,
      title: "Configuration KPI",
      shortExplanation:
        "Les indicateurs cash, marge, charge Est et satisfaction sont definis avec objectifs et seuils.",
      businessValue:
        "Atlas sait ce qui est attendu avant de juger une performance.",
      href: "/kpi-configuration",
      ctaLabel: "Voir la configuration",
      status: "configured"
    },
    {
      id: "alerts",
      order: 5,
      title: "Detection d'alertes",
      shortExplanation:
        "Atlas détecte cash J+30 fragile, marge en baisse, source régionale en erreur et surcharge Est.",
      businessValue:
        "Chaque alerte explique cause probable, impact métier, urgence et décision recommandée.",
      href: "/alerts",
      ctaLabel: "Voir les alertes",
      status: "detected"
    },
    {
      id: "action-plan",
      order: 6,
      title: "Plan d'action",
      shortExplanation:
        "Les alertes deviennent des actions : encaissements à confirmer, planning Est à reprioriser, mappings à corriger.",
      businessValue:
        "Le pilotage ne s'arrete pas au constat : il produit une sequence d'action claire.",
      href: "/action-plans",
      ctaLabel: "Voir les plans",
      status: "action"
    },
    {
      id: "executive-report",
      order: 7,
      title: "Rapport dirigeant",
      shortExplanation:
        "Atlas prépare un livrable de synthèse : résumé exécutif, risques, KPI critiques et données peu fiables.",
      businessValue:
        "Le rapport peut etre partage en comite sans retraiter manuellement les chiffres.",
      href: "/reports",
      ctaLabel: "Voir les rapports",
      status: "ready"
    },
    {
      id: "cockpit",
      order: 8,
      title: "Cockpit final",
      shortExplanation:
        "Le dirigeant retrouve la lecture consolidée : situation, risques, priorités et décisions.",
      businessValue:
        "La demo se termine sur la promesse Atlas : comprendre vite, decider mieux, agir plus tot.",
      href: "/pilotage",
      ctaLabel: "Ouvrir le cockpit",
      status: "ready"
    }
  ]
};
