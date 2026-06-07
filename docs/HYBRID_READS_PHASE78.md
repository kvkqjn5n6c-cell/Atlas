# Phase 78 - Hybrid reads for Dataset GroupBy and comparative insights

## Resume executif

La Phase 78 etend la lecture hybride Prisma/localStorage aux domaines suivants :

- analyses GroupBy Dataset ;
- insights comparatifs Dataset.

Les moteurs de calcul restent inchanges. La phase ne modifie que la source de lecture UI lorsque `DATA_MODE=prisma`, avec fallback local obligatoire.

## Audit prealable

| Domaine | Store localStorage | Service hybride | Actions serveur | Consommateurs UI | Lecture directe identifiee |
| --- | --- | --- | --- | --- | --- |
| Dataset GroupBy Analyses | `dataset-groupby-store.ts` | `dataset-groupby.service.ts` | `dataset-groupby-persistence-actions.ts` | `/datasets`, `/dataset-pipeline` | lectures directes `getDatasetGroupByAnalyses()` et `getDatasetGroupByAnalysesByDatasetId()` |
| Dataset GroupBy Insights | `dataset-groupby-insights-store.ts` | `dataset-groupby-insights.service.ts` | `dataset-groupby-insights-persistence-actions.ts` | `/datasets`, `/dataset-pipeline` | lectures directes `getGroupByInsights()` et `getGroupByInsightsByAnalysisId()` |

## Hooks crees

- `useDatasetGroupByWorkspace`
- `useDatasetGroupByInsightsWorkspace`

Chaque hook retourne :

- `data`
- `source`: `local`, `prisma` ou `fallback`
- `isLoading`
- `warnings`
- `reload`

## Actions de lecture ajoutees

- `getDatasetGroupByWorkspaceAction`
- `getDatasetGroupByInsightsWorkspaceAction`

Ces actions appellent les services hybrides existants. Elles ne contiennent pas de logique metier.

## Strategie de lecture

Le premier rendu reste stable avec une donnee vide et une source locale par defaut.

Apres montage client :

1. le hook lit d'abord le localStorage navigateur ;
2. il verifie `DATA_MODE` via le serveur ;
3. si `DATA_MODE` n'est pas `prisma`, il conserve les donnees locales ;
4. si `DATA_MODE=prisma`, il tente la lecture Prisma ;
5. si Prisma echoue, il conserve les donnees locales et expose `source=fallback`.

## UI modifiee

### `/datasets`

La page utilise maintenant les hooks hybrides pour :

- l'historique des analyses GroupBy ;
- les insights comparatifs sauvegardes.

La creation d'analyse, la generation d'insights, les filtres et le generateur KPI Dataset restent inchanges.

### `/dataset-pipeline`

La page pipeline utilise maintenant les hooks hybrides pour :

- GroupBy analyses ;
- GroupBy insights.

Les autres briques non couvertes restent locales.

## Domaines non couverts

Non bascules dans cette phase :

- Dataset KPI ;
- filtres Dataset ;
- KPI locaux ;
- recommandations ;
- priorites ;
- dashboard dirigeant ;
- COPIL ;
- Atlas Memory ;
- connecteurs SQL ;
- SQL mappings.

## Risques et limites

- En `DATA_MODE=prisma`, les analyses et insights affiches peuvent differer du localStorage si la migration explicite n'a pas ete executee.
- Le fallback local preserve l'usage mais ne synchronise pas automatiquement PostgreSQL et navigateur.
- Les pages combinent encore plusieurs sources de lecture : hybride pour GroupBy/insights, local pour filtres et Dataset KPI.
- Aucune suppression localStorage n'est realisee.

## Prochaines etapes

- Basculer Dataset KPI et filtres uniquement apres stabilisation de cette phase.
- Utiliser la migration Phase 75 avant une demonstration complete en mode Prisma.
- Ajouter un indicateur transversal de source si `DATA_MODE=prisma` devient le mode client principal.
