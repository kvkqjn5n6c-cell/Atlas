export type DemoAtlasSeverity = "stable" | "watch" | "critical";

export type DemoAtlasMetric = {
  label: string;
  value: string;
  trend: string;
  status: DemoAtlasSeverity;
};

export type DemoAtlasPriority = {
  title: string;
  score: number;
  urgency: "Élevée" | "Critique";
  impact: "Moyen" | "Fort";
  reason: string;
};

export type DemoAtlasRecommendation = {
  title: string;
  confidenceScore: number;
  why: string;
  action: string;
};

export type DemoAtlasPlanTask = {
  label: string;
  owner: string;
  dueDate: string;
};

export type DemoAtlasStep = {
  id: string;
  order: number;
  title: string;
  summary: string;
  leaderMessage: string;
  proofPoints: string[];
  cardTitle: string;
  cardItems: string[];
};

export type DemoAtlasScenario = {
  company: {
    name: string;
    activity: string;
    size: string;
    context: string;
  };
  promise: string;
  businessProblem: string;
  initialMetrics: DemoAtlasMetric[];
  alerts: string[];
  priorities: DemoAtlasPriority[];
  recommendations: DemoAtlasRecommendation[];
  actionPlan: {
    title: string;
    owner: string;
    dueDate: string;
    expectedImpact: string;
    tasks: DemoAtlasPlanTask[];
  };
  impact: {
    before: string;
    after: string;
    interpretation: string;
    limitation: string;
  };
  decisions: string[];
  memoryReferences: string[];
  executiveDashboard: {
    globalSituation: string;
    score: number;
    confidenceLevel: string;
    nextActions: string[];
  };
  copilBrief: {
    title: string;
    arbitrationPoints: string[];
    decisionsToTake: string[];
    closingSummary: string;
  };
  steps: DemoAtlasStep[];
};

