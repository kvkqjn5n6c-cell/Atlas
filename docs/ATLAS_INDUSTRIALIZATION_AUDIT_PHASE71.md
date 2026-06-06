# Atlas industrialization audit - Phase 71

Date audit : 2026-06-06

## 1. Resume executif

Atlas est aujourd'hui un produit local tres riche, coherent pour une demonstration, et deja structure autour de moteurs metier deterministes : KPI, alertes, recommandations, priorites, plans d'action, Atlas Memory, Dataset Pipeline, COPIL et dashboard dirigeant.

Son etat reel n'est pas encore celui d'une application installable chez un client PME. Le principal ecart ne vient pas des moteurs metier, mais de l'industrialisation :

- la source de verite reste majoritairement le navigateur via `localStorage` ;
- Prisma est prepare sur plusieurs domaines, mais n'est pas valide comme backend unique ;
- les migrations Prisma actives ne reconstruisent pas une base PostgreSQL vide ;
- les connecteurs SQL conservent des mots de passe en localStorage ;
- il n'existe pas de `Dockerfile`, pas de `docker-compose.yml`, pas de procedure de bootstrap client executable ;
- le seed ne couvre pas les modules recents qui portent la valeur Atlas ;
- l'authentification et l'isolation client sont encore de niveau prototype/demo.

Verdict : Atlas est un noyau produit demonstrable et techniquement prometteur, mais il reste en phase pre-industrialisation. Pour passer a une installation client, il faut stabiliser en priorite le socle : conteneurs, PostgreSQL, baseline Prisma, seed minimal, securite des secrets et migration progressive hors localStorage.

## 2. Forces du projet

- Moteurs metier nombreux et testes : KPI, alertes, regles, insights, synthese, recommandations, confiance, priorites, COPIL, dashboard, datasets.
- Experience demo solide : `/demo-atlas`, `/executive`, `/pilotage`, `/priorities`, `/copil`, `/dataset-pipeline`.
- Architecture de moteurs separee de l'UI sur les sujets recents.
- Couche Prisma-ready deja amorcee pour KPI locaux, alertes, plans, feedback, journal et Atlas Memory.
- Tests moteurs nombreux : 230 tests Vitest et 6 tests E2E Playwright au moment de l'audit.
- Documentation riche sur architecture cible, Prisma, datasets, feedback, journal, memory et connecteurs.

## 3. Faiblesses du projet

- Source de verite eclatee : `localStorage`, mocks, services hybrides, repositories Prisma partiels.
- `DATA_MODE=mock` et `DATA_MODE=local` sont proches, ce qui brouille le comportement attendu.
- Prisma n'est pas encore une trajectoire executable de bout en bout sur PostgreSQL vide.
- Les modules SQL/Dataset, pourtant centraux pour la valeur "donnee externe -> decision", ne sont pas Prisma-ready.
- Les mots de passe SQL sont stockes localement dans le navigateur.
- Pas de packaging Docker.
- Pas de migration automatique localStorage -> Prisma.
- Pas de compte admin client bootstrappe de facon industrielle.
- Pas de preuve de fonctionnement `DATA_MODE=prisma` sur une vraie base locale ou client.

## 4. Audit complet du stockage

