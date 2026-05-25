import type { ModulePlaceholderProps } from "@/components/module-placeholder";

export const modulePlaceholders = {
  home: {
    title: "Accueil",
    objective:
      "Donner un point d'entrée simple vers le pilotage de performance, les alertes et les plans d'action.",
    expectedInsights: [
      "Score performance de la période",
      "Alertes prioritaires",
      "Plans d'action ouverts",
      "Sources de données à vérifier"
    ],
    futureActions: [
      "Afficher une synthèse de performance",
      "Mettre en avant les décisions attendues",
      "Préparer un accès futur à Atlas IA"
    ]
  },
  indicators: {
    title: "Indicateurs",
    objective:
      "Centraliser les KPI de performance, suivre les écarts aux objectifs et détecter les dérives.",
    expectedInsights: [
      "KPI critiques",
      "KPI à surveiller",
      "Écart objectif par indicateur",
      "Tendances par période",
      "Couverture par source de données"
    ],
    futureActions: [
      "Configurer des objectifs simples",
      "Comparer deux périodes",
      "Relier chaque KPI à une source de données"
    ]
  },
  clients: {
    title: "Clients",
    objective:
      "Centraliser les clients et contacts pour relier activité commerciale, facturation, relances et risques de paiement.",
    expectedInsights: [
      "Clients actifs et clients à risque",
      "CA facturé par client",
      "Retards de paiement par client",
      "Devis ouverts par client",
      "Dernière activité commerciale"
    ],
    futureActions: [
      "Créer et qualifier une fiche client",
      "Voir l'historique devis, factures et paiements",
      "Identifier les clients à relancer en priorité"
    ]
  },
  quotes: {
    title: "Devis",
    objective:
      "Suivre le pipeline commercial sans complexité, de l'émission du devis jusqu'à la décision client.",
    expectedInsights: [
      "Montant des devis envoyés",
      "Devis sans réponse",
      "Taux de conversion",
      "CA potentiel à court terme",
      "Devis acceptés à convertir"
    ],
    futureActions: [
      "Créer un devis simple",
      "Envoyer ou marquer un devis comme accepté",
      "Convertir un devis accepté en facture ou projet"
    ]
  },
  invoices: {
    title: "Factures",
    objective:
      "Piloter le CA facturé, les échéances, les statuts de paiement et la future transmission facture électronique.",
    expectedInsights: [
      "CA facturé sur la période",
      "Factures en retard",
      "Factures partiellement payées",
      "Statuts de transmission externe",
      "Montant restant à encaisser"
    ],
    futureActions: [
      "Créer une facture depuis un devis ou un projet",
      "Suivre les paiements associés",
      "Préparer la connexion à un organisme agréé via provider"
    ]
  },
  payments: {
    title: "Paiements",
    objective:
      "Suivre les encaissements, les paiements partiels et l'impact direct sur la trésorerie.",
    expectedInsights: [
      "CA encaissé",
      "Paiements attendus",
      "Paiements partiels",
      "Retards d'encaissement",
      "Écart entre facture et cash"
    ],
    futureActions: [
      "Enregistrer un paiement manuel",
      "Rapprocher un paiement avec une facture",
      "Préparer la connexion bancaire future"
    ]
  },
  expenses: {
    title: "Dépenses",
    objective:
      "Donner une vue simple des sorties de trésorerie sans basculer dans une comptabilité complète.",
    expectedInsights: [
      "Dépenses payées du mois",
      "Dépenses à venir",
      "Catégories les plus importantes",
      "Impact sur trésorerie prévisionnelle",
      "Dépenses inhabituelles"
    ],
    futureActions: [
      "Ajouter une dépense simple",
      "Classer par catégorie",
      "Signaler les dépenses à impact cash élevé"
    ]
  },
  projects: {
    title: "Projets",
    objective:
      "Relier les missions vendues à leur avancement opérationnel pour mieux anticiper facturation, charge et risques.",
    expectedInsights: [
      "Projets actifs",
      "Projets en retard",
      "Charge estimée",
      "Projets prêts à facturer",
      "Objectifs de livraison"
    ],
    futureActions: [
      "Convertir un devis accepté en projet",
      "Suivre les jalons simples",
      "Identifier les projets bloquants"
    ],
    badge: "Module V2"
  },
  tasks: {
    title: "Tâches",
    objective:
      "Prioriser les relances et actions internes qui ont un impact direct sur cash, facturation et satisfaction client.",
    expectedInsights: [
      "Tâches critiques",
      "Relances client en attente",
      "Échéances proches",
      "Charge par responsable",
      "Actions terminées cette semaine"
    ],
    futureActions: [
      "Assigner une action à un membre",
      "Lier une tâche à un client ou une facture",
      "Clôturer les actions traitées"
    ]
  },
  pilotage: {
    title: "Pilotage",
    objective:
      "Regrouper les indicateurs, alertes et recommandations pour piloter l'entreprise au-delà des données brutes.",
    expectedInsights: [
      "Score santé entreprise",
      "KPI de croissance",
      "KPI d'encaissement",
      "Alertes actives",
      "Recommandations prioritaires"
    ],
    futureActions: [
      "Configurer des objectifs simples",
      "Comparer les périodes",
      "Expliquer les variations de score"
    ]
  },
  reports: {
    title: "Rapports",
    objective:
      "Produire des synthèses lisibles de performance pour la direction et les comités de pilotage.",
    expectedInsights: [
      "Rapport mensuel performance",
      "Synthèse KPI",
      "Synthèse alertes",
      "Décisions recommandées",
      "Plan d'action associé"
    ],
    futureActions: [
      "Générer un PDF mensuel",
      "Exporter les indicateurs principaux",
      "Partager une synthèse avec un partenaire"
    ],
    badge: "Module V2"
  },
  settings: {
    title: "Paramètres",
    objective:
      "Centraliser les réglages utiles à Atlas : organisation active, période, accès et préférences de pilotage.",
    expectedInsights: [
      "Organisation active",
      "Utilisateurs et rôles",
      "Période de pilotage",
      "Préférences d'affichage",
      "État des intégrations futures"
    ],
    futureActions: [
      "Gérer les membres de l'organisation",
      "Définir la période par défaut",
      "Préparer la configuration des connecteurs"
    ]
  },
  actionPlans: {
    title: "Plans d'action",
    objective:
      "Transformer les alertes et écarts KPI en actions priorisées, suivies et attribuées.",
    expectedInsights: [
      "Actions critiques ouvertes",
      "Responsables",
      "Échéances proches",
      "Impact attendu",
      "Taux de completion"
    ],
    futureActions: [
      "Assigner les actions",
      "Lier une action à une alerte ou un KPI",
      "Mesurer l'impact après exécution"
    ]
  },
  organizations: {
    title: "Organisations",
    objective:
      "Gérer les PME/TPE clientes suivies dans Atlas et leur contexte de performance.",
    expectedInsights: [
      "Organisations actives",
      "Secteur et taille",
      "Période active",
      "Couverture KPI",
      "État sources de données"
    ],
    futureActions: [
      "Ajouter une organisation cliente",
      "Associer des sources de données",
      "Configurer les objectifs par organisation"
    ]
  }
} satisfies Record<string, ModulePlaceholderProps>;
