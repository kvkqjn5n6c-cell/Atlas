# Installation locale Docker Atlas

## Objectif

Cette procedure vise a lancer Atlas sur une machine vierge avec Docker Desktop :

```bash
git clone <repository-atlas>
cd <repository-atlas>
docker compose up -d
```

Le demarrage cree :

- un conteneur PostgreSQL `atlas-postgres` ;
- un conteneur applicatif `atlas-app` ;
- un volume PostgreSQL `postgres_data` ;
- une base `atlas` initialisee avec le schema documentaire `docs/prisma/atlas_baseline_initial.sql`.

## Prerequis

- Docker Desktop installe et demarre.
- Acces au port `3000` pour Atlas.
- Acces au port `5432` pour PostgreSQL.

## Variables Docker

Le fichier `.env.docker` fournit les valeurs locales :

```env
DATABASE_URL="postgresql://atlas:atlas@postgres:5432/atlas"
DATA_MODE="local"
NODE_ENV="production"
PORT="3000"
HOSTNAME="0.0.0.0"
NEXTAUTH_SECRET="docker-local-development-secret-change-me"
NEXTAUTH_URL="http://localhost:3000"
PRISMA_MIGRATE_DEPLOY="false"
```

`DATA_MODE=local` reste le mode par defaut afin de ne pas remplacer brutalement les flux localStorage existants.

## Prisma et migrations

Le conteneur Atlas execute au demarrage :

```bash
npx prisma generate
```

`prisma migrate deploy` est desactive par defaut avec :

```env
PRISMA_MIGRATE_DEPLOY="false"
```

Raison : l'historique de migrations actuel contient des migrations de transition mais pas encore une migration initiale complete applicable a une base PostgreSQL vide. Pour rendre Docker utilisable sans creer de nouvelle migration, PostgreSQL est initialise avec :

```text
docs/prisma/atlas_baseline_initial.sql
```

Quand une baseline officielle sera creee dans `prisma/migrations`, `PRISMA_MIGRATE_DEPLOY` pourra passer a `true` et l'initialisation SQL documentaire devra etre retiree ou adaptee.

## Lancement

```bash
docker compose up -d
```

Puis ouvrir :

```text
http://localhost:3000
```

## Verification

Voir les conteneurs :

```bash
docker compose ps
```

Voir les logs applicatifs :

```bash
docker compose logs -f atlas-app
```

Voir les logs PostgreSQL :

```bash
docker compose logs -f postgres
```

Verifier la configuration Compose :

```bash
docker compose config
```

## Arret

Arreter les conteneurs sans supprimer les donnees :

```bash
docker compose down
```

## Reinitialisation locale

Supprimer les conteneurs et le volume PostgreSQL :

```bash
docker compose down -v
```

Cette commande supprime la base locale Docker. Elle ne touche pas aux donnees localStorage du navigateur.

## Limites Phase 72

- Docker n'active pas encore `DATA_MODE=prisma` par defaut.
- Le seed Prisma n'est pas execute automatiquement.
- Les migrations Prisma ne constituent pas encore une chaine complete depuis une base vide.
- Les mots de passe Docker sont des valeurs locales de demonstration, non adaptees a une installation production.
