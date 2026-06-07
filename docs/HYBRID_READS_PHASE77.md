# Phase 77 - Hybrid reads for Prepared SQL Sources and Atlas Datasets

## Resume executif

La Phase 77 etend la lecture hybride Prisma/localStorage aux domaines suivants :

- Prepared SQL Sources ;
- Atlas Datasets.

Objectif : permettre une lecture Prisma lorsque `DATA_MODE=prisma`, tout en conservant le mode localStorage comme mode fiable et le fallback local en cas d'indisponibilite Prisma.

## Audit prealable

| Domaine | Store localStorage | Service hybride | Actions serveur | Consommateurs UI | Lecture directe identifiee |
| --- | --- | --- | --- | --- | --- |
| Prepared SQL Sources | `sql-prepared-sources-store.ts` | `prepared-sql-sources.service.ts` | `prepared-source-persistence-actions.ts` | `/data-sources`, `/dataset-pipeline`, `/sql-mappings` | `/data-sources` et `/dataset-pipeline` lisaient `getPreparedSqlSources()` directement |
| Atlas Datasets | `atlas-datasets-store.ts` | `atlas-datasets.service.ts` | `dataset-persistence-actions.ts` | `/datasets`, `/data-sources`, `/dataset-pipeline` | `/datasets`, `/data-sources` et `/dataset-pipeline` lisaient `getDatasets()` directement |

## Hooks crees

- `usePreparedSqlSourcesWorkspace`
- `useAtlasDatasetsWorkspace`

Chaque hook retourne :

- `data`
- `source`: `local`, `prisma` ou `fallback`
- `isLoading`
- `warnings`
- `reload`

## Actions de lecture ajoutees

- `getPreparedSqlSourcesWorkspaceAction`
- `getAtlasDatasetsWorkspaceAction`

Ces actions appellent les services hybrides existants. Elles ne contiennent pas de logique metier.

## Strategie de lecture

Le premier rendu reste stable avec une donnee vide et une source locale par defaut.

Apres montage client :

1. le hook lit d'abord le localStorage navigateur ;
2. il verifie `DATA_MODE` via le serveur ;
3. en `DATA_MODE=local` ou `mock`, il conserve la lecture locale ;
4. en `DATA_MODE=prisma`, il tente la lecture Prisma via le service hybride ;
5. si Prisma echoue, il conserve les donnees locales et expose `source=fallback`.

## UI modifiee

### `/data-sources`

La section "Sources SQL preparees" utilise maintenant :

- `usePreparedSqlSourcesWorkspace`
- `useAtlasDatasetsWorkspace`

La generation de Dataset reste identique : creation locale puis synchronisation Prisma best-effort.

### `/datasets`

La page lit la liste des Datasets via `useAtlasDatasetsWorkspace`.

Les filtres, KPI Dataset, analyses GroupBy et insights comparatifs restent locaux.

### `/dataset-pipeline`

La vue pipeline utilise les hooks hybrides uniquement pour :

- Prepared SQL Sources ;
- Atlas Datasets.

Les autres briques du pipeline restent locales pour eviter un refactor hors perimetre.

## Domaines non couverts

Non bascules dans cette phase :

- GroupBy Dataset ;
- Insights comparatifs ;
- Dataset KPI ;
- filtres Dataset ;
- KPI locaux ;
- recommandations ;
- priorites ;
- dashboard dirigeant ;
- COPIL ;
- Atlas Memory.

## Risques et limites

- En `DATA_MODE=prisma`, l'UI peut afficher moins de donnees si la migration localStorage vers Prisma n'a pas encore ete executee.
- Le fallback local protege l'usage courant mais ne resout pas les divergences entre navigateur et PostgreSQL.
- Les pages qui combinent plusieurs domaines peuvent encore melanger lectures hybrides et lectures locales.
- Aucune suppression ou migration automatique du localStorage n'est effectuee.

## Prochaines etapes

- Basculer GroupBy et insights comparatifs seulement lorsque la lecture Dataset hybride est stabilisee.
- Utiliser l'outillage Phase 75 avant toute demonstration `DATA_MODE=prisma`.
- Ajouter un indicateur global de source de donnees si Prisma devient le mode principal en environnement client.