| Module | LocalStorage | Prisma | Hybride | Source de verite actuelle | Niveau de risque |
| --- | --- | --- | --- | --- | --- |
| KPI | Oui : configurations, resultats, historique locaux | Oui : `LocalKpiConfiguration`, `LocalKpiResult`, `LocalKpiHistoryPoint` | Oui | LocalStorage pour l'usage courant, Prisma best-effort | Eleve |
| Alertes | Oui : regles et snapshots ; alertes souvent calculees | Oui : `LocalAlertRule`, `LocalAlertSnapshot` | Oui | Calcul local + localStorage | Eleve |
| Recommandations | Non persistees directement | Non | Non | Generees deterministiquement depuis KPI/alertes/insights/datasets | Moyen |
| Priorites | Non persistees directement | Non | Non | Generees deterministiquement | Moyen |
| Plans d'action | Oui : `local-action-plans-store.ts` | Oui : `LocalActionPlan` | Oui | LocalStorage, sync Prisma best-effort | Eleve |
| Journal decisionnel | Oui : `decision-journal-store.ts` | Oui : `DecisionJournalEntry` | Oui | LocalStorage, sync Prisma best-effort | Eleve |
| Atlas Memory | Oui : documents et connaissances gouvernees | Oui : `AtlasMemoryDocument`, `AtlasMemoryKnowledgeItem` | Oui | LocalStorage pour l'UI courante | Eleve |
| SQL Connections | Oui : `sql-connections-store.ts` | Non | Non | LocalStorage | Critique |
| SQL Mapping | Oui : `sql-mappings-store.ts` | Non | Non | LocalStorage | Eleve |
| Prepared Sources | Oui : `sql-prepared-sources-store.ts` | Non | Non | LocalStorage | Eleve |
| Datasets | Oui : `atlas-datasets-store.ts` | Non | Non | LocalStorage | Eleve |
| Dataset KPI | Oui : `dataset-kpi-store.ts` + KPI local | Non pour definition Dataset KPI ; oui indirectement via KPI local | Partiel indirect | LocalStorage | Eleve |
| Dataset Filters | Oui : `dataset-filters-store.ts` | Non | Non | LocalStorage | Moyen |
| GroupBy | Oui : `dataset-groupby-store.ts` | Non | Non | LocalStorage | Eleve |
| GroupBy Insights | Oui : `dataset-groupby-insights-store.ts` | Non | Non | LocalStorage | Eleve |
| COPIL | Non | Non | Non | Genere depuis workspace local | Moyen |
| Dashboard dirigeant | Non | Non | Non | Genere depuis workspace local | Moyen |
| Context Packs | Non | Non | Non | Genere depuis Atlas Memory + moteurs + workspace local | Moyen |

### Lecture / ecriture / synchronisation / fallback

| Domaine | Lecture | Ecriture | Synchronisation | Fallback |
| --- | --- | --- | --- | --- |
| Socle admin historique | Repositories Prisma ou mocks | Faible/incomplete | Non systematique | Mock |
| KPI locaux | Stores + services hybrides | LocalStorage immediat + actions Prisma-ready | Best-effort | LocalStorage |
| Alertes locales | Stores + moteurs | LocalStorage + actions Prisma-ready | Best-effort | LocalStorage |
| Plans / feedback / journal | Stores + repositories/services/actions | LocalStorage + actions | Best-effort | LocalStorage |
| Atlas Memory | Stores + services Prisma-ready | LocalStorage + actions | Best-effort | LocalStorage |
| SQL/Dataset | Stores locaux directs | LocalStorage uniquement | Aucune | Aucun fallback serveur |
| Recommandations/priorites/COPIL/dashboard/context packs | Calcul local | Non persiste | Aucune | Recalcul |

## 5. Audit DATA_MODE

| Mode | Fonctionne reellement | Partiellement implemente | Plus faible / incoherent |
| --- | --- | --- | --- |
| `DATA_MODE=mock` | Repositories historiques retombent sur mocks ; UI reste demonstrable ; `isMockMode()` assimile aussi `local` a mock. | Certaines donnees locales sont tout de meme stockees en localStorage ; le terme mock ne signifie pas "sans stockage". | Ambigu : `mock` et `local` se chevauchent dans la pratique. |
| `DATA_MODE=local` | Mode le plus fiable actuellement ; les stores localStorage portent les workflows demo et metiers recents. | Les services retournent souvent `local`, mais plusieurs UI lisent encore directement les stores. | Pas installable multi-utilisateur ; pas de partage navigateur ; pas de serveur source de verite. |
| `DATA_MODE=prisma` | Tente Prisma sur organisations, data sources, KPI historiques, KPI locaux, alertes, plans, feedback, journal, Atlas Memory, dictionnaire metier. | Fallback local/mock en cas d'erreur ; pas valide sur base PostgreSQL locale complete ; seed incomplet pour modules recents. | Migrations actives incompletes ; SQL/Dataset non couverts ; risque d'impression "Prisma-ready" superieure a la realite. |

