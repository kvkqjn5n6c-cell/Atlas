# Plans d'action locaux

## Objectif

Les plans d'action locaux permettent de transformer une recommandation Atlas en action suivie, sans base de données et sans persistance serveur.

Le flux cible est :

```text
KPI / alertes / règles / insights
-> recommandation déterministe
-> plan d'action local
-> suivi dans /action-plans
```

## Fonctionnement

Un plan local est créé depuis une recommandation dans :

- `/pilotage`, section `Recommandations Atlas` ;
- `/reports`, section `Plan d'action recommandé`.

Le plan reprend :

- le titre et la description de la recommandation ;
- la priorité ;
- les KPI liés ;
- l'alerte liée si elle existe ;
- l'impact attendu ;
- les actions proposées sous forme de tâches.

## Stockage

Les plans sont stockés dans `localStorage` via :

- `src/lib/local/local-action-plans-store.ts`

Ils restent :

- locaux au navigateur ;
- non partagés ;
- non persistés en base ;
- supprimables sans impact sur les mocks historiques.

## Page Plans d'action

La page `/action-plans` affiche désormais deux familles :

- plans modèles mockés ;
- plans locaux créés depuis les recommandations Atlas.

Les plans locaux peuvent être :

- passés de `À faire` à `En cours`, puis `Terminé` ;
- supprimés ;
- suivis tâche par tâche.

## Context packs

Les context packs peuvent inclure les plans locaux pour préparer les futurs usages :

- recommandations opérationnelles ;
- synthèse dirigeant ;
- revue des risques.

Aucun agent réel ni IA générative n'est activé à ce stade.

## Limites

- Aucun stockage Prisma.
- Aucun workflow d'assignation réel.
- Aucune notification.
- Aucun audit trail complet.
- Les plans locaux ne sont pas synchronisés entre utilisateurs.

## Évolution prévue

La prochaine étape naturelle consiste à préparer la persistance Prisma des plans d'action, puis à relier ces plans à une gouvernance d'exécution plus robuste : propriétaires, échéances, statuts, historique et traçabilité.
