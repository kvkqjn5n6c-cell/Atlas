# Prisma baseline strategy Atlas

## Objectif

La Phase 56 clarifie la trajectoire Prisma sans exiger PostgreSQL local.

Le probleme n'est pas `schema.prisma` : le schema cible est coherent et `prisma validate` fonctionne. Le probleme est l'historique de migrations : il ne contient pas de migration initiale complete capable de reconstruire une base PostgreSQL vide.

Cette documentation definit une strategie de baseline propre avant toute generalisation de `DATA_MODE=prisma`.

## Etat reel Phase 56

### Schema cible

`prisma/schema.prisma` contient 24 modeles :

| Domaine | Modeles |
| --- | --- |
| Socle multi-organisation | `Organization`, `User`, `OrganizationUser` |
| Donnees et imports | `DataSource`, `ImportJob`, `ColumnMapping` |
| KPI coeur | `KPIConfiguration`, `KPIResult` |
| Alertes et plans historiques | `Alert`, `ActionPlan`, `Report` |
| Dictionnaire metier | `BusinessDictionaryField`, `BusinessDictionarySourceColumn`, `BusinessDictionaryLinkedKpi` |
| Atlas Memory | `AtlasMemoryDocument`, `AtlasMemoryKnowledgeItem` |
| KPI locaux Prisma-ready | `LocalKpiConfiguration`, `LocalKpiResult`, `LocalKpiHistoryPoint` |
| Alertes locales Prisma-ready | `LocalAlertRule`, `LocalAlertSnapshot` |
| Coeur decisionnel local | `LocalActionPlan`, `LocalRecommendationFeedback`, `DecisionJournalEntry` |

Le schema contient aussi les enums necessaires aux roles, statuts, imports, KPI, alertes, plans et rapports.

### Migrations existantes

| Migration | Tables creees | Dependances non creees par l'historique |
| --- | --- | --- |
| `20260526172500_add_local_kpi_persistence` | `LocalKpiConfiguration`, `LocalKpiResult`, `LocalKpiHistoryPoint` | `Organization`, `BusinessDictionaryField` |
| `20260527103000_add_local_alert_rules` | `LocalAlertRule` | `Organization`, `LocalKpiConfiguration`, `KPIConfiguration` |
| `20260603090000_add_decision_engine_local_persistence` | `LocalActionPlan`, `LocalRecommendationFeedback`, `DecisionJournalEntry` | `Organization` |
| `20260603100000_add_local_alert_snapshots` | `LocalAlertSnapshot` | `Organization`, `LocalAlertRule` |
| `20260603110000_add_atlas_memory_persistence` | `AtlasMemoryDocument`, `AtlasMemoryKnowledgeItem` | `Organization` |

Ces migrations sont des migrations de transition. Elles sont utiles comme trace de travail, mais elles ne forment pas une chaine complete applicable a une base vide.

### Tables absentes de l'historique initial

Les tables suivantes sont attendues par le schema mais ne sont creees par aucune migration initiale existante :

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

Sans baseline, une base vide echouera des la premiere migration transitionnelle qui reference `Organization`.

## Baseline SQL documentaire

La baseline SQL complete alignee sur `schema.prisma` est stockee ici :

`docs/prisma/atlas_baseline_initial.sql`

Elle est generee avec :

```bash
npx.cmd prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script -o docs/prisma/atlas_baseline_initial.sql
```

Elle contient :

- les schemas et enums ;
- les 24 tables actuelles ;
- les indexes ;
- les contraintes uniques ;
- les relations et cles etrangeres.

Important : ce fichier ne doit pas etre place tel quel dans `prisma/migrations` tant que la strategie de reset ou de baseline manuelle n'est pas decidee. Sinon, il creera des doublons avec les migrations transitionnelles deja presentes.

## Option A - Reset dev propre

### Principe

Repartir d'une chaine de migrations propre avant toute base partagee :

1. Creer une branche dediee migrations.
2. Archiver les migrations de transition actuelles hors de la chaine active, ou repartir d'un dossier `prisma/migrations` propre en environnement dev.
3. Generer une migration initiale complete depuis le schema actuel :

