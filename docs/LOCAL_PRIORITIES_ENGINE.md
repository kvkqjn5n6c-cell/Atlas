# Moteur de priorisation local

Le centre de priorisation Atlas répond à une question simple :

> Qu'est-ce qui mérite l'attention maintenant ?

Il agrège les signaux déjà produits par Atlas sans IA, sans LLM, sans Prisma et sans serveur.

## Données utilisées

Le moteur utilise :

- KPI locaux ;
- alertes locales ;
- recommandations déterministes ;
- scores de confiance ;
- plans d'action locaux ;
- impacts mesurés ;
- feedbacks utilisateur ;
- journal décisionnel ;
- connaissances Atlas Memory validées ;
- historique KPI.

## Scoring

Le score est borné entre 0 et 100.

Règles principales :

- alerte critique ou KPI critique : +40 ;
- recommandation `high` : +20 ;
- recommandation `critical` : +30 ;
- confiance Atlas > 80 % : +10 ;
- aucun plan d'action associé : +15 ;
- plan en retard : +20 ;
- impact négatif observé : +15 ;
- feedback négatif : +10 ;
- objectif ou connaissance mémoire liée : +10 ;
- historique KPI insuffisant : -10 et warning.

Une alerte critique force l'urgence métier à `critical`, même si le score est ajusté par un warning de fiabilité.

## Sortie

Chaque priorité contient :

- rang ;
- score ;
- urgence ;
- impact ;
- sources ;
- raisons explicites ;
- warnings ;
- action suivante recommandée.

## Limites

- Le moteur reste local/mock.
- Il ne remplace pas une décision humaine.
- Il ne fait pas d'apprentissage automatique.
- Le score dépend de la qualité des données locales disponibles.
- Les plans et impacts restent liés au navigateur.

## Usage futur

Ces priorités pourront alimenter :

- COPIL ;
- synthèse dirigeant ;
- agents spécialisés ;
- recommandations plus structurées ;
- future persistance Prisma.
