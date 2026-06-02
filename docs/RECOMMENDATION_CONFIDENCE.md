# Score de confiance des recommandations

## Objectif

Le score de confiance Atlas indique à quel point une recommandation est étayée par les données disponibles.

Il est :

- déterministe ;
- explicable ;
- local/mock ;
- sans IA ;
- sans apprentissage automatique.

## Score

Le score est borné entre `0` et `100`.

Niveaux :

- `< 50` : faible ;
- `50 à 74` : moyen ;
- `75 à 89` : élevé ;
- `90+` : très élevé.

## Facteurs pris en compte

Le moteur part d'un score de base, puis applique des facteurs pondérés :

- historique KPI suffisant ou insuffisant ;
- données KPI exploitables ou à consolider ;
- alertes liées, notamment critiques ;
- connaissances validées Atlas Memory ;
- feedback utilisateur favorable ou défavorable ;
- impacts observés des plans d'action.

Chaque facteur possède :

- un libellé ;
- une valeur positive ou négative ;
- un poids ;
- une explication.

## Exemples

Une recommandation gagne en confiance si :

- elle est liée à un KPI avec plusieurs points historiques ;
- elle est confirmée par une alerte critique ;
- elle mobilise un objectif mémoire validé ;
- des recommandations similaires ont été jugées pertinentes ;
- un plan lié a produit un impact positif.

Elle perd en confiance si :

- l'historique KPI est faible ;
- la recommandation porte sur une limite de donnée ;
- les feedbacks utilisateur sont négatifs ;
- les plans liés ont montré un impact défavorable.

## Limites

Le score ne prouve pas qu'une recommandation est vraie.

Il ne remplace pas :

- le jugement dirigeant ;
- la validation métier ;
- un audit de données ;
- une analyse statistique.

Il rend seulement visible le niveau d'appui disponible pour une recommandation.

## Différence avec IA

Ce moteur ne génère pas de texte libre et ne fait aucun apprentissage.

Il applique des règles transparentes sur des signaux déjà présents dans Atlas.

Les futurs agents pourront utiliser ce score comme un signal de prudence, mais ils ne sont pas activés dans cette phase.
