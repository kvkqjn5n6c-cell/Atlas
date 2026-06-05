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

Un badge indique que ces signaux sont exploites par les recommandations et priorites Atlas.

## Integration decisionnelle

Depuis la Phase 66, les insights Group By sauvegardes localement sont exposes dans le workspace local Atlas.

Ils peuvent alimenter :

- les recommandations Atlas, via `sourceType = dataset_groupby_insight` ;
- les priorites Atlas, avec score, urgence et sources liees ;
- le dashboard dirigeant, comme signaux comparatifs et risques a surveiller ;
- le brief COPIL, comme points d'arbitrage.

Les regles restent simples et deterministes :

- `concentration` genere une recommandation d'analyse de concentration ;
- `weak_group` genere une recommandation d'examen du groupe le moins performant ;
- `anomaly_candidate` genere une recommandation d'audit du groupe atypique ;
- `dispersion` genere une recommandation de comparaison des pratiques entre groupes.

Les objets produits conservent les liens vers :

- `relatedDatasetIds` ;
- `relatedGroupByInsightIds` ;
- l'analyse Group By source ;
- les raisons explicables de l'insight.

## Passage a l'action

Depuis la Phase 67, une recommandation issue d'un insight comparatif peut etre transformee explicitement en plan d'action local.

La boucle couverte est :

Dataset Atlas
-> Analyse Group By
-> Insight comparatif
-> Recommandation Atlas
-> Plan d'action local
-> Journal decisionnel

Le plan cree depuis une recommandation `dataset_groupby_insight` conserve :

- le ou les `relatedDatasetIds` ;
- le ou les `relatedGroupByInsightIds` ;
- le groupe concerne (`groupValue`) ;
- le libelle de source dataset (`datasetSourceLabel`) ;
- les actions proposees par la recommandation ;
- l'impact attendu.

La creation reste volontaire : Atlas propose le plan, mais l'utilisateur clique explicitement sur "Creer un plan d'action".

Le journal decisionnel enregistre aussi ces references afin de retracer pourquoi le plan a ete lance et quel signal comparatif l'a declenche.

## Stockage

Les insights sont stockes localement via `dataset-groupby-insights-store.ts`.

Ils ne sont pas persistés en Prisma.

## Difference avec les insights KPI

Les insights KPI interpretent des KPI locaux, leurs seuils, alertes et historiques.

Les insights Group By interpretent une comparaison de groupes dans un Dataset Atlas.

Ils alimentent maintenant les recommandations, les priorites, le dashboard dirigeant et le COPIL.

## Limites

- pas d'IA ;
- pas de LLM ;
- pas de Prisma ;
- pas de SQL live ;
- pas de moteur statistique avance ;
- pas de detection causale ;
- pas de recommandation avancee ou causale ;
- pas de lien automatique vers un plan d'action sans validation utilisateur.
