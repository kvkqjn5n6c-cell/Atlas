# Dataset Group By Insights V1

Phase 65 transforme une analyse comparative Group By Dataset en insights locaux deterministes.

Le but est de passer de "Atlas compare les groupes" a "Atlas commence a interpreter les ecarts".

## Role

Les insights Group By interpretent les resultats d'une analyse comparative locale :

- meilleur groupe ;
- groupe faible ;
- concentration ;
- dispersion ;
- candidat anomalie.

Ils restent separes des insights KPI existants pour cette phase.

## Regles deterministes

`best_group`

- groupe avec la valeur maximale.

`weak_group`

- groupe avec la valeur minimale.

`concentration`

- declenche si le premier groupe represente plus de 50% du total.

`dispersion`

- declenche si le ratio max/min est superieur a 2.

`anomaly_candidate`

- declenche si le meilleur groupe est tres eloigne de la moyenne simple.

Ces regles ne sont pas statistiques au sens avance. Elles servent uniquement de signaux explicables.

## Severite

Les severites possibles :

- `info`
- `watch`
- `critical`

La criticite depend de l'ecart, de la concentration et de l'eloignement simple a la moyenne.

## Interface

Dans `/datasets`, apres une analyse comparative, Atlas affiche :

- titre ;
- resume ;
- groupe concerne ;
- gravite ;
- raisons ;
- action recommandee.

Un badge indique que ces signaux sont exploitables par les recommandations dans une phase suivante.

## Stockage

Les insights sont stockes localement via `dataset-groupby-insights-store.ts`.

Ils ne sont pas persistés en Prisma.

## Difference avec les insights KPI

Les insights KPI interpretent des KPI locaux, leurs seuils, alertes et historiques.

Les insights Group By interpretent une comparaison de groupes dans un Dataset Atlas.

Ils pourront plus tard alimenter recommandations, priorites et dashboard dirigeant.

## Limites

- pas d'IA ;
- pas de LLM ;
- pas de Prisma ;
- pas de SQL live ;
- pas de moteur statistique avance ;
- pas de detection causale ;
- pas encore d'integration automatique dans recommandations/priorites.