export const demoAtlasScenario: DemoAtlasScenario = {
  company: {
    name: "Nova Services Maintenance",
    activity: "Maintenance terrain et interventions multi-sites",
    size: "PME de 85 collaborateurs, 4 agences régionales",
    context:
      "Nova Services Maintenance prépare son prochain comité de pilotage après trois mois de marge sous pression et de retards en région Est."
  },
  promise: "Atlas aide à voir, décider et piloter sans transformer la PME en projet ERP.",
  businessProblem:
    "Les données existent déjà, mais elles sont dispersées entre exports CSV, tableurs, retours client et décisions informelles.",
  initialMetrics: [
    { label: "Marge brute", value: "28 %", trend: "-4 pts en 2 mois", status: "watch" },
    { label: "Coût sous-traitance", value: "12800 €", trend: "+18 %", status: "critical" },
    { label: "Satisfaction client", value: "7,1 / 10", trend: "-0,6 pt", status: "watch" },
    { label: "Retards région Est", value: "23 %", trend: "+7 pts", status: "critical" }
  ],
  alerts: [
    "Coût de sous-traitance au-dessus du seuil critique configuré.",
    "Marge en zone de surveillance malgré une activité stable.",
    "Retards d'intervention en hausse sur la région Est.",
    "Décisions opérationnelles dispersées entre réunions, mails et tableurs."
  ],
  priorities: [
    {
      title: "Réduire la sous-traitance Est",
      score: 94,
      urgency: "Critique",
      impact: "Fort",
      reason: "Le coût dépasse le seuil critique et pèse directement sur la marge."
    },
    {
      title: "Sécuriser la marge des contrats à faible rentabilité",
      score: 86,
      urgency: "Élevée",
      impact: "Fort",
      reason: "La marge baisse plus vite que l'activité, ce qui signale un problème de structure de coût."
    },
    {
      title: "Stabiliser la satisfaction client",
      score: 78,
      urgency: "Élevée",
      impact: "Moyen",
      reason: "Les retards et la satisfaction évoluent dans le même sens défavorable."
    }
  ],
  recommendations: [
    {
      title: "Isoler les interventions sous-traitées les plus coûteuses",
      confidenceScore: 86,
      why: "La recommandation combine KPI critique, règle de seuil et objectif mémoire de réduction de sous-traitance.",
      action: "Comparer les dix missions les plus coûteuses avec les équipes internes disponibles."
    },
    {
      title: "Reprioriser le planning Est avant le COPIL",
      confidenceScore: 81,
      why: "Le risque opérationnel est confirmé par les retards et par la baisse de satisfaction.",
      action: "Basculer deux techniciens expérimentés sur les interventions à risque."
    },
    {
      title: "Revoir les contrats à marge faible",
      confidenceScore: 74,
      why: "La marge reste à surveiller, mais l'historique est encore limité.",
      action: "Identifier les clients ou missions sous le seuil cible avant toute décision lourde."
    }
  ],
  actionPlan: {
    title: "Plan 30 jours : réduction sous-traitance Est",
    owner: "Direction opérations",
    dueDate: "30 juin 2026",
    expectedImpact: "Réduire le coût sous-traitance et restaurer deux points de marge.",
    tasks: [
      { label: "Lister les interventions sous-traitées supérieures à 1500 €", owner: "Contrôle de gestion", dueDate: "J+5" },
      { label: "Identifier les créneaux internes disponibles en région Est", owner: "Responsable planning", dueDate: "J+7" },
      { label: "Renégocier les missions récurrentes avec deux prestataires", owner: "Direction opérations", dueDate: "J+15" },
      { label: "Présenter l'arbitrage au COPIL", owner: "Dirigeant", dueDate: "J+30" }
    ]
  },
  impact: {
    before: "12800 € de coût sous-traitance observé sur l'échantillon local.",
    after: "11200 € après premières corrections de planning.",
    interpretation: "Impact positif observé : le KPI évolue dans le sens attendu pour un indicateur où plus bas est meilleur.",
    limitation: "Atlas signale une corrélation observée sur les données disponibles, pas une causalité absolue."
  },
  decisions: [
    "Prioriser la région Est dans le prochain COPIL.",
    "Limiter la sous-traitance aux interventions sans capacité interne disponible.",
    "Suivre la marge et la satisfaction chaque semaine pendant trente jours."
  ],
  memoryReferences: [
    "Objectif validé : réduire la dépendance à la sous-traitance.",
    "Règle métier validée : tout coût sous-traitance supérieur au seuil critique doit déclencher un arbitrage.",
    "Décision historique : préserver la satisfaction client sur les contrats récurrents."
  ],
  executiveDashboard: {
    globalSituation:
      "Situation sous surveillance : l'activité reste solide, mais la marge et la région Est nécessitent une décision rapide.",
    score: 63,
    confidenceLevel: "Élevée",
    nextActions: [
      "Arbitrer la sous-traitance Est.",
      "Valider le plan 30 jours.",
      "Suivre l'impact avant le prochain COPIL."
    ]
  },
  copilBrief: {
    title: "Brief COPIL Nova Services Maintenance",
    arbitrationPoints: [
      "Quelle capacité interne peut remplacer la sous-traitance Est ?",
      "Quels contrats acceptent une renégociation de marge ?",
      "Quel seuil de satisfaction impose une action immédiate ?"
    ],
    decisionsToTake: [
      "Valider le plan 30 jours.",
      "Nommer un responsable de suivi hebdomadaire.",
      "Acter les KPI suivis jusqu'au prochain comité."
    ],
    closingSummary:
      "Atlas transforme une accumulation de signaux dispersés en ordre du jour de pilotage : risques, arbitrages, actions et suivi."
  },
  steps: [
    {
      id: "company",
      order: 1,
      title: "Présentation de Nova Services Maintenance",
      summary:
        "Une PME de maintenance terrain avec plusieurs agences, une activité stable et des coûts opérationnels qui dérivent.",
      leaderMessage: "Le dirigeant comprend immédiatement le contexte : le problème n'est pas l'activité, mais le pilotage de la marge.",
      proofPoints: ["85 collaborateurs", "4 agences régionales", "COPIL à préparer", "Données déjà disponibles mais dispersées"],
      cardTitle: "Point de départ",
      cardItems: ["PME terrain", "Interventions multi-sites", "Décisions dispersées", "Besoin de lecture dirigeant"]
    },
    {
      id: "initial-situation",
      order: 2,
      title: "Situation initiale",
      summary:
        "La marge baisse, le coût de sous-traitance augmente et la satisfaction client commence à se dégrader.",
      leaderMessage: "Atlas met en évidence les trois signaux que le dirigeant doit traiter avant le prochain COPIL.",
      proofPoints: ["Marge brute : 28 %", "Coût sous-traitance : 12800 €", "Satisfaction : 7,1 / 10", "Retards Est : 23 %"],
      cardTitle: "Signaux métier",
      cardItems: ["Marge sous pression", "Sous-traitance en hausse", "Satisfaction en baisse", "Région Est tendue"]
    },
    {
      id: "detection",
      order: 3,
      title: "Détection Atlas",
      summary:
        "Atlas relie les KPI, seuils, règles et connaissances validées pour faire émerger les risques prioritaires.",
      leaderMessage: "Le produit ne se contente pas d'afficher des chiffres : il explique pourquoi ils comptent.",
      proofPoints: ["Alerte critique coût", "Marge à surveiller", "Risque satisfaction", "Objectif mémoire mobilisé"],
      cardTitle: "Ce qu'Atlas détecte",
      cardItems: ["Risque marge", "Risque coût", "Risque qualité", "Fiabilité explicitée"]
    },
    {
      id: "priorities",
      order: 4,
      title: "Priorités Atlas",
      summary:
        "Atlas classe les sujets selon urgence, impact, confiance, alertes et plans existants.",
      leaderMessage: "Le dirigeant voit ce qu'il faut traiter maintenant, pas seulement une liste de voyants.",
      proofPoints: ["Priorité #1 : sous-traitance Est", "Score : 94 / 100", "Urgence critique", "Impact fort"],
      cardTitle: "Top 3 priorités",
      cardItems: ["Réduire la sous-traitance Est", "Sécuriser la marge", "Stabiliser la satisfaction"]
    },
    {
      id: "recommendations",
      order: 5,
      title: "Recommandations Atlas",
      summary:
        "Les recommandations sont déterministes, expliquées et associées à un score de confiance.",
      leaderMessage: "Atlas propose une action parce qu'un faisceau de preuves converge, pas par magie.",
      proofPoints: ["Confiance : 86 %", "KPI critique", "Règle déclenchée", "Objectif mémoire validé"],
      cardTitle: "Recommandation clé",
      cardItems: ["Isoler les coûts", "Reprioriser le planning", "Revoir les contrats faibles", "Consolider l'historique"]
    },
    {
      id: "action-plan",
      order: 6,
      title: "Plan d'action proposé",
      summary:
        "Atlas transforme une recommandation en plan d'action local avec tâches, responsable et échéance.",
      leaderMessage: "La valeur devient opérationnelle : quelqu'un sait quoi faire, quand, et pourquoi.",
      proofPoints: ["Responsable : Direction opérations", "Échéance : 30 juin 2026", "4 tâches", "Impact attendu : +2 pts marge"],
      cardTitle: "Plan 30 jours",
      cardItems: ["Lister les missions coûteuses", "Identifier capacité interne", "Renégocier prestataires", "Présenter au COPIL"]
    },
    {
      id: "impact",
      order: 7,
      title: "Impact observé",
      summary:
        "Atlas compare l'avant et l'après sur les KPI liés au plan pour mesurer un premier effet observable.",
      leaderMessage: "Le dirigeant distingue ce qui progresse, ce qui reste incertain et ce qui doit être confirmé.",
      proofPoints: ["Avant : 12800 €", "Après : 11200 €", "Variation favorable", "Limite : corrélation, pas causalité absolue"],
      cardTitle: "Boucle d'efficacité",
      cardItems: ["KPI avant", "KPI après", "Interprétation", "Limite de fiabilité"]
    },
    {
      id: "executive-dashboard",
      order: 8,
      title: "Dashboard dirigeant",
      summary:
        "La situation est consolidée en une page : score, risques, priorités, actions en cours et décisions récentes.",
      leaderMessage: "En moins de deux minutes, le dirigeant sait où regarder et quoi arbitrer.",
      proofPoints: ["Score exécutif : 63 / 100", "Confiance Atlas : élevée", "Top priorités", "Prochaines actions"],
      cardTitle: "Lecture exécutive",
      cardItems: ["Situation globale", "Risques", "Actions", "Décisions récentes"]
    },
    {
      id: "copil",
      order: 9,
      title: "Préparation COPIL",
      summary:
        "Atlas transforme les signaux en ordre du jour : points d'arbitrage, décisions à prendre et actions suivantes.",
      leaderMessage: "La réunion démarre avec une base claire, argumentée et orientée décision.",
      proofPoints: ["3 arbitrages", "3 décisions à prendre", "Mémoire mobilisée", "Brief copiable"],
      cardTitle: "Ordre du jour prêt",
      cardItems: ["Arbitrages", "Décisions", "Risques", "Actions suivantes"]
    },
    {
      id: "value",
      order: 10,
      title: "Valeur globale d'Atlas",
      summary:
        "Atlas relie données, mémoire, moteur métier et exécution pour aider une PME à piloter ses décisions.",
      leaderMessage: "Ce n'est pas un simple dashboard : c'est une boucle de pilotage explicable.",
      proofPoints: ["Voir les signaux", "Prioriser", "Recommander", "Piloter l'action", "Mesurer l'impact"],
      cardTitle: "Ce que le dirigeant gagne",
      cardItems: ["Temps de décision", "Clarté des priorités", "Traçabilité", "Pilotage des actions"]
    }
  ]
};

