# Mesure locale d'impact des plans d'action

## Objectif

La mesure d'impact locale permet de fermer une première boucle de pilotage :

```text
KPI -> alerte -> recommandation -> plan d'action -> suivi -> impact mesuré
```

Elle reste déterministe, locale et non persistée en base.

## Principe

Atlas compare :

- le dernier point KPI disponible avant la création du plan ;
- le dernier point KPI disponible après la création du plan.

La mesure tient compte du sens du KPI :

- `higher_is_better` : une hausse est favorable ;
- `lower_is_better` : une baisse est favorable.

## Statuts

- `En attente` : un point avant existe, mais aucun point après le plan n'est encore disponible.
- `Non mesurable` : l'historique est insuffisant.
- `Impact positif` : le KPI évolue dans le sens attendu.
- `Impact neutre` : la variation est trop faible pour conclure.
- `Impact négatif` : le KPI évolue dans le mauvais sens.

## Stockage

Les impacts sont stockés localement dans `localStorage` via :

- `src/lib/local/local-action-plan-impact-store.ts`

Ils sont supprimés automatiquement quand le plan local associé est supprimé.

## Limites

La mesure ne prouve pas une causalité.

Elle ne tient pas compte :

- des facteurs externes ;
- d'une saisonnalité ;
- d'un échantillon statistique ;
- de plusieurs périodes complexes ;
- d'une validation humaine.

Elle sert uniquement de premier indicateur de pilotage local.

## Évolution future

Les prochaines étapes naturelles seront :

- persistance Prisma ;
- historique d'exécution plus riche ;
- rapprochement avec les décisions Atlas Memory ;
- analyse multi-périodes ;
- validation humaine de l'effet observé.