Conclusion DATA_MODE : `local` est le mode operationnel. `prisma` est un rail technique partiel, pas encore un mode client fiable.

## 6. Audit Prisma

### Etat des migrations

Migrations actives :

- `20260526172500_add_local_kpi_persistence`
- `20260527103000_add_local_alert_rules`
- `20260603090000_add_decision_engine_local_persistence`
- `20260603100000_add_local_alert_snapshots`
- `20260603110000_add_atlas_memory_persistence`

Probleme majeur : ces migrations sont transitionnelles. Elles creent des tables recentes qui reference `Organization`, `KPIConfiguration`, `BusinessDictionaryField`, etc., mais elles ne creent pas le socle initial. Une base PostgreSQL vide ne peut pas etre reconstruite proprement avec cette chaine seule.

Baseline documentaire existante :

- `docs/prisma/atlas_baseline_initial.sql`
- `docs/prisma/atlas_initial_schema_from_empty.sql`

Ces fichiers documentent le schema complet, mais ne sont pas une migration Prisma active.

### Etat par modele

| Modele Prisma | Schema | Migration active | Repository | Service | Actions serveur | UI consommatrice | Utilisation reelle | Etat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Organization | Oui | Non active baseline | Oui | Oui | `admin-actions` | Organisations, sidebar | Mock/Prisma partiel | Partiel |
| User | Oui | Non active baseline | Oui | Non dedie visible | `admin-actions` partiel | Users | Mock/Prisma partiel | Partiel |
| OrganizationUser | Oui | Non active baseline | Via users/org repos | Non dedie | Partiel | Organisations/users | Partiel | Partiel |
| DataSource | Oui | Non active baseline | Oui | Oui | Non majeur | Data sources | Mock/Prisma partiel | Partiel |
| ImportJob | Oui | Non active baseline | Data source repo partiel | Data source service | Non | Data sources/imports | Surtout mock | Partiel |
| ColumnMapping | Oui | Non active baseline | Data source repo partiel | Data source service | Non | Imports/mappings | Surtout mock | Partiel |
| KPIConfiguration | Oui | Non active baseline | `kpi.repository.ts` | `kpi.service.ts` | Non majeur | Indicators/KPI historiques | Mock/Prisma lecture | Partiel |
| KPIResult | Oui | Non active baseline | `kpi.repository.ts` | `kpi.service.ts` | Non majeur | Dashboard historique | Mock/Prisma lecture | Partiel |
| Alert | Oui | Non active baseline | `alerts.repository.ts` | Non dedie visible | Non | Alertes historiques | Peu central depuis alertes locales | Partiel |
| ActionPlan | Oui | Non active baseline | `action-plans.repository.ts` | Non dedie visible | Non | Plans historiques/mock | Peu utilise face a LocalActionPlan | Partiel |
| Report | Oui | Non active baseline | `reports.repository.ts` | Non dedie visible | Non | Reports historiques | Partiel/mock | Partiel |
| BusinessDictionaryField | Oui | Non active baseline | Oui | Oui | Oui | Business dictionary | Prisma-ready partiel | Partiel |
| BusinessDictionarySourceColumn | Oui | Non active baseline | Oui | Oui | Oui | Business dictionary | Partiel | Partiel |
| BusinessDictionaryLinkedKpi | Oui | Non active baseline | Oui | Oui | Oui | Business dictionary/KPI | Partiel | Partiel |
| AtlasMemoryDocument | Oui | Oui transitionnelle | Oui | Oui | Oui | Atlas Memory | UI reste surtout localStorage | Partiel |
| AtlasMemoryKnowledgeItem | Oui | Oui transitionnelle | Oui | Oui | Oui | Atlas Memory, moteurs | UI reste surtout localStorage | Partiel |
| LocalKpiConfiguration | Oui | Oui transitionnelle | Oui | Oui | Oui | KPI config/pilotage | Hybride best-effort | Partiel |
| LocalKpiResult | Oui | Oui transitionnelle | Oui | Oui | Oui | Pilotage/alerts/reports | Hybride best-effort | Partiel |
| LocalKpiHistoryPoint | Oui | Oui transitionnelle | Oui | Oui | Oui | Moteurs/rapports | Hybride best-effort | Partiel |
| LocalAlertRule | Oui | Oui transitionnelle | Oui | Oui | Oui | KPI config/alerts | Hybride best-effort | Partiel |
| LocalAlertSnapshot | Oui | Oui transitionnelle | Oui | Oui | Oui | Alerts/persistence | Hybride best-effort | Partiel |
| LocalActionPlan | Oui | Oui transitionnelle | Oui | Oui | Oui | Action plans/pilotage/reports | Hybride best-effort | Partiel |
| LocalRecommendationFeedback | Oui | Oui transitionnelle | Oui | Oui | Oui | Pilotage/reports | Hybride best-effort | Partiel |
| DecisionJournalEntry | Oui | Oui transitionnelle | Oui | Oui | Oui | Journal/pilotage/reports | Hybride best-effort | Partiel |