export function generateDemoAtlasMarkdown(scenario: DemoAtlasScenario = demoAtlasScenario) {
  const topPriority = scenario.priorities[0];
  const topRecommendation = scenario.recommendations[0];

  return [
    `# Démonstration Atlas - ${scenario.company.name}`,
    "",
    `## Entreprise`,
    `${scenario.company.activity}. ${scenario.company.size}.`,
    "",
    `## Problème métier`,
    scenario.businessProblem,
    "",
    `## Détection Atlas`,
    ...scenario.alerts.map((alert) => `- ${alert}`),
    "",
    `## Priorité principale`,
    `- ${topPriority.title} (${topPriority.score}/100, urgence ${topPriority.urgency}, impact ${topPriority.impact})`,
    `- Raison : ${topPriority.reason}`,
    "",
    `## Recommandation`,
    `- ${topRecommendation.title}`,
    `- Confiance Atlas : ${topRecommendation.confidenceScore} %`,
    `- Pourquoi : ${topRecommendation.why}`,
    `- Action : ${topRecommendation.action}`,
    "",
    `## Plan d'action`,
    `- ${scenario.actionPlan.title}`,
    `- Responsable : ${scenario.actionPlan.owner}`,
    `- Échéance : ${scenario.actionPlan.dueDate}`,
    ...scenario.actionPlan.tasks.map((task) => `- ${task.label} (${task.owner}, ${task.dueDate})`),
    "",
    `## Impact observé`,
    `- Avant : ${scenario.impact.before}`,
    `- Après : ${scenario.impact.after}`,
    `- Interprétation : ${scenario.impact.interpretation}`,
    `- Limite : ${scenario.impact.limitation}`,
    "",
    `## Valeur Atlas`,
    scenario.copilBrief.closingSummary
  ].join("\n");
}
