# Strategie de migration Prisma Atlas

## Resume executif

Le schema Prisma de `prisma/schema.prisma` decrit aujourd'hui le modele cible Atlas de facon assez complete : organisations, utilisateurs, sources, imports, mappings, KPI, alertes, plans d'action, rapports, dictionnaire metier, KPI locaux, resultats, historiques et regles d'alerte.

La trajectoire de migration n'est pas encore saine pour une base PostgreSQL vide. Les seules migrations presentes sont des migrations recentes, ajoutees apres coup pour les KPI locaux et les regles d'alerte locales. Elles supposent que les tables principales existent deja.

Conclusion : ne pas lancer `prisma migrate dev` sur une base vide avec l'historique actuel sans baseline. Il faut d'abord creer une migration initiale coherente ou repartir d'une base de developpement resetee avec une baseline officielle.

## Etat actuel

### Schema cible

Le schema contient :

- 22 enums Prisma.
- 18 modeles.
- Une architecture multi-organisation globalement coherente.
- Des relations explicites entre `Organization` et les objets metier principaux.
- Des index utiles sur les dimensions frequentes : `organizationId`, `status`, `period`, `createdAt`, `kpiId`.

### Migrations presentes

| Migration | Role | Etat |
| --- | --- | --- |
| `20260526172500_add_local_kpi_persistence` | Ajoute `KpiDirection`, `LocalKpiConfiguration`, `LocalKpiResult`, `LocalKpiHistoryPoint` | Incomplete seule : depend de `Organization` et `BusinessDictionaryField` |
| `20260527103000_add_local_alert_rules` | Ajoute les enums de regles et `LocalAlertRule` | Incomplete seule : depend de `Organization`, `LocalKpiConfiguration`, `KPIConfiguration` |
| `20260603090000_add_decision_engine_local_persistence` | Ajoute plans d'action locaux, feedback recommandations et journal decisionnel | Incomplete seule : depend de `Organization` |
| `20260603100000_add_local_alert_snapshots` | Ajoute les snapshots d'alertes locales | Incomplete seule : depend de `Organization` et `LocalAlertRule` |
| `20260603110000_add_atlas_memory_persistence` | Ajoute documents Atlas Memory et connaissances gouvernees | Incomplete seule : depend de `Organization` |

Il n'y a pas de migration initiale pour les tables coeur :

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
- `LocalActionPlan`
- `LocalRecommendationFeedback`
- `DecisionJournalEntry`
- `LocalAlertSnapshot`
- `AtlasMemoryDocument`
- `AtlasMemoryKnowledgeItem`

Il n'y a pas non plus de `migration_lock.toml` dans `prisma/migrations`, ce qui confirme que l'historique Prisma n'est pas encore une chaine complete issue de `migrate dev`.

## Ecarts detectes

### 1. Historique non applicable sur base vide

Les migrations existantes creent des tables locales, mais ajoutent des cles etrangeres vers des tables qui ne sont pas creees dans l'historique.

Risque :

- `prisma migrate dev` echoue sur une base neuve.
- Deux developpeurs peuvent obtenir des bases differentes selon la maniere dont ils initialisent PostgreSQL.
- Les tests Prisma reels deviennent difficiles a reproduire.

### 2. Schema riche, seed partiel

Le seed cree un jeu Atlas coherent pour :

- organisations ;
- utilisateurs ;
- relations organisation-utilisateur ;
- sources ;
- imports ;
- mappings ;
- KPI configurations ;
- resultats KPI ;
- alertes ;
- plans d'action ;
- rapports.

Le seed ne couvre pas encore :

- `BusinessDictionaryField`
- `BusinessDictionarySourceColumn`
- `BusinessDictionaryLinkedKpi`
- `LocalKpiConfiguration`
- `LocalKpiResult`
- `LocalKpiHistoryPoint`
- `LocalAlertRule`

Ce n'est pas bloquant pour le mode mock/local, mais cela limite la validation Prisma des phases recentes.

### 3. Tables temporaires LocalKpi*

Les tables `LocalKpiConfiguration`, `LocalKpiResult`, `LocalKpiHistoryPoint` et `LocalAlertRule` sont utiles pour la transition progressive depuis `localStorage`.

Elles doivent rester clairement considerees comme une couche de transition :

- elles portent des noms `Local*` ;
- elles stockent des structures encore proches du front ;
- plusieurs champs restent en `String` ou `Json` pour conserver la compatibilite locale.

Recommandation future : les conserver tant que la bascule Prisma n'est pas stabilisee, puis decider si elles deviennent des tables permanentes ou si elles fusionnent avec `KPIConfiguration`, `KPIResult` et `Alert`.

### 4. Champs volontairement souples

Certains champs sont encore des `String` plutot que des enums :

- `KPIConfiguration.category`
- `ColumnMapping.atlasField`
- `ColumnMapping.detectedType`
- `LocalKpiConfiguration.category`
- `LocalKpiConfiguration.calculationType`
- `LocalKpiResult.status`
- `LocalKpiResult.trend`
- `LocalKpiHistoryPoint.status`
- `LocalKpiHistoryPoint.trend`

Avantage : compatibilite avec les champs personnalises et le vocabulaire metier.

Risque : moins de garanties cote base. Il faudra compenser avec des validateurs applicatifs, puis eventuellement introduire des tables de reference.

## SQL preparatoire genere

Un SQL de reference complet a ete genere depuis un schema vide :

