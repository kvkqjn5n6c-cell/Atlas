# Dashboard Dirigeant Local

Le Dashboard Dirigeant est la page de lecture exécutive d'Atlas. Son rôle est de répondre rapidement à une question simple : que doit regarder un dirigeant en moins de deux minutes ?

Il ne remplace pas `/pilotage`. Le cockpit reste la page d'analyse détaillée des KPI, alertes, recommandations, plans, mémoire et historique. Le dashboard `/executive` agrège ces informations en une synthèse courte, orientée décision.

## Sources utilisées

Le moteur local consomme uniquement des données déterministes et locales :

- résultats de KPI locaux ;
- alertes locales ;
- insights et synthèse dirigeant ;
- recommandations Atlas ;
- priorités Atlas ;
- plans d'action locaux ;
- impacts mesurés ;
- feedbacks disponibles ;
- journal décisionnel ;
- connaissances validées d'Atlas Memory ;
- scores de confiance des recommandations.

Aucune IA, aucun LLM et aucune écriture Prisma ne sont utilisés dans cette version.

## Score exécutif

Le score est borné entre 0 et 100.

Facteurs qui dégradent le score :

- priorités critiques ;
- priorités élevées ;
- alertes critiques ;
- alertes de surveillance ;
- impacts négatifs ;
- confiance moyenne faible.

Facteurs qui améliorent la lecture :

- plans d'action actifs ;
- impacts positifs ;
- confiance moyenne élevée.

Le statut global est déterminé ainsi :

- `healthy` : score supérieur ou égal à 75 ;
- `watch` : score entre 50 et 74 ;
- `critical` : score inférieur à 50.

## Sections affichées

La page `/executive` affiche :

- situation globale ;
- top priorités ;
- risques critiques ;
- recommandations clés ;
- plans d'action en cours ;
- impacts récents ;
- décisions récentes ;
- mémoire Atlas mobilisée ;
- prochaines meilleures actions ;
- notes de fiabilité.

## Différence avec /pilotage et /priorities

`/pilotage` donne une vue métier détaillée du cockpit. Il affiche les KPI personnalisés, tendances, synthèses, recommandations, feedbacks, plans et activité récente.

`/priorities` explique le classement complet des sujets à traiter.

`/executive` sélectionne et réduit l'information pour une lecture dirigeant rapide.

## Limites actuelles

- Le dashboard reste local/mocké.
- Le score n'est pas un modèle prédictif.
- Les données CSV complètes ne sont pas persistées.
- La fiabilité dépend de l'historique KPI et de la qualité des mappings.
- Les connaissances mémoire utilisées sont uniquement celles validées.

## Évolution future

Le dashboard pourra alimenter :

- Atlas Memory persistante ;
- agents spécialisés ;
- préparation COPIL ;
- rapports exécutifs ;
- recommandations enrichies ;
- future couche Atlas IA encadrée.
