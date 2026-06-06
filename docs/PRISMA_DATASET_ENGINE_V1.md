# Prisma Dataset Engine V1

## Objectif

La Phase 73 rend Prisma-ready deux briques du pipeline Dataset Atlas :

- Prepared SQL Sources ;
- Atlas Datasets.

Cette phase ne migre pas les lectures UI vers Prisma. Les ecrans continuent de lire les donnees depuis localStorage afin de preserver le comportement actuel. Prisma est utilise uniquement en synchronisation best effort lors des creations, mises a jour et suppressions exposees par les services.

## Audit prealable

### `sql-prepared-sources-store.ts`

Role :

- stocke des `PreparedSqlSourceBundle` dans localStorage ;
- un bundle contient `source` et `preview` ;
- cle localStorage : `atlas-sql-prepared-sources-v1`.

Types utilises :

- `PreparedSqlSource` ;
- `PreparedSqlPreview` ;
- `PreparedSqlSourceBundle` ;
- `PreparedSqlMappedField` ;
- `PreparedSqlAvailableAtlasField`.

Flux :

- creation depuis `/sql-mappings` apres validation d'un mapping SQL ;
- lecture depuis `/sql-mappings`, `/data-sources`, `/dataset-pipeline` ;
- suppression disponible dans le store mais peu exposee dans l'UI actuelle.

Consommateurs principaux :

- `src/components/sql-mappings/sql-mappings-page.tsx` ;
- `src/components/data-sources/prepared-sql-sources-section.tsx` ;
- `src/components/dataset-pipeline/dataset-pipeline-page.tsx`.

### `atlas-datasets-store.ts`

Role :

- stocke des `AtlasDataset` dans localStorage ;
- cle localStorage : `atlas-datasets-v1`.

Types utilises :

- `AtlasDataset` ;
- `AtlasDatasetField` ;
- `AtlasDatasetRecord`.

Flux :

- creation depuis `/data-sources` a partir d'une source SQL preparee ;
- lecture depuis `/datasets`, `/pilotage` via services locaux, `/dataset-pipeline` ;
- suppression disponible dans le store mais peu exposee dans l'UI actuelle.

Consommateurs principaux :

- `src/components/data-sources/prepared-sql-sources-section.tsx` ;
- `src/components/datasets/atlas-datasets-page.tsx` ;
- `src/components/dataset-pipeline/dataset-pipeline-page.tsx` ;
- `src/lib/services/local-data/local-kpis-data.service.ts`.

## Modeles Prisma

### `PreparedSqlSource`

Champs retenus :

- `id` ;
- `organizationId` ;
- `connectionId` ;
- `tableName` ;
- `schema` ;
- `displayName` ;
- `mappingId` ;
- `mappedFields` ;
- `qualityScore` ;
- `rowPreviewCount` ;
- `availableAtlasFields` ;
- `warnings` ;
- `preview` ;
- `persistedSource` ;
- `metadata` ;
- timestamps.

La preview est conservee en JSON car la Phase 73 ne cree pas de pipeline d'import ni de table de records SQL.

### `AtlasDataset`

Champs retenus :

- `id` ;
- `organizationId` ;
- `sourceId` ;
- `displayName` ;
- `rowCount` ;
- `fields` ;
- `records` ;
- `qualityScore` ;
- `warnings` ;
- `persistedSource` ;
- `metadata` ;
- timestamps.

Les `fields` et `records` restent en JSON. Cela correspond a la nature temporaire du Dataset V1, base sur preview uniquement.

## Migration

Migration creee :

```text
prisma/migrations/20260606160000_add_dataset_persistence/migration.sql
```

Elle ajoute :

- table `PreparedSqlSource` ;
- table `AtlasDataset` ;
- indexes utiles ;
- relations vers `Organization` ;
- relation `AtlasDataset.sourceId -> PreparedSqlSource.id`.

## Repositories

Repositories crees :

- `src/lib/repositories/prepared-sql-sources.repository.ts` ;
- `src/lib/repositories/atlas-datasets.repository.ts`.

Responsabilites :

- `getAll` ;
- `getById` ;
- `create/update` via upsert ;
- `delete` ;
- fallback localStorage si Prisma echoue.

Aucune logique metier n'est placee dans les repositories.

## Services hybrides

Services crees :

- `src/lib/services/prepared-sql-sources.service.ts` ;
- `src/lib/services/atlas-datasets.service.ts`.

Retour standard :

- `source: "local"` ;
- `source: "prisma"` ;
- `source: "fallback"`.

Mode :

- `DATA_MODE=local` : localStorage ;
- `DATA_MODE=prisma` : Prisma ;
- erreur Prisma : fallback localStorage.

## Actions serveur

Actions creees :

- `src/lib/actions/prepared-source-persistence-actions.ts` ;
- `src/lib/actions/dataset-persistence-actions.ts`.

Elles sont utilisees en best effort depuis :

- `/sql-mappings` lors de la preparation d'une source SQL ;
- `/data-sources` lors de la generation d'un Dataset Atlas.

## Integration UI

Lectures UI conservees en localStorage.

Synchronisation Prisma best effort ajoutee sur :

- creation de Prepared SQL Source dans `sql-mappings-page.tsx` ;
- creation de Dataset Atlas dans `prepared-sql-sources-section.tsx`.

Les pages `/datasets` et `/dataset-pipeline` continuent de consommer les stores locaux pendant cette phase.

## Tests

Suites ajoutees :

- `tests/persistence/prepared-source-persistence.test.ts` ;
- `tests/persistence/dataset-persistence.test.ts`.

Cas couverts :

- creation locale ;
- lecture locale ;
- creation Prisma simulee ;
- fallback local si Prisma echoue ;
- suppression locale.

## Limites

- Les lectures UI restent locales.
- Les Datasets V1 restent bases sur preview SQL limitee.
- Aucune ingestion SQL complete n'est creee.
- Aucun KPI, GroupBy, insight, recommandation ou dashboard n'est modifie par cette phase.
- Le modele `AtlasDataset` utilise une organisation par defaut quand le type dataset ne porte pas encore `organizationId`.
- La baseline Docker documentaire devra etre regeneree ou remplacee par une baseline Prisma officielle si ces tables doivent exister des l'initialisation Docker.