```bash
npx.cmd prisma migrate dev --name atlas_initial_baseline
```

4. Adapter ensuite les migrations futures comme de vrais increments.
5. Rejouer le seed.

### Avantages

- Historique Prisma propre.
- Base PostgreSQL vide reconstructible.
- Moins de dette de migration avant SaaS.
- Trajectoire claire pour CI, staging et production.

### Risques

- Necessite une decision d'equipe, car cela reorganise l'historique de migrations.
- A faire avant toute base de production, pas apres.

### Recommandation

C'est l'option recommandee pour Atlas avant toute premiere commercialisation ou environnement partage.

## Option B - Baseline manuelle

### Principe

Conserver les migrations existantes et utiliser la baseline SQL comme point d'initialisation manuel :

1. Creer une base PostgreSQL vide.
2. Executer `docs/prisma/atlas_baseline_initial.sql`.
3. Si une migration Prisma officielle est creee plus tard pour representer cette baseline, la marquer comme appliquee avec :

```bash
npx.cmd prisma migrate resolve --applied <nom_migration_baseline>
```

4. Appliquer ensuite uniquement les migrations incrementales futures.

### Avantages

- Ne casse pas l'historique existant.
- Permet de tester rapidement une base locale.
- Utile si l'equipe veut garder les migrations transitionnelles comme trace.

### Risques

- Demande une discipline stricte.
- Prisma ne sait pas automatiquement que le SQL documentaire represente une migration officielle.
- Risque d'incoherence si une migration transitionnelle est rejouee apres la baseline et recree des objets deja presents.

### Recommandation

Acceptable comme solution temporaire de validation locale, mais pas comme trajectoire production principale.

## Option C - Ne rien faire maintenant

### Principe

Continuer a utiliser `DATA_MODE=local` et garder Prisma-ready sans tenter de reconstruire une base vide.

### Avantages

- Aucun risque immediat.
- Le produit local/mock continue de fonctionner.

### Risques

- La dette de migration grossit.
- `DATA_MODE=prisma` reste difficile a valider de bout en bout.
- Le passage SaaS sera plus couteux.

### Recommandation

Option acceptable seulement a tres court terme.

## Decision recommandee

Pour Atlas, la meilleure trajectoire est :

1. Court terme : conserver les migrations existantes, garder `DATA_MODE=local` par defaut, utiliser `docs/prisma/atlas_baseline_initial.sql` comme reference.
2. Avant PostgreSQL partage : appliquer l'Option A sur une branche dediee.
3. Apres baseline officielle : etendre le seed minimalement aux modules recents.
4. Ensuite seulement : valider `DATA_MODE=prisma` de bout en bout.

## Seed

`prisma/seed.ts` couvre aujourd'hui :

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

- `BusinessDictionaryField`
- `BusinessDictionarySourceColumn`
- `BusinessDictionaryLinkedKpi`
- `AtlasMemoryDocument`
- `AtlasMemoryKnowledgeItem`
- `LocalKpiConfiguration`
- `LocalKpiResult`
- `LocalKpiHistoryPoint`
- `LocalAlertRule`
- `LocalAlertSnapshot`
- `LocalActionPlan`
- `LocalRecommendationFeedback`
- `DecisionJournalEntry`

Ce n'est pas bloquant pour Phase 56. Le seed doit rester modeste tant que la baseline officielle n'est pas stabilisee.

## Commandes utiles

Afficher le SQL baseline sans ecrire de fichier :

```bash
npm.cmd run prisma:baseline:diff
```

Regenerer le fichier baseline documentaire :

```bash
npx.cmd prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script -o docs/prisma/atlas_baseline_initial.sql
```

Valider le schema :

```bash
npx.cmd prisma validate
```

Generer le client :

```bash
npm.cmd run prisma:generate
```

## Regle de prudence

Ne pas executer `prisma migrate dev` sur une base vide avec l'historique actuel en pensant obtenir une base complete. L'historique actuel n'est pas encore une chaine initiale complete.

La baseline Phase 56 est une reference de securisation, pas encore une migration active.