Modele absent de Prisma pour des modules importants :

- SQL Connections
- SQL Mapping
- Prepared SQL Sources
- Atlas Dataset
- Dataset KPI
- Dataset Filters
- Dataset GroupBy
- Dataset GroupBy Insights
- Recommendation generated records
- Priority generated records
- Context Packs
- COPIL briefs
- Executive dashboards

## 7. Audit repositories / services / actions

### Repositories presents

- `organizations.repository.ts`, `users.repository.ts`
- `data-sources.repository.ts`, `kpi.repository.ts`, `alerts.repository.ts`, `action-plans.repository.ts`, `reports.repository.ts`
- `business-dictionary.repository.ts`
- `local-kpi.repository.ts`, `local-kpi-results.repository.ts`, `local-kpi-history.repository.ts`
- `local-alert-rules.repository.ts`, `local-alert-snapshots.repository.ts`
- `local-action-plans.repository.ts`, `recommendation-feedback.repository.ts`, `decision-journal.repository.ts`
- `atlas-memory-documents.repository.ts`, `atlas-memory-knowledge.repository.ts`

### Services presents

- Services Prisma-ready : organizations, data-sources, kpi, business-dictionary, local-kpi, local-kpi-results, local-kpi-history, local-alert-rules, local-alert-snapshots, local-action-plans, recommendation-feedback, decision-journal, atlas-memory-documents, atlas-memory-knowledge.
- Services local-data : local imports, local KPI workspace, alerts, insights, business dictionary.

### Actions serveur presentes

- `admin-actions.ts`
- `business-dictionary-actions.ts`
- `local-kpi-persistence-actions.ts`
- `local-alert-rules-actions.ts`
- `local-alert-snapshots-actions.ts`
- `decision-engine-persistence-actions.ts`
- `atlas-memory-persistence-actions.ts`

### Dette technique identifiee

| Sujet | Observation | Risque |
| --- | --- | --- |
| Couche UI -> store direct | Encore presente sur SQL/Dataset et certains modules locaux | Migration Prisma plus difficile |
| Services hybrides | Bonne intention, mais couverture incomplete | Faux sentiment de backend pret |
| Repositories historiques vs locaux | `ActionPlan` et `LocalActionPlan`, `KPIConfiguration` et `LocalKpiConfiguration` coexistent | Duplication de concepts |
| Actions serveur | Presentes pour certains domaines, absentes pour SQL/Dataset | Industrialisation asymetrique |
| Context packs/COPIL/dashboard | Generes a la volee, non persistes | OK pour demo, faible tracabilite serveur |

## 8. Audit localStorage