`docs/prisma/atlas_initial_schema_from_empty.sql`

Commande utilisee :

```bash
npx.cmd prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script -o docs/prisma/atlas_initial_schema_from_empty.sql
```

Ce fichier contient une baseline complete de 496 lignes pour le schema actuel.

Important : il n'a pas ete place dans `prisma/migrations`, car l'historique actuel contient deja des migrations partielles qui creeraient des doublons (`KpiDirection`, `LocalKpiConfiguration`, `LocalKpiResult`, `LocalKpiHistoryPoint`, `LocalAlertRule`, enums de regles).

## Strategie recommandee

### Option recommandee pour le court terme

1. Garder `DATA_MODE=mock` par defaut.
2. Ne pas modifier `DATABASE_URL` dans le depot.
3. Conserver les migrations existantes pour memoire historique.
4. Creer une vraie baseline Prisma dans une phase dediee, en repartant proprement :
   - soit depuis le SQL de reference ;
   - soit via `prisma migrate dev --name atlas_initial_baseline` sur une branche de migration dediee.
5. Ensuite seulement, rejouer un seed complet.

### Option de reset developpement

Pour une base PostgreSQL locale jetable :

```bash
set DATABASE_URL=postgresql://atlas:atlas@localhost:5432/atlas
npx.cmd prisma migrate reset
npm.cmd run prisma:seed
```

Cette option ne doit etre utilisee que lorsque la baseline officielle est en place.

### Option SQL manuelle temporaire

Pour valider le schema sans utiliser l'historique actuel :

1. Creer une base PostgreSQL locale vide.
2. Executer le SQL de reference :

```bash
npx.cmd prisma db execute --file docs/prisma/atlas_initial_schema_from_empty.sql --url postgresql://atlas:atlas@localhost:5432/atlas
```

3. Lancer :

```bash
npm.cmd run prisma:generate
npm.cmd run prisma:seed
```

Cette approche est utile pour tester, mais elle ne remplace pas une migration Prisma officielle.

## Procedure PostgreSQL locale

Valeur attendue :

```env
DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas"
```

Etapes :

1. Installer PostgreSQL localement.
2. Creer l'utilisateur et la base `atlas`.
3. Definir `DATABASE_URL` dans l'environnement local, sans modifier le depot.
4. Lancer `npx.cmd prisma validate`.
5. Lancer `npm.cmd run prisma:generate`.
6. Initialiser la base via la baseline retenue.
7. Lancer le seed.

## Seed

Le seed actuel est compatible avec le coeur du schema, mais incomplet pour les tables de transition recentes.

Il peut etre conserve pour le moment, car il ne casse pas le mode mock et ne bloque pas le build.

Evolution recommandee :

- Ajouter quelques champs de dictionnaire metier.
- Ajouter une configuration KPI locale.
- Ajouter un resultat KPI local.
- Ajouter un point d'historique local.
- Ajouter une regle d'alerte locale.

Cette extension doit rester modeste pour ne pas transformer le seed en faux produit complet.

## Risques

| Risque | Impact | Mitigation |
| --- | --- | --- |
| Historique de migration incomplet | Base locale impossible a reconstruire proprement | Creer une baseline officielle |
| Migrations partielles deja presentes | Risque de doublons si baseline ajoutee sans nettoyage | Ne pas ajouter brutalement une migration complete dans `prisma/migrations` |
| Tables `Local*` temporaires | Dette de modele si elles deviennent permanentes sans decision | Documenter leur role transitoire |
| Seed incomplet | Prisma valide le coeur mais pas les nouvelles tables | Ajouter un seed minimal local KPI/dictionnaire |
| Champs `String` trop souples | Donnees incoherentes possibles | Renforcer validateurs applicatifs |

## Decision Phase 34

Pour cette phase, la decision saine est :

- ne pas modifier `schema.prisma` ;
- ne pas supprimer les migrations existantes ;
- ne pas ajouter une migration Prisma officielle qui pourrait casser l'historique ;
- generer un SQL de reference documente ;
- documenter la strategie de baseline ;
- valider Prisma avec une `DATABASE_URL` temporaire locale en environnement de commande.

## Etat Phase 55

Le 4 juin 2026, l'environnement local a été audité pour valider PostgreSQL réellement :

- `psql` est absent du `PATH`.
- Aucun service PostgreSQL Windows n'a été détecté.
- `localhost:5432` ne répond pas.
- `npx.cmd prisma validate` fonctionne.
- `npm.cmd run prisma:generate` fonctionne.
- `npx.cmd prisma migrate dev --skip-generate --skip-seed` ne peut pas aller au bout car PostgreSQL local est indisponible.
- `npm.cmd run prisma:seed` échoue pour la même raison.

Point important : même lorsque PostgreSQL sera disponible, l'historique de migrations reste une chaîne de migrations de transition. Il ne contient toujours pas de baseline initiale complète pour créer toutes les tables cœur sur une base vide.

La validation PostgreSQL complète doit donc suivre l'une de ces deux voies :

1. Créer une baseline Prisma officielle avant `migrate dev` sur base vide.
2. Utiliser temporairement le SQL de référence `docs/prisma/atlas_initial_schema_from_empty.sql` pour initialiser une base locale de test, puis documenter cette base comme non représentative d'un historique Prisma officiel.

La recommandation reste de créer une baseline dédiée avant toute généralisation du mode `DATA_MODE=prisma`.
