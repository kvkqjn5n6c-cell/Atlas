# Strategie de migration Prisma Atlas

## Resume executif

`prisma/schema.prisma` decrit aujourd'hui un modele Atlas riche et coherent : organisations, utilisateurs, sources de donnees, imports, mappings, KPI, alertes, plans d'action, rapports, dictionnaire metier, Atlas Memory, KPI locaux, regles d'alerte, snapshots, feedback et journal decisionnel.

La trajectoire de migration n'est pas encore saine pour une base PostgreSQL vide. Les migrations presentes sont des migrations de transition ajoutees apres coup. Elles supposent que les tables fondamentales existent deja.

Conclusion : ne pas lancer `prisma migrate dev` sur une base vide avec l'historique actuel sans baseline initiale.

## Schema cible

Le schema contient :

- 22 enums Prisma.
- 24 modeles.
- Une architecture multi-organisation globalement coherente.
- Des relations explicites entre `Organization` et les objets metier principaux.
- Des index utiles sur `organizationId`, `status`, `createdAt`, `kpiId`, `sourceId`, `slug` et les statuts principaux.

## Migrations presentes

| Migration | Role | Etat |
| --- | --- | --- |
| `20260526172500_add_local_kpi_persistence` | Ajoute `KpiDirection`, `LocalKpiConfiguration`, `LocalKpiResult`, `LocalKpiHistoryPoint` | Incomplete seule : depend de `Organization` et `BusinessDictionaryField` |
| `20260527103000_add_local_alert_rules` | Ajoute les enums de regles et `LocalAlertRule` | Incomplete seule : depend de `Organization`, `LocalKpiConfiguration`, `KPIConfiguration` |
| `20260603090000_add_decision_engine_local_persistence` | Ajoute plans d'action locaux, feedback recommandations et journal decisionnel | Incomplete seule : depend de `Organization` |
| `20260603100000_add_local_alert_snapshots` | Ajoute les snapshots d'alertes locales | Incomplete seule : depend de `Organization` et `LocalAlertRule` |
| `20260603110000_add_atlas_memory_persistence` | Ajoute documents Atlas Memory et connaissances gouvernees | Incomplete seule : depend de `Organization` |

## Tables fondamentales absentes de l'historique

Les tables suivantes sont attendues par `schema.prisma` mais ne sont pas creees avant les migrations transitionnelles :

- `Organization`
- `User`
- `OrganizationUser`
- `DataSource`
- `ImportJob`
- `ColumnMapping`
- `KPIConfiguration`
- `KPIResult`
- `Alert`
- `ActionPlan`
- `Report`
- `BusinessDictionaryField`
- `BusinessDictionarySourceColumn`
- `BusinessDictionaryLinkedKpi`

Sans baseline, une base vide echouera rapidement car les migrations locales ajoutent des cles etrangeres vers ces tables.

## SQL preparatoire

Un SQL de reference a ete genere depuis un schema vide :

`docs/prisma/atlas_baseline_initial.sql`

Commande :

```bash
npx.cmd prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script -o docs/prisma/atlas_baseline_initial.sql
```

Ce fichier contient une baseline complete alignee avec le schema Phase 56 : enums, tables, indexes, contraintes uniques et cles etrangeres.

Important : ce fichier n'est pas une migration active. Il ne doit pas etre place brutalement dans `prisma/migrations`, car les migrations existantes recreeraient ensuite des objets deja inclus dans la baseline.

## Strategie recommandee

La strategie detaillee Phase 56 est documentee dans :

`docs/PRISMA_BASELINE_STRATEGY.md`

Synthese :

1. Court terme : garder `DATA_MODE=local` par defaut et conserver les migrations existantes comme trace.
2. Avant tout environnement partage : creer une vraie migration initiale officielle sur une branche dediee.
3. Ensuite : repartir sur des migrations incrementales propres.
4. Enfin : etendre le seed pour couvrir modestement les modules Prisma-ready recents.

## Options

### Option A - Reset dev propre

Repartir d'un historique de migrations propre avant toute base partagee.

C'est l'option recommandee avant commercialisation ou environnement de staging.

### Option B - Baseline manuelle

Utiliser `docs/prisma/atlas_baseline_initial.sql` pour initialiser une base locale, puis marquer une baseline officielle comme appliquee avec `prisma migrate resolve` si l'equipe choisit ce chemin.

Cette option est utile pour tester, mais plus fragile pour la production.

### Option C - Attente

Continuer en `DATA_MODE=local` et ne pas tenter de reconstruire une base vide.

Cette option reste acceptable seulement a court terme.

## Seed

`prisma/seed.ts` couvre :

- `Organization`
- `User`
- `OrganizationUser`
- `DataSource`
- `ImportJob`
- `ColumnMapping`
- `KPIConfiguration`
- `KPIResult`
- `Alert`
- `ActionPlan`
- `Report`

Il ne couvre pas encore :

- le dictionnaire metier ;
- Atlas Memory ;
- les KPI locaux Prisma-ready ;
- les regles et snapshots d'alertes locales ;
- les plans locaux, feedbacks et journal decisionnel.

Ce n'est pas bloquant pour Phase 56. Le seed devra etre complete apres stabilisation de la baseline officielle.

## Etat Phase 55

Le 4 juin 2026, PostgreSQL local a ete audite :

- `psql` est absent du `PATH`.
- Aucun service PostgreSQL Windows n'a ete detecte.
- `localhost:5432` ne repond pas.
- `npx.cmd prisma validate` fonctionne.
- `npm.cmd run prisma:generate` fonctionne.
- `npx.cmd prisma migrate dev --skip-generate --skip-seed` ne peut pas aller au bout car PostgreSQL local est indisponible.
- `npm.cmd run prisma:seed` echoue pour la meme raison.

## Etat Phase 56

La Phase 56 a ajoute une baseline SQL documentaire complete et une strategie dediee, sans activer de nouvelle migration Prisma et sans exiger PostgreSQL.

Commande non destructive disponible :

```bash
npm.cmd run prisma:baseline:diff
```

Cette commande affiche le SQL qui serait necessaire pour passer d'une base vide au schema courant.

## Regle de prudence

Ne pas utiliser l'historique actuel comme chaine officielle pour initialiser une base vide. Il faut d'abord choisir et appliquer une strategie de baseline.
