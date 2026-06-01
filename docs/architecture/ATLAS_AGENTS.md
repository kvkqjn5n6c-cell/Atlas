# Atlas Agents

## Rôle

Les agents Atlas sont des spécialistes métier qui exploitent les données, la mémoire, les KPI, les règles et éventuellement l'IA générative pour produire des résultats ciblés.

Un agent n'est pas un chatbot. Il a une mission, des entrées, des permissions, une mémoire autorisée et des sorties vérifiables.

## Agent KPI

Mission : surveiller la configuration, la qualité et l'évolution des KPI.

Données consommées :
- KPI configurations ;
- KPI results ;
- historiques ;
- sources ;
- dictionnaire métier.

Mémoire utilisée :
- `kpi.md`
- `objectifs.md`
- `regles_metier.md`

Résultats produits :
- KPI à recalculer ;
- KPI incohérents ;
- seuils à revoir ;
- propositions de nouveaux KPI.

## Agent Risques

Mission : identifier les risques prioritaires pour l'entreprise.

Données consommées :
- alertes ;
- KPI critiques ;
- tendances ;
- règles déclenchées ;
- qualité des données.

Mémoire utilisée :
- `processus.md`
- `historique_decisions.md`
- `regles_metier.md`

Résultats produits :
- risques priorisés ;
- causes probables ;
- impacts métier ;
- actions urgentes.

## Agent COPIL

Mission : préparer une lecture comité de pilotage.

Données consommées :
- KPI ;
- alertes ;
- plans d'action ;
- rapports ;
- décisions passées.

Mémoire utilisée :
- `strategie.md`
- `objectifs.md`
- `historique_decisions.md`

Résultats produits :
- ordre du jour ;
- points de décision ;
- avancement ;
- arbitrages à préparer.

## Agent Synthèse dirigeant

Mission : produire une synthèse claire, courte et actionnable.

Données consommées :
- insights ;
- alertes ;
- KPI ;
- règles ;
- fiabilité des données.

Mémoire utilisée :
- ensemble des documents validés pertinents.

Résultats produits :
- situation globale ;
- risques ;
- actions prioritaires ;
- limites de fiabilité.

## Agent Recommandations

Mission : transformer les signaux en actions proposées.

Données consommées :
- alertes ;
- règles ;
- historique d'actions ;
- objectifs.

Mémoire utilisée :
- `regles_metier.md`
- `historique_decisions.md`
- `processus.md`

Résultats produits :
- recommandations ;
- priorités ;
- plans d'action proposés ;
- justification.

## Agent Commercial

Mission : analyser la performance commerciale et les opportunités.

Données consommées :
- chiffre d'affaires ;
- marge ;
- clients ;
- offres ;
- pipeline si disponible.

Mémoire utilisée :
- `clients.md`
- `offres.md`
- `strategie.md`

Résultats produits :
- clients à risque ;
- opportunités ;
- dépendances client ;
- recommandations commerciales.

## Agent Compétences

Mission : relier charge, performance et compétences internes.

Données consommées :
- activité ;
- équipe ;
- charge ;
- qualité ;
- retards.

Mémoire utilisée :
- `equipe.md`
- `processus.md`
- `objectifs.md`

Résultats produits :
- tensions de charge ;
- compétences critiques ;
- besoins d'accompagnement ;
- recommandations d'organisation.

## Gouvernance des agents

- Chaque agent est borné par le tenant.
- Chaque sortie doit être explicable.
- Les agents ne peuvent pas écrire sans validation ou permission.
- Les actions sensibles doivent être auditables.
