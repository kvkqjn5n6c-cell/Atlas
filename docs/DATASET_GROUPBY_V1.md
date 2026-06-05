# Dataset Group By V1

Phase 64 ajoute une premiere analyse comparative locale sur les Datasets Atlas.

Le Group By Dataset permet de comparer des groupes metier sans SQL live, sans Prisma, sans IA, sans pivot complexe et sans moteur BI complet.

## Flux

Dataset Atlas
-> Filtres Dataset optionnels
-> Group By simple
-> Resultat comparatif

Le moteur travaille uniquement sur les records deja presents dans le Dataset Atlas local.

## Types

`DatasetGroupByDefinition`

- `id`
- `datasetId`
- `field`
- `label`
- `createdAt`

`DatasetGroupByResult`

- `groupValue`
- `rowCount`
- `value`
- `percentage`

`DatasetGroupByAnalysis`

- `datasetId`
- `aggregation`
- `field`
- `groupedBy`
- `results`
- `generatedAt`

## Agregations supportees

V1 supporte uniquement :

- `COUNT`
- `SUM`
- `AVERAGE`

Pas de mediane, percentile, min/max avance, serie temporelle, pivot ou cube OLAP.

## Statistiques comparatives

Le moteur produit :

- meilleur groupe ;
- moins bon groupe ;
- ecart ;
- dispersion simple ;
- nombre de groupes.

Ces statistiques sont descriptives et basees uniquement sur la preview locale.

## Interface

Dans `/datasets`, la section "Analyse comparative" permet de choisir :

- aggregation ;
- champ KPI ;
- champ de regroupement.

Elle affiche :

- tableau des groupes ;
- meilleur groupe ;
- moins bon groupe ;
- ecart ;
- dispersion ;
- historique local des analyses sauvegardees.

## Stockage

Les analyses Group By sont historisees en localStorage via `dataset-groupby-store.ts`.

## Limites

- pas de SQL live ;
- pas de recalcul depuis base source ;
- pas de group by multi-colonnes ;
- pas de pivot ;
- pas de filtre `OR` ;
- pas de series temporelles ;
- calcul limite aux records du Dataset Atlas.
