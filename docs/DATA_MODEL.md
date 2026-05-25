# Atlas - Modele de donnees cible

## Objectif

Ce modele prepare Atlas a sortir du prototype mocke sans casser l'interface actuelle. La base cible est multi-organisation et centree sur le pilotage de performance, pas sur un ERP.

Les mocks restent la source de donnees de l'application pour cette phase. Prisma pose uniquement le contrat de persistance futur.

## Principe multi-organisation

`Organization` est le tenant principal. Chaque objet metier important porte un `organizationId` :

- sources de donnees ;
- imports ;
- mappings ;
- configurations KPI ;
- resultats KPI ;
- alertes ;
- plans d'action ;
- rapports.

Les utilisateurs sont rattaches aux organisations via `OrganizationUser`, ce qui permet de preparer les roles globaux et les roles par compte client.

## Tables principales

- `Organization` : compte client ou organisation pilotee dans Atlas.
- `User` : utilisateur SaaS, consultant, admin client ou lecteur client.
- `OrganizationUser` : lien entre utilisateur, organisation, role et statut.
- `DataSource` : source Excel, CSV ou base SQL future, sans connecteur reel pour l'instant.
- `ImportJob` : journal technique des imports ou synchronisations.
- `ColumnMapping` : association entre colonne source et champ Atlas normalise.
- `KPIConfiguration` : definition metier du KPI, source, champs, seuils et frequence.
- `KPIResult` : valeur calculee d'un KPI pour une periode.
- `Alert` : risque ou anomalie issue d'un KPI ou d'une source.
- `ActionPlan` : action recommandee ou suivie pour corriger une derive.
- `Report` : synthese dirigeant produite depuis KPI, alertes et score global.

## Flux de donnees

```text
Organization
  -> DataSource
  -> ImportJob
  -> ColumnMapping
  -> KPIConfiguration
  -> KPIResult
  -> Alert
  -> ActionPlan
  -> Report
```

Ce flux garde Atlas centre sur la decision :

- quelle source alimente quel indicateur ;
- quelle donnee est fiable ;
- quel KPI derive ;
- quelle alerte prioriser ;
- quel plan d'action suivre ;
- quel rapport presenter.

## Pourquoi les mocks restent utilises

Les pages actuelles sont construites pour valider l'UX, le vocabulaire produit et les relations metier. Les connecter trop vite a Prisma forcerait une refonte large et risquerait de ralentir la conception.

La phase 6 introduit donc une couche `src/lib/repositories/` qui retourne encore les mocks, mais expose des fonctions proches de la future couche Prisma :

- `getOrganizations()`
- `getOrganizationById(id)`
- `getDataSourcesByOrganization(organizationId)`
- `getKpiConfigurationsByOrganization(organizationId)`
- `getKpiResultsByOrganization(organizationId)`
- `getAlertsByOrganization(organizationId)`
- `getActionPlansByOrganization(organizationId)`
- `getReportsByOrganization(organizationId)`

## Bascule Prisma progressive

La bascule se fera repository par repository :

1. Remplacer la lecture mock par `prisma.<model>.findMany`.
2. Ajouter les adapters necessaires entre enums Prisma et types UI.
3. Garder `organizationId` obligatoire dans tous les appels.
4. Brancher d'abord les pages admin en lecture seule.
5. Ajouter ensuite les mutations de configuration KPI, mapping et utilisateurs.
6. Conserver les mocks comme fixtures de demo et tests visuels.

Cette approche permet de faire evoluer Atlas vers un SaaS reel sans introduire de connecteurs externes, d'upload reel ou de logique Atlas IA dans cette phase.
