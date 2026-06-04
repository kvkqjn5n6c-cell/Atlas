# Persistance Prisma locale

Atlas reste utilisable sans base de données : le mode par défaut est `DATA_MODE=mock`, avec stockage local côté navigateur pour les imports et KPI créés pendant la démonstration.

La Phase 25 ajoute une première persistance PostgreSQL + Prisma optionnelle pour sortir progressivement du tout `localStorage`.

## Périmètre persistant

Cette première bascule couvre uniquement :

- le dictionnaire métier par organisation ;
- les configurations de KPI locaux ;
- les résultats de KPI locaux ;
- l'historique des KPI locaux.

Atlas ne persiste pas encore :

- les fichiers CSV complets ;
- les uploads ;
- les connecteurs SQL externes ;
- les traitements temps réel ;
- Atlas IA.

## Modes de données

`DATA_MODE=mock` reste le mode par défaut. L'application lit les mocks et conserve les données locales dans le navigateur.

`DATA_MODE=prisma` active les repositories Prisma quand une base locale est disponible. En cas d'erreur Prisma, Atlas repasse en fallback local et garde l'interface stable.

Exemple local :

```env
DATA_MODE=prisma
DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas"
```

## Commandes utiles

```powershell
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run prisma:seed
npm.cmd run dev
```

Pour valider le schéma sans base active :

```powershell
npx.cmd prisma validate
```

## Préparer PostgreSQL local

Atlas attend une base PostgreSQL locale accessible avec :

```env
DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas"
```

Option PostgreSQL installé localement :

1. Installer PostgreSQL pour Windows depuis l'installeur officiel ou via un gestionnaire local déjà utilisé sur la machine.
2. Créer l'utilisateur et la base :

```sql
CREATE USER atlas WITH PASSWORD 'atlas';
CREATE DATABASE atlas OWNER atlas;
GRANT ALL PRIVILEGES ON DATABASE atlas TO atlas;
```

3. Définir les variables dans un fichier `.env` local ou dans le terminal courant :

```powershell
$env:DATA_MODE="prisma"
$env:DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas"
```

4. Lancer :

```powershell
npx.cmd prisma validate
npx.cmd prisma migrate dev
npm.cmd run prisma:generate
npm.cmd run prisma:seed
```

Docker n'est pas requis par Atlas. Il peut être utilisé plus tard si l'équipe veut standardiser l'environnement, mais cette phase reste compatible avec une installation PostgreSQL locale classique.

## Résultat de validation Phase 26

Validation réalisée dans cet environnement :

- `npx.cmd prisma validate` : OK avec `DATABASE_URL` temporaire.
- `npm.cmd run prisma:generate` : OK.
- `npx.cmd prisma migrate dev` : bloqué, car aucun serveur PostgreSQL local n'est disponible sur `localhost:5432`.
- `DATA_MODE=prisma` : les repositories tentent bien l'écriture Prisma et repassent en fallback local lorsque la base est indisponible.

Le blocage est donc infrastructurel, pas applicatif : installer/démarrer PostgreSQL local et créer la base `atlas` permettra d'exécuter la migration.

## Migration douce

Les composants continuent d'écrire d'abord dans les stores locaux pour préserver l'expérience utilisateur. Une action serveur tente ensuite une persistance Prisma non bloquante :

1. KPI créé depuis un import local ;
2. résultat KPI généré ;
3. point d'historique ajouté ;
4. écriture Prisma si `DATA_MODE=prisma` ;
5. fallback local si Prisma est indisponible.

Les badges techniques `Mode local`, `Mode Prisma` et `Fallback local actif` indiquent discrètement la source de données dans les écrans admin.

## Prochaine étape

La suite logique sera une synchronisation explicite local vers Prisma, puis une lecture serveur des KPI locaux dans le cockpit, les alertes et les rapports.

## Résultat de validation Phase 55

Validation réalisée le 4 juin 2026 dans cet environnement local :

- `psql` : absent du `PATH`.
- Service PostgreSQL Windows : aucun service PostgreSQL détecté.
- Port `localhost:5432` : fermé.
- Base `atlas` : non vérifiable, serveur indisponible.
- Utilisateur `atlas` : non vérifiable, serveur indisponible.
- `.env` local : créé avec `DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas"` et `DATA_MODE="local"`.
- `.env.example` : aligné sur la configuration locale Atlas.
- `npx.cmd prisma validate` : OK avec la configuration locale.
- `npm.cmd run prisma:generate` : OK.
- `npx.cmd prisma migrate dev --skip-generate --skip-seed` : bloqué car PostgreSQL ne répond pas sur `localhost:5432`.
- `npm.cmd run prisma:seed` : bloqué car PostgreSQL ne répond pas sur `localhost:5432`.

Le blocage est donc infrastructurel : PostgreSQL local n'est pas installé, pas démarré, ou pas exposé sur le port attendu.

## Installation PostgreSQL Windows

Option locale classique :

1. Installer PostgreSQL pour Windows.
2. Ajouter le dossier `bin` de PostgreSQL au `PATH` si `psql` n'est pas reconnu.
3. Vérifier le service Windows PostgreSQL.
4. Vérifier le port :

```powershell
Test-NetConnection -ComputerName localhost -Port 5432
```

5. Créer l'utilisateur et la base depuis un compte administrateur PostgreSQL :

```sql
CREATE USER atlas WITH PASSWORD 'atlas';
CREATE DATABASE atlas OWNER atlas;
GRANT ALL PRIVILEGES ON DATABASE atlas TO atlas;
```

Si l'utilisateur existe déjà :

```sql
ALTER USER atlas WITH PASSWORD 'atlas';
```

Si la base existe déjà :

```sql
ALTER DATABASE atlas OWNER TO atlas;
```

## Procédure Phase 55 attendue une fois PostgreSQL actif

Depuis le dossier du projet :

```powershell
$env:DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas"
npx.cmd prisma validate
npm.cmd run prisma:generate
npx.cmd prisma migrate dev
npm.cmd run prisma:seed
```

Puis tester l'application :

```powershell
$env:DATA_MODE="prisma"
npm.cmd run dev
```

## Reset local de développement

À utiliser uniquement sur une base locale jetable :

```powershell
$env:DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas"
npx.cmd prisma migrate reset
npm.cmd run prisma:seed
```

Attention : cette commande supprime les données PostgreSQL locales. Elle ne supprime pas les données localStorage du navigateur.
