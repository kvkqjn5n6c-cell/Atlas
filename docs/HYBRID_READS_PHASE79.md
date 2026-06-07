# Phase 79 - Hybrid reads for Dataset Filters and Dataset KPI

## Resume executif

La Phase 79 rend Prisma-ready et lisibles en mode hybride les deux derniers blocs locaux importants du pipeline Dataset :

- Dataset Filters ;
- Dataset KPI definitions.

Les moteurs de filtrage, de calcul KPI et les KPI locaux existants ne sont pas modifies.

## Audit prealable

| Domaine | Store localStorage | Types | Consommateurs UI | Lecture directe identifiee |
| --- | --- | --- | --- | --- |
| Dataset Filters | `dataset-filters-store.ts` | `dataset-filter-types.ts` | `/datasets` | `getDatasetFilterSetsByDatasetId()` |
| Dataset KPI | `dataset-kpi-store.ts` | `dataset-kpi-types.ts` | `/datasets`, `/dataset-pipeline` | `getDatasetKpis()` |

`/kpi-configuration` consomme les KPI locaux generes depuis Dataset apres conversion vers `LocalKpiConfiguration`. Il ne lit pas directement `dataset-kpi-store.ts`.

## Modeles Prisma

Modeles ajoutes :

- `DatasetFilterSet`
- `DatasetKpiDefinition`

Champs principaux :

- `organizationId`
- `datasetId`
- donnees JSON necessaires (`filters`, `filterSet`)
- definition KPI (`name`, `description`, `type`, `field`, `secondaryField`, `aggregation`, seuils)
- `persistedSource`
- timestamps

Migration ajoutee :

- `20260607130000_add_dataset_filters_kpi_persistence`

## Couches ajoutees

Repositories :

- `dataset-filters.repository.ts`
- `dataset-kpi.repository.ts`

Services hybrides :

- `dataset-filters.service.ts`
- `dataset-kpi.service.ts`

Actions serveur :

- `dataset-filters-persistence-actions.ts`
- `dataset-kpi-persistence-actions.ts`

Hooks :

- `useDatasetFiltersWorkspace`
- `useDatasetKpiWorkspace`

## Strategie DATA_MODE

En `DATA_MODE=local` ou `mock` :

- lecture localStorage ;
- ecriture locale ;
- aucun besoin Prisma.

En `DATA_MODE=prisma` :

- tentative de lecture Prisma ;
- tentative d'ecriture Prisma via actions serveur ;
- fallback localStorage si Prisma echoue.

Le premier rendu client reste stable : les hooks initialisent une donnee vide puis chargent apres montage.

## UI modifiee

### `/datasets`

La page lit maintenant via hooks hybrides :

- jeux de filtres sauvegardes ;
- definitions KPI Dataset sauvegardees.

Les actions restent :

- sauvegarde localStorage en premier ;
- synchronisation Prisma best-effort ensuite.

### `/dataset-pipeline`

La page lit les definitions KPI Dataset via hook hybride pour alimenter la vue pipeline.

Les filtres Dataset n'ont pas encore de noeud dedie dans le moteur pipeline ; leur source hybride est affichee mais ne modifie pas le score.

## Domaines encore non couverts

- lectures UI KPI locaux ;
- historique KPI local ;
- alertes locales ;
- recommandations/priorites issues Dataset ;
- context packs ;
- Atlas Memory UI complete.

## Risques et limites

- En `DATA_MODE=prisma`, les donnees affichees peuvent differer du navigateur si la migration localStorage vers PostgreSQL n'a pas ete executee.
- Le fallback local preserve l'usage mais ne synchronise pas automatiquement PostgreSQL et localStorage.
- Les KPI Dataset convertis en KPI locaux restent geres par les stores KPI locaux.
- Aucune suppression localStorage n'est effectuee.

## Prochaines etapes

- Basculer progressivement les lectures KPI locales seulement apres stabilisation du pipeline Dataset.
- Utiliser l'outil de migration Phase 75 pour alimenter Prisma avant une demonstration en `DATA_MODE=prisma`.
- Ajouter une vue admin de divergence localStorage/PostgreSQL si Prisma devient le mode principal.
