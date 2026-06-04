# Atlas Dataset V1

Phase 61 ajoute une representation normalisee temporaire des donnees SQL preparees.

Le Dataset Atlas ne remplace pas l'import CSV. Il prepare le futur pipeline Atlas en convertissant une preview SQL limitee en records exploitables localement.

## Role

Un Dataset Atlas contient :

- l'identifiant de la source SQL preparee ;
- les champs Atlas disponibles ;
- les records normalises ;
- le score de qualite ;
- les warnings ;
- les statistiques de completude.

## Flux

Connexion SQL
-> Exploration schema
-> Mapping SQL vers Atlas
-> Source SQL preparee
-> Dataset Atlas temporaire

La Phase 61 s'arrete au Dataset. Aucun KPI n'est genere automatiquement.

## Structure

`AtlasDataset`

- `id`
- `sourceId`
- `displayName`
- `rowCount`
- `fields`
- `records`
- `qualityScore`
- `warnings`
- `createdAt`

`AtlasDatasetRecord` conserve uniquement les valeurs des champs Atlas mappes.

## Qualite

Le moteur detecte :

- valeurs manquantes ;
- colonnes entierement vides dans la preview ;
- absence de champs ;
- absence de records ;
- score borne entre 0 et 100.

La completude est calculee sur la preview uniquement.

## Limites

- pas d'import complet ;
- pas de lecture massive SQL ;
- pas d'ETL avance ;
- pas de KPI automatique ;
- pas de Prisma ;
- stockage localStorage ;
- donnees issues uniquement de la preview limitee.

## Interface

- `/data-sources` permet de generer un Dataset Atlas depuis une source SQL preparee.
- `/datasets` affiche les datasets, statistiques, warnings et apercus normalises.

Le CTA "Creer KPI depuis ce dataset" reste desactive et marque Phase suivante.

## Suite logique

La Phase 62 pourra permettre de creer un KPI depuis un Dataset Atlas temporaire, avec selection explicite du champ, du calcul et des seuils.
