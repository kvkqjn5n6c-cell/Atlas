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
