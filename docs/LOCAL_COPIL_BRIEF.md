# Brief COPIL local

La vue COPIL locale prépare une réunion de pilotage à partir des données déjà produites par Atlas.

Elle ne crée pas de nouvelle donnée métier. Elle assemble les éléments existants dans un format de réunion :

- situation globale ;
- KPI à examiner ;
- alertes critiques ;
- recommandations ;
- plans d'action ;
- impacts mesurés ;
- décisions récentes ;
- points à arbitrer ;
- prochaines actions ;
- références mémoire mobilisées ;
- notes de confiance.

## Données utilisées

Le moteur `src/lib/copil/local-copil-brief-engine.ts` utilise :

- résultats KPI locaux ;
- alertes locales ;
- insights déterministes ;
- synthèse dirigeant locale ;
- recommandations Atlas ;
- plans d'action locaux ;
- impacts mesurés ;
- feedbacks recommandation ;
- scores de confiance ;
- références Atlas Memory validées ;
- journal décisionnel ;
- context pack `copil_preparation`.

## Fonctionnement

La génération reste déterministe :

- les KPI critiques et à surveiller sont priorisés ;
- les alertes critiques deviennent des sujets de réunion ;
- les recommandations critiques ou hautes deviennent des points d'action ;
- les plans actifs sont repris dans le suivi ;
- les impacts négatifs ou non mesurables alimentent les arbitrages ;
- le journal décisionnel apporte l'historique récent.

## Export Markdown

Le bouton “Copier le brief” génère un Markdown simple contenant :

- situation ;
- risques ;
- décisions ;
- actions ;
- points à arbitrer.

Il n'y a pas d'export PDF, Word ou serveur dans cette phase.

## Limites

- Tout reste local/mock.
- Aucune écriture Prisma.
- Aucun LLM, chatbot ou agent réel.
- Les données sont liées au navigateur.
- La qualité du brief dépend de la présence de KPI, plans, impacts et décisions locales.

## Futur agent COPIL

Cette phase prépare un futur agent COPIL, mais ne l'implémente pas.

À terme, l'agent pourra consommer :

- le brief structuré ;
- le context pack COPIL ;
- Atlas Memory validée ;
- le journal décisionnel ;
- les plans d'action et impacts.
