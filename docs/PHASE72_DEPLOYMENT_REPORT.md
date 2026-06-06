# Phase 72 - Rapport de deploiement local Docker

## Resume executif

La Phase 72 ajoute une premiere infrastructure Docker locale pour Atlas, sans modifier les moteurs metier ni l'UX.

La configuration cree :

- un conteneur PostgreSQL `atlas-postgres` ;
- un conteneur applicatif `atlas-app` ;
- un volume `postgres_data` ;
- une initialisation PostgreSQL par baseline SQL documentaire ;
- un demarrage applicatif Next.js en mode production.

Point important : `prisma migrate deploy` est desactive par defaut. Ce choix est volontaire, car la Phase 56 a montre que les migrations actives ne forment pas encore une chaine complete applicable a une base vide. La base Docker est donc initialisee avec `docs/prisma/atlas_baseline_initial.sql`.

Statut final de la phase : configuration validee en execution reelle.

## Audit prealable

| Element | Etat observe |
| --- | --- |
| Next.js | `16.2.6` |
| React | `19.0.0` |
| Prisma | `6.0.1` |
| Node cible Docker | `node:22-slim` |
| Version Node declaree dans `package.json` | Aucune contrainte `engines` declaree |
| Build | `npm.cmd run build` / `next build` |
| Start | `npm run start` / `next start` |
| Tests | Vitest via `npm.cmd run test` |
| DATA_MODE | `mock`, `local`, `prisma`; Docker reste en `local` par defaut |

## Scripts package.json utiles

| Script | Role |
| --- | --- |
| `dev` | Lance Next en developpement |
| `build` | Build production Next |
| `start` | Demarrage production Next |
| `lint` | ESLint |
| `test` | Vitest |
| `prisma:generate` | Generation Prisma Client |
| `prisma:migrate` | `prisma migrate dev`, non utilise en Docker |
| `prisma:seed` | Seed manuel via `tsx prisma/seed.ts` |
| `prisma:baseline:diff` | Generation SQL baseline documentaire |

## Variables d'environnement attendues

| Variable | Docker Phase 72 | Commentaire |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://atlas:atlas@postgres:5432/atlas` | Connexion interne Docker |
| `DATA_MODE` | `local` | Mode fiable actuel |
| `NODE_ENV` | `production` | Runtime Next production |
| `PORT` | `3000` | Port applicatif |
| `HOSTNAME` | `0.0.0.0` | Ecoute conteneur |
| `NEXTAUTH_SECRET` | Valeur locale Docker | A remplacer hors demo |
| `NEXTAUTH_URL` | `http://localhost:3000` | URL locale |
| `PRISMA_MIGRATE_DEPLOY` | `false` | Desactive tant que la baseline officielle manque |

## Fichiers crees

| Fichier | Role |
| --- | --- |
| `Dockerfile` | Build et demarrage production Atlas |
| `.dockerignore` | Reduction du contexte Docker |
| `docker-compose.yml` | Orchestration PostgreSQL + Atlas |
| `.env.docker` | Variables locales Docker |
| `docs/DOCKER_LOCAL_INSTALL.md` | Procedure d'installation locale |
| `docs/PHASE72_DEPLOYMENT_REPORT.md` | Rapport Phase 72 |

## Fichiers modifies

| Fichier | Modification |
| --- | --- |
| `.env.example` | Ajout des variables Docker locales en commentaires |

## Etat Docker

Docker Desktop et WSL 2 ont ete installes puis valides sur la machine de developpement.

Commandes validees :

```bash
docker compose config
docker compose up -d
docker ps
```

Etat observe :

- `docker compose config` valide ;
- `docker compose up -d` valide ;
- conteneur `atlas-app` demarre ;
- conteneur `atlas-postgres` demarre ;
- `atlas-app` healthy ;
- `atlas-postgres` healthy.

## Validation reelle Docker

| Controle | Resultat |
| --- | --- |
| Docker Desktop installe | Valide |
| WSL 2 installe et mis a jour | Valide |
| `docker compose config` | Valide |
| `docker compose up -d` | Valide |
| `docker ps` | `atlas-app` healthy, `atlas-postgres` healthy |
| Logs `atlas-app` | Prisma schema loaded, Prisma Client generated, Next.js started, Ready, healthcheck OK |
| Logs `atlas-postgres` | Demarrage reussi, healthcheck healthy |
| Acces applicatif | `http://localhost:3000` confirme |

## Etat PostgreSQL

PostgreSQL est valide en conteneur Docker.

Configuration validee :

- image `postgres:16-alpine` ;
- base `atlas` ;
- utilisateur `atlas` ;
- mot de passe `atlas` ;
- volume `postgres_data` ;
- healthcheck `pg_isready`.

Etat final :

- PostgreSQL demarre correctement ;
- le volume PostgreSQL est cree ;
- le conteneur `atlas-postgres` est healthy.

## Etat Prisma

Configuration validee :

- `npx prisma generate` au build ;
- `npx prisma generate` au demarrage du conteneur ;
- `prisma migrate deploy` supporte mais desactive par defaut.

Logs observes cote `atlas-app` :

- schema Prisma charge ;
- Prisma Client genere ;
- application Next.js demarree ;
- etat Ready atteint.

Raison du desactivage de `prisma migrate deploy` :

- les migrations actives sont des migrations de transition ;
- une base vide echouerait sans baseline officielle ;
- la baseline SQL documentaire est donc utilisee pour initialiser PostgreSQL en Phase 72.

## Resultats des verifications

| Verification | Resultat |
| --- | --- |
| `docker compose config` | OK |
| `docker compose up -d` | OK |
| PostgreSQL healthy | OK - `atlas-postgres` healthy |
| Atlas healthy | OK - `atlas-app` healthy |
| Acces `http://localhost:3000` | OK |
| Logs Atlas | OK - Prisma schema loaded, Prisma Client generated, Next.js started, Ready |
| Logs PostgreSQL | OK - demarrage reussi, healthy |
| `npm.cmd run lint` | OK |
| `npm.cmd run build` | OK |
| `npm.cmd run test` | OK - 33 fichiers, 230 tests |

## Resultat

Atlas demarre avec succes via Docker Compose.

Etat valide :

- PostgreSQL demarre correctement ;
- le volume PostgreSQL `postgres_data` est cree ;
- Prisma Client est genere dans le conteneur applicatif ;
- l'application Next.js demarre en mode production ;
- Atlas est accessible sur `http://localhost:3000` ;
- les healthchecks `atlas-app` et `atlas-postgres` sont valides.

## Blocages eventuels

| Blocage | Niveau | Detail |
| --- | --- | --- |
| Baseline Prisma non officielle | Eleve | Necessite SQL documentaire ou future migration initiale propre |
| `DATA_MODE=prisma` non active par defaut | Moyen | Volontaire pour preserver le comportement actuel |
| Seed non automatise | Moyen | Le seed actuel ne couvre pas tous les modules recents |
| Secrets Docker de demonstration | Moyen | A remplacer avant installation client reelle |

## Prochaines etapes recommandees

1. Creer une baseline Prisma officielle dans `prisma/migrations` pour permettre `PRISMA_MIGRATE_DEPLOY=true`.
2. Ajouter un seed minimal client couvrant organisation, admin, sources, KPI demo et modules decisionnels essentiels.
3. Ajouter une procedure de smoke test Docker automatisee.
4. Preparer une configuration `.env.production.example` separee des valeurs locales de demonstration.
5. Documenter le passage controle de `DATA_MODE=local` a `DATA_MODE=prisma`.
