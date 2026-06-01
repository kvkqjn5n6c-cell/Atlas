import type { ModulePlaceholderProps } from "@/components/module-placeholder";

const legacyReturnConditions = [
  "Revenir uniquement si les données alimentent un KPI, une alerte ou un rapport.",
  "Éviter tout CRUD complet hors pilotage.",
  "Relier l'écran à une source, un mapping ou une décision dirigeant."
];

export const modulePlaceholders = {
  home: {
    title: "Accueil historique",
    objective:
      "Ancien point d'entrée conservé pour compatibilité. L'accès principal Atlas est désormais le cockpit de pilotage.",
    expectedInsights: ["Score de performance", "Alertes prioritaires", "Synthèse dirigeant"],
    futureActions: legacyReturnConditions,
    badge: "Route redirigée"
  },
  indicators: {
    title: "Indicateurs",
    objective:
      "Consulter les KPI de performance, leurs écarts aux objectifs, leurs tendances et leur qualité de donnée.",
    expectedInsights: ["KPI critiques", "KPI à surveiller", "Écart objectif", "Source principale"],
    futureActions: ["Rester une page de consultation", "Garder la configuration dans Configuration KPI", "Relier chaque KPI à sa source"]
  },
  clients: {
    title: "Clients",
    objective:
      "Ancien module issu du pivot. Les informations clients ne doivent revenir que comme dimension de pilotage.",
    expectedInsights: ["Concentration du chiffre d'affaires", "Clients à risque", "Dépendance client"],
    futureActions: legacyReturnConditions
  },
  quotes: {
    title: "Devis",
    objective:
      "Ancien module commercial masqué. Atlas ne suit pas un cycle de vente complet dans la navigation principale.",
    expectedInsights: ["Potentiel signé", "Taux de conversion", "Décalage prévisionnel"],
    futureActions: legacyReturnConditions
  },
  invoices: {
    title: "Factures",
    objective:
      "Ancien module de gestion masqué. Les données de facturation peuvent rester une source pour le pilotage cash et marge.",
    expectedInsights: ["Montant à encaisser", "Retards", "Fiabilité source"],
    futureActions: legacyReturnConditions
  },
  payments: {
    title: "Paiements",
    objective:
      "Ancien module d'encaissement masqué. Les paiements doivent être traités comme signaux de performance et risque cash.",
    expectedInsights: ["Encaissements", "Retards", "Impact cash"],
    futureActions: legacyReturnConditions
  },
  expenses: {
    title: "Dépenses",
    objective:
      "Ancien module de gestion masqué. Les dépenses ne doivent revenir que comme source de marge, cash ou dérive opérationnelle.",
    expectedInsights: ["Dépenses inhabituelles", "Impact marge", "Impact cash"],
    futureActions: legacyReturnConditions
  },
  projects: {
    title: "Projets",
    objective:
      "Ancien module opérationnel masqué. Les projets peuvent revenir seulement comme dimension d'activité ou de risque.",
    expectedInsights: ["Charge", "Retards", "Risque opérationnel"],
    futureActions: legacyReturnConditions
  },
  tasks: {
    title: "Tâches",
    objective:
      "Ancien module de tâches masqué. Atlas garde les plans d'action comme support prioritaire de décision.",
    expectedInsights: ["Actions prioritaires", "Responsables", "Échéances"],
    futureActions: legacyReturnConditions
  },
  pilotage: {
    title: "Pilotage",
    objective:
      "Cockpit central Atlas pour comprendre la situation, les risques et les décisions à prendre.",
    expectedInsights: ["Score de performance", "Insights", "Alertes", "Synthèse dirigeant"],
    futureActions: ["Conserver comme écran cœur", "Relier les KPI locaux", "Garder une lecture dirigeant claire"]
  },
  reports: {
    title: "Rapports",
    objective:
      "Produire des synthèses lisibles pour la direction à partir des KPI, alertes, insights et limites de fiabilité.",
    expectedInsights: ["Résumé exécutif", "Risques", "Actions", "Qualité de donnée"],
    futureActions: ["Préparer l'export PDF", "Garder le rapport explicable", "Relier aux sources utilisées"]
  },
  settings: {
    title: "Paramètres",
    objective:
      "Préparer le cadre de pilotage, les accès, les modes de données et les futures intégrations.",
    expectedInsights: ["Organisation active", "Mode de données", "Rôles", "Connecteurs futurs"],
    futureActions: ["Garder les réglages sobres", "Préparer la sécurité", "Préparer Atlas Memory"]
  },
  actionPlans: {
    title: "Plans d'action",
    objective:
      "Transformer les alertes et écarts KPI en actions priorisées, attribuées et suivies.",
    expectedInsights: ["Actions critiques", "Responsables", "Échéances", "Impact attendu"],
    futureActions: ["Relier aux alertes", "Mesurer l'impact", "Limiter aux actions de pilotage"]
  },
  organizations: {
    title: "Organisations",
    objective:
      "Suivre les organisations clientes, leur périmètre de pilotage et leur gouvernance de données.",
    expectedInsights: ["Organisations actives", "Couverture KPI", "Sources", "Alertes ouvertes"],
    futureActions: ["Gérer le multi-tenant", "Relier les sources", "Isoler les données"]
  }
} satisfies Record<string, ModulePlaceholderProps>;