| Store | Role | Consommateurs principaux | Remplacement Prisma existant | Criticite migration |
| --- | --- | --- | --- | --- |
| `local-import-store.ts` | Imports CSV locaux | Imports/mappings, KPI locaux | Non | Critique |
| `local-kpi-store.ts` | KPI locaux | KPI config, pilotage | Oui partiel | Critique |
| `local-kpi-results-store.ts` | Resultats KPI | Pilotage, alerts, reports | Oui partiel | Critique |
| `local-kpi-history-store.ts` | Historique KPI | Trends, insights, impacts | Oui partiel | Critique |
| `local-alert-rules-store.ts` | Regles alertes | KPI config, alerts | Oui partiel | Critique |
| `local-alert-snapshots-store.ts` | Snapshots alertes | Alerts/persistence | Oui partiel | Important |
| `local-action-plans-store.ts` | Plans locaux | Action-plans, pilotage, reports | Oui partiel | Critique |
| `local-action-plan-impact-store.ts` | Mesures impacts | Action-plans, reports | Non | Important |
| `local-recommendation-feedback-store.ts` | Feedback recommandations | Pilotage, reports | Oui partiel | Important |
| `decision-journal-store.ts` | Journal decisionnel | Journal, pilotage, reports | Oui partiel | Critique |
| `atlas-memory-store.ts` | Documents memory | Atlas Memory, moteurs | Oui partiel | Critique |
| `atlas-memory-knowledge-store.ts` | Gouvernance connaissance | Atlas Memory, moteurs | Oui partiel | Critique |
| `business-dictionary-store.ts` | Dictionnaire local | Business dictionary, imports | Oui partiel | Important |
| `sql-connections-store.ts` | Connexions SQL avec password | SQL connections, mappings, pipeline | Non | Critique |
| `sql-mappings-store.ts` | Mappings SQL | SQL mappings, pipeline | Non | Critique |
| `sql-prepared-sources-store.ts` | Sources SQL preparees | Data sources, pipeline | Non | Critique |
| `atlas-datasets-store.ts` | Datasets normalises | Datasets, pipeline, moteurs Dataset | Non | Critique |
| `dataset-kpi-store.ts` | Definitions KPI Dataset | Datasets, pipeline | Non | Important |
| `dataset-filters-store.ts` | Jeux de filtres Dataset | Datasets | Non | Important |
| `dataset-groupby-store.ts` | Analyses GroupBy | Datasets, pipeline | Non | Important |
| `dataset-groupby-insights-store.ts` | Insights comparatifs | Datasets, recommendations, priorities | Non | Important |

Conclusion localStorage : c'est le socle operationnel actuel. Pour une installation client, il faut le transformer en cache local ou couche demo, pas en source de verite.

## 9. Audit deploiement

### Etat actuel

Scripts utiles :

- `npm.cmd run dev`
- `npm.cmd run build`
- `npm.cmd run start`
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run test:e2e`
- `npm.cmd run prisma:generate`
- `npm.cmd run prisma:migrate`
- `npm.cmd run prisma:seed`
- `npm.cmd run prisma:baseline:diff`

Variables `.env.example` :

- `DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas"`
- `DATA_MODE="local"`
- `NEXTAUTH_SECRET="replace-with-a-long-random-secret"`
- `NEXTAUTH_URL="http://localhost:3000"`

Fichiers manquants pour `docker compose up` :

- `Dockerfile`
- `docker-compose.yml`
- entrypoint de migration/seed controle
- script d'attente PostgreSQL
- strategie officielle de baseline Prisma
- seed couvrant les modules Atlas recents
- documentation d'installation client executable

### Ce qu'il manque pour obtenir Atlas + PostgreSQL + Prisma + admin + seed minimal

