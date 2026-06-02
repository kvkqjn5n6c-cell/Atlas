# Local Recommendations Engine

Le moteur de recommandations locales transforme les signaux déjà produits par Atlas en actions déterministes et priorisées.

Il ne fait appel à aucune IA, aucun LLM, aucun agent réel et aucune persistance Prisma.

## Sources utilisées

Le moteur peut utiliser :

- KPI locaux ;
- historique KPI ;
- alertes locales ;
- règles d'alerte personnalisées ;
- insights déterministes ;
- synthèse dirigeant ;
- connaissances validées d'Atlas Memory ;
- context packs préparatoires.

## Types de recommandations

Les catégories principales sont :

- coût ;
- marge ;
- cash ;
- qualité ;
- opérations ;
- fiabilité de donnée ;
- stratégie ;
- commercial ;
- risque.

Chaque recommandation contient :

- priorité ;
- catégorie ;
- résumé ;
- preuves ;
- actions proposées ;
- impact attendu ;
- effort ;
- urgence.

## Règles déterministes actuelles

Le moteur déclenche notamment :

- coût critique ou sous-traitance critique ;
- marge à surveiller ou critique ;
- satisfaction en baisse ;
- règle personnalisée déclenchée ;
- historique insuffisant ;
- conflit ou alignement avec un objectif mémoire validé.

## Explicabilité

Chaque recommandation indique :

- le KPI ou l'alerte qui l'a déclenchée ;
- les insights liés ;
- les références mémoire validées si elles existent ;
- l'action proposée et l'impact attendu.

Les connaissances `detected` ou `rejected` ne sont pas utilisées comme base de recommandation.

## Différence avec un futur agent IA

Ce moteur ne raisonne pas en langage naturel libre.

Il applique des règles explicites et testables. Les futurs agents pourront consommer ces recommandations, les context packs et Atlas Memory, mais ils ne remplacent pas cette base déterministe.

## Limites

- règles encore volontairement simples ;
- pas de scoring financier avancé ;
- pas de simulation de scénarios ;
- pas de validation humaine de recommandation ;
- pas de persistance ;
- pas de workflow d'exécution.
