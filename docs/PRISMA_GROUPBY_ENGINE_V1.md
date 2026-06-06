# Prisma GroupBy Engine V1

## Objectif

La Phase 74 rend Prisma-ready deux objets du pipeline Dataset Atlas :

- `DatasetGroupByAnalysis` ;
- `DatasetGroupByInsight`.

Cette phase ne modifie pas les moteurs GroupBy, les moteurs d'insights, les recommandations, les priorites, les plans d'action, le dashboard, le COPIL ou l'UX. Les lectures UI restent en localStorage.

## Perimetre

Inclus :

- analyses GroupBy Dataset ;
- insights comparatifs Dataset ;
- repositories Prisma-ready ;
- services hybrides `local/prisma/fallback` ;
- actions serveur best effort ;
- synchronisation Prisma apres sauvegarde locale dans `/datasets`.

Exclus :

- migration des donnees localStorage existantes ;
- lecture UI depuis Prisma ;
- modification des moteurs Dataset ;
- modification recommandations/priorites/plans/dashboard/COPIL ;
- SQL live ;
- IA.

## Audit prealable

### `dataset-groupby-store.ts`

Role :

- stocke les `DatasetGroupByAnalysis` dans localStorage ;
- cle : `atlas-dataset-groupby-analyses-v1` ;
- trie par `generatedAt` descendant.

Flux :

- creation depuis `/datasets`, fonction `runGroupBy()` ;
- lecture depuis `/datasets`, `/dataset-pipeline`, `local-kpis-data.service.ts` ;
- suppression disponible par id dans le store.

Types utilises :

- `DatasetGroupByAnalysis` ;
- `DatasetGroupByDefinition` ;
- `DatasetGroupByResult`.

### `dataset-groupby-insights-store.ts`

Role :

- stocke les `DatasetGroupByInsight` dans localStorage ;
- cle : `atlas-dataset-groupby-insights-v1` ;
- remplace les insights existants par `groupByAnalysisId` lors de la sauvegarde.

Flux :

- creation depuis `/datasets` apres generation deterministe des insights ;
- lecture depuis `/datasets`, `/dataset-pipeline`, `local-kpis-data.service.ts` ;
- consommation indirecte par recommandations, priorites, dashboard, COPIL et context packs.

Types utilises :

- `DatasetGroupByInsight` ;
- `DatasetGroupByInsightType` ;
- `DatasetGroupByInsightSeverity`.

### `atlas-datasets-page.tsx`

Point d'ecriture concerne :

- `saveDatasetGroupByAnalysis(...)` ;
- `saveGroupByInsights(...)`.

La Phase 74 ajoute uniquement une synchronisation Prisma best effort apres ces sauvegardes locales.

## Modeles Prisma

### `DatasetGroupByAnalysis`

Champs :

- `id` ;
- `organizationId` ;
- `datasetId` ;
- `aggregation` ;
- `field` ;
- `groupedBy` en JSON ;
- `results` en JSON ;
- `summary` en JSON optionnel ;
- `warnings` ;
- `generatedAt` ;
- `persistedSource` ;
- `metadata` ;
- timestamps.

Relations :

- `Organization` ;
- `AtlasDataset` ;
- `DatasetGroupByInsight`.

Indexes :

- `organizationId` ;
- `datasetId` ;
- `aggregation` ;
- `generatedAt`.

### `DatasetGroupByInsight`

Champs :

- `id` ;
- `organizationId` ;
- `datasetId` ;
- `groupByAnalysisId` ;
- `title` ;
- `summary` ;
- `insightType` ;
- `severity` ;
- `groupValue` ;
- `value` ;
- `comparisonValue` ;
- `gap` ;
- `reasons` ;
- `recommendedAction` ;
- `persistedSource` ;
- `metadata` ;
- timestamps.

Relations :

- `Organization` ;
- `AtlasDataset` ;
- `DatasetGroupByAnalysis`.

Indexes :

- `organizationId` ;
- `datasetId` ;
- `groupByAnalysisId` ;
- `severity` ;
- `insightType`.

## Migration

Migration creee :

```text
prisma/migrations/20260606170000_add_dataset_groupby_persistence/migration.sql
```

Elle ajoute :

- `DatasetGroupByAnalysis` ;
- `DatasetGroupByInsight` ;
- indexes ;
- contraintes vers `Organization`, `AtlasDataset` et `DatasetGroupByAnalysis`.

## Repositories

Repositories crees :

- `src/lib/repositories/dataset-groupby.repository.ts` ;
- `src/lib/repositories/dataset-groupby-insights.repository.ts`.

Fonctions couvertes :

- `getAll` ;
- `getById` ;
- `getByDatasetId` ;
- `create/update` via upsert ;
- `delete` ;
- `deleteByDatasetId` ;
- `deleteByAnalysisId` pour les insights.

Aucune logique metier GroupBy ou insight n'est ajoutee dans ces repositories.

## Services hybrides

Services crees :

- `src/lib/services/dataset-groupby.service.ts` ;
- `src/lib/services/dataset-groupby-insights.service.ts`.

Retour standard :

- `source: "local"` ;
- `source: "prisma"` ;
- `source: "fallback"` ;
- `warnings`.

Comportement :

- `DATA_MODE=local` : localStorage ;
- `DATA_MODE=prisma` : Prisma ;
- erreur Prisma : fallback localStorage.

## Actions serveur

Actions creees :

- `src/lib/actions/dataset-groupby-persistence-actions.ts` ;
- `src/lib/actions/dataset-groupby-insights-persistence-actions.ts`.

Elles sont appelees en best effort depuis `/datasets`, apres sauvegarde locale.

## Fonctionnement hybride

Flux actuel :

```text
/datasets
-> moteur GroupBy existant
-> save localStorage
-> action serveur best effort
-> service hybride
-> repository
-> Prisma si DATA_MODE=prisma
-> fallback localStorage si erreur
```

Les lectures restent :

```text
UI -> localStorage
```

Cela preserve le comportement utilisateur et evite une migration brutale.

## Tests

Suites ajoutees :

- `tests/persistence/dataset-groupby-persistence.test.ts` ;
- `tests/persistence/dataset-groupby-insights-persistence.test.ts`.

Cas couverts :

- mode local ;
- mode Prisma simule ;
- fallback Prisma ;
- creation analyse ;
- creation insight ;
- suppression par dataset ;
- suppression insights par analysisId.

## Limites

- La lecture UI reste localStorage.
- Les donnees localStorage existantes ne sont pas migrees.
- La baseline Docker documentaire ne contient pas encore ces tables.
- `AtlasDataset` doit exister en base pour que la persistance Prisma des analyses et insights fonctionne sans violation de cle etrangere.
- `DATA_MODE=local` reste le mode fiable par defaut.

## Prochaines etapes

1. Stabiliser une baseline Prisma officielle incluant les tables Dataset et GroupBy.
2. Ajouter un seed ou une fixture Docker couvrant Prepared Source, Dataset, GroupBy et Insight.
3. Preparer une lecture hybride progressive pour le pipeline Dataset, sans basculer brutalement l'UI.
4. Ajouter une verification Docker en `DATA_MODE=prisma` quand la baseline sera officielle.