| Besoin | Etat actuel | Manque |
| --- | --- | --- |
| Container app | Absent | Dockerfile Next.js production |
| Container PostgreSQL | Absent | Service postgres + volume + healthcheck |
| Variables env | `.env.example` existe | Secrets reels, politique de rotation, valeurs client |
| Prisma generate | Script existe | Integration au build container |
| Prisma migrate | Script existe | Baseline officielle applicable a base vide |
| Seed minimal | `prisma/seed.ts` existe | Admin client, modules recents, Atlas Memory, local decision engine |
| Auth admin | Utilisateurs seedes en Prisma | Auth reelle/installateur non prouve |
| DATA_MODE prisma | Partiel | Validation end-to-end sur Postgres |
| Documentation client | Partielle | Runbook `docker compose up`, backup/restore, reset |

Blocant principal : sans baseline Prisma active, `docker compose up` ne peut pas garantir une base reconstruite proprement.

## 10. Audit securite

Inventaire des risques :

| Sujet | Etat | Risque |
| --- | --- | --- |
| Mots de passe SQL | `SqlConnectionConfig.password` stocke dans localStorage | Critique |
| Donnees KPI/imports/datasets | Stockees dans localStorage navigateur | Eleve |
| Atlas Memory | Documents et connaissances en localStorage | Eleve |
| Journal decisionnel | Decisions et commentaires en localStorage | Eleve |
| NEXTAUTH_SECRET | Placeholder dans `.env.example` | Normal pour exemple, critique si non remplace |
| DATABASE_URL | Exemple avec creds `atlas:atlas` | OK en local, pas client |
| Auth/roles | Permissions applicatives mais pas preuve d'auth serveur industrialisee | Eleve |
| Chiffrement | Aucun chiffrement localStorage | Eleve |
| Audit serveur | Journal local, pas audit serveur immuable | Moyen/eleve |
| SQL live | Connecteur lecture seule cote intention | Attention : les credentials donnent potentiellement acces reel |

Conclusion securite : avant client, les secrets SQL doivent sortir du localStorage et passer par un stockage serveur chiffre ou un coffre de secrets. Les donnees metier doivent etre servies par backend avec isolation organisation.

## 11. Audit tests

Etat au moment de l'audit :

- Vitest : 33 fichiers, 230 tests.
- E2E Playwright : 6 tests.
- Couverture reportee : pas de rapport coverage chiffre.

Repartition qualitative :

| Zone | Couverture |
| --- | --- |
| KPI/alertes/insights/recommandations/priorites | Bonne couverture moteur |
| Atlas Memory/search/governance/context packs | Bonne couverture moteur |
| Dataset pipeline, filters, KPI, GroupBy, insights | Bonne couverture moteur |
| Persistence fallback Prisma | Couverture testee avec mocks |
| UI demo/executive/pilotage/COPIL/action-plans/atlas-memory/dataset-pipeline | E2E de base |
| Prisma avec vraie DB | Non couvert |
| Docker/deploiement | Non couvert |
| Securite/secrets | Non couvert |
| Migration localStorage vers Prisma | Non couvert |
| SQL live Postgres/SQL Server | Non couvert volontairement |

## 12. Blocants deploiement client

1. Pas de Dockerfile / docker-compose.
2. Migrations Prisma actives non applicables a une base vide complete.
3. DATA_MODE=prisma non valide end-to-end sur PostgreSQL.
4. Modules SQL/Dataset centraux sans Prisma ni stockage serveur.
5. Mots de passe SQL stockes dans localStorage.
6. Seed incomplet pour la valeur Atlas moderne.
7. Pas de procedure de backup/restore.
8. Pas d'authentification client industrialisee prouvee.
9. Pas de migration des donnees navigateur vers base serveur.
10. Pas de runbook d'installation PME.

## 13. Priorisation industrialisation

| Phase | Objectif | Effort | Risque | Valeur |
| --- | --- | --- | --- | --- |
| Phase 72 | Baseline Prisma officielle + validation PostgreSQL locale | Fort | Fort | Forte |
| Phase 73 | Docker compose installable : app + Postgres + migrations + seed admin minimal | Moyen/fort | Moyen | Forte |
| Phase 74 | Securiser connecteurs SQL : ne plus stocker les mots de passe en localStorage, definir stockage serveur/chiffrement | Fort | Fort | Forte |
| Phase 75 | Migration des modules SQL/Dataset vers backend Prisma-ready + source de verite serveur | Fort | Fort | Forte |

