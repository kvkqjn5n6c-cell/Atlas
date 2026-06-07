# Migration localStorage vers Prisma

## Objectif

La Phase 75 prepare une migration controlee des donnees locales Atlas vers PostgreSQL/Prisma.

La migration est explicite :

```text
localStorage -> export JSON -> validation -> import Prisma best effort -> rapport
```

Elle ne supprime pas localStorage, ne force pas `DATA_MODE=prisma`, ne declenche aucune migration silencieuse et ne modifie pas les moteurs metier.

## Domaines couverts

| Store localStorage | Domaine export | Modele Prisma cible | Service hybride | Criticite |
| --- | --- | --- | --- | --- |
| `local-kpi-store.ts` | `local_kpis` | `LocalKpiConfiguration` | `local-kpi.service.ts` | Critique |
| `local-kpi-results-store.ts` | `local_kpi_results` | `LocalKpiResult` | `local-kpi-results.service.ts` | Critique |
| `local-kpi-history-store.ts` | `local_kpi_history` | `LocalKpiHistoryPoint` | `local-kpi-history.service.ts` | Critique |
| `local-alert-rules-store.ts` | `local_alert_rules` | `LocalAlertRule` | `local-alert-rules.service.ts` | Critique |
| `local-alert-snapshots-store.ts` | `local_alert_snapshots` | `LocalAlertSnapshot` | `local-alert-snapshots.service.ts` | Important |
| `local-action-plans-store.ts` | `local_action_plans` | `LocalActionPlan` | `local-action-plans.service.ts` | Critique |
| `local-recommendation-feedback-store.ts` | `recommendation_feedback` | `LocalRecommendationFeedback` | `recommendation-feedback.service.ts` | Important |
| `decision-journal-store.ts` | `decision_journal` | `DecisionJournalEntry` | `decision-journal.service.ts` | Critique |
| `atlas-memory-store.ts` | `atlas_memory_documents` | `AtlasMemoryDocument` | `atlas-memory-documents.service.ts` | Critique |
| `atlas-memory-knowledge-store.ts` | `atlas_memory_knowledge` | `AtlasMemoryKnowledgeItem` | `atlas-memory-knowledge.service.ts` | Critique |
| `sql-prepared-sources-store.ts` | `prepared_sql_sources` | `PreparedSqlSource` | `prepared-sql-sources.service.ts` | Important |
| `atlas-datasets-store.ts` | `atlas_datasets` | `AtlasDataset` | `atlas-datasets.service.ts` | Important |
| `dataset-groupby-store.ts` | `dataset_groupby_analyses` | `DatasetGroupByAnalysis` | `dataset-groupby.service.ts` | Important |
| `dataset-groupby-insights-store.ts` | `dataset_groupby_insights` | `DatasetGroupByInsight` | `dataset-groupby-insights.service.ts` | Important |
| `sql-connections-store.ts` | `sql_connections_redacted` | Non importe Phase 75 | Non applicable | Securite |

Les connexions SQL sont exportees sans mot de passe et ne sont pas importees en Prisma pendant cette phase.

## Fichiers crees

| Fichier | Role |
| --- | --- |
| `src/types/local-to-prisma-migration.ts` | Types migration |
| `src/lib/migration/local-exporter.ts` | Export localStorage vers bundle JSON |
| `src/lib/migration/local-migration-validator.ts` | Validation du bundle |
| `src/lib/migration/local-to-prisma-importer.ts` | Import Prisma best effort |
| `src/lib/actions/local-to-prisma-migration-actions.ts` | Actions serveur pour l'UI admin |
| `src/components/settings/local-to-prisma-migration-panel.tsx` | Panneau admin discret dans `/settings` |
| `tests/migration/local-to-prisma-migration.test.ts` | Tests migration |

## Procedure

1. Ouvrir `/settings`.
2. Consulter le panneau `Migration locale vers Prisma`.
3. Cliquer sur `Exporter les donnees locales`.
4. Telecharger le JSON si une sauvegarde manuelle est souhaitee.
5. Cliquer sur `Valider le bundle`.
6. Corriger les erreurs bloquantes si besoin.
7. Activer explicitement `DATA_MODE=prisma` dans l'environnement cible.
8. Cliquer sur `Importer vers Prisma`.
9. Lire le rapport domaine par domaine.

## Validation

Le validateur controle :

- IDs manquants ;
- doublons ;
- domaines vides ;
- references KPI cassees ;
- references Dataset / Prepared Source cassees ;
- references GroupBy / Insight cassees ;
- volume de bundle ;
- absence de mots de passe SQL en clair.

## Import best effort

L'importeur :

- ne fait aucun reset ;
- ne supprime aucune donnee ;
- continue meme si un domaine echoue ;
- utilise les services hybrides existants ;
- retourne un rapport detaille ;
- ignore les domaines non importables comme les connexions SQL redacted.

Si `DATA_MODE` n'est pas `prisma`, aucun import Prisma n'est execute.

## Securite

L'export JSON peut contenir :

- donnees KPI ;
- resultats et historiques ;
- decisions ;
- plans d'action ;
- memoire metier ;
- datasets issus de previews SQL.

Il doit etre conserve prudemment et ne pas etre partage publiquement.

Les mots de passe SQL sont remplaces par :

```text
[REDACTED]
```

## Rollback

La Phase 75 ne supprime pas localStorage. En cas d'import partiel ou invalide :

1. conserver `DATA_MODE=local` ;
2. analyser le rapport ;
3. corriger les references ou la baseline Prisma ;
4. relancer un nouvel import explicite.

Aucune commande destructrice n'est introduite.

## Limites

- Les lectures UI restent locales.
- L'import Prisma depend des modeles et relations deja disponibles.
- Les donnees existantes localStorage ne sont pas migrees automatiquement.
- Les connexions SQL ne sont pas importees.
- Les domaines sans `organizationId` explicite utilisent `org-atlas-demo` comme organisation par defaut.
- La baseline Docker documentaire doit encore etre alignee avec les migrations recentes.

## Prochaines etapes

1. Creer une baseline Prisma officielle incluant toutes les tables recentes.
2. Ajouter un seed minimal compatible `DATA_MODE=prisma`.
3. Ajouter une lecture hybride progressive domaine par domaine.
4. Ajouter un audit post-import comparant localStorage et Prisma.