### Detail recommande

#### Phase 72 - Baseline Prisma officielle

- Objectif : creer une chaine Prisma propre applicable a une base vide.
- Livrables : migration initiale officielle ou strategie `migrate resolve` formalisee, validation Postgres, seed compatible.
- Effort : fort.
- Risque : fort.
- Valeur : forte.

#### Phase 73 - Packaging Docker client

- Objectif : obtenir `docker compose up` avec Atlas + PostgreSQL + Prisma + admin minimal.
- Livrables : Dockerfile, compose, env, healthchecks, migrate/seed, runbook.
- Effort : moyen/fort.
- Risque : moyen.
- Valeur : forte.

#### Phase 74 - Securite des secrets SQL

- Objectif : retirer les mots de passe SQL du navigateur.
- Livrables : modele serveur de connexion SQL, chiffrement ou coffre, masquage UI, tests de non-exposition.
- Effort : fort.
- Risque : fort.
- Valeur : forte.

#### Phase 75 - Source de verite serveur pour Dataset Pipeline

- Objectif : rendre persistables les objets qui portent la valeur connecteur : SQL mapping, prepared sources, datasets, filters, groupby, insights.
- Livrables : modeles Prisma, repositories, services, actions, migration depuis localStorage si necessaire.
- Effort : fort.
- Risque : fort.
- Valeur : forte.

## 14. Priorisation recommandee

Ordre recommande strict :

1. Stabiliser Prisma avant Docker. Docker sans base reconstructible donnera une fausse installation.
2. Dockeriser ensuite avec un seed minimal.
3. Securiser les secrets SQL avant tout pilote client connecte a un SI.
4. Migrer SQL/Dataset vers serveur seulement apres avoir stabilise la persistance et les secrets.

Ce qu'il ne faut pas prioriser maintenant :

- nouvelles fonctionnalites IA ;
- nouveaux dashboards ;
- nouveaux connecteurs ;
- refonte UX ;
- persistance exhaustive de tous les objets generes.

## 15. Roadmap Phase 72 a 75

### Phase 72 - Prisma baseline client-ready

- Auditer et figer `schema.prisma`.
- Creer une baseline officielle applicable a une base vide.
- Executer `prisma migrate dev` sur PostgreSQL local.
- Adapter `seed.ts` pour admin + org + modules critiques.
- Documenter reset, migrate, seed, rollback dev.

### Phase 73 - Docker compose installable

- Ajouter Dockerfile Next.js.
- Ajouter docker-compose avec Postgres.
- Ajouter healthcheck Postgres.
- Ajouter scripts d'entrypoint : generate, migrate, seed optionnel.
- Ajouter documentation installation PME.

### Phase 74 - Secrets et connecteurs SQL industrialises

- Supprimer stockage password en localStorage.
- Definir modele serveur de connexion SQL.
- Chiffrer secret ou integrer coffre.
- Tester non-regression connecteur mock et lecture seule.
- Documenter politique securite.

### Phase 75 - Dataset Pipeline serveur

- Modeliser SQL connections, mappings, prepared sources, datasets, filters, analyses et insights.
- Creer repositories/services/actions.
- Garder fallback local pour demo.
- Ajouter migration douce depuis localStorage.
- Tester pipeline client sur DATA_MODE=prisma.

## 16. Conclusion

Atlas a depasse le stade d'une simple maquette fonctionnelle : le moteur metier est dense, coherent, teste et demonstrable. En revanche, l'application n'est pas encore installable chez un client PME parce que son infrastructure de persistance, de securite et de deploiement n'est pas au meme niveau que son experience produit.

La prochaine decision rationnelle est de ne pas ajouter de nouvelles capacites metier. Il faut industrialiser le socle, dans cet ordre : Prisma baseline, Docker, secrets SQL, persistance serveur du Dataset Pipeline.
