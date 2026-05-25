# Atlas

Plateforme web de pilotage de performance pour PME/TPE.

Atlas centralise les indicateurs, suit les ecarts aux objectifs, detecte les derives, priorise les alertes, prepare les rapports et structure les plans d'action. Le produit n'est pas un ERP complet et ne doit pas devenir un logiciel comptable.

Atlas IA designera plus tard une composante d'analyse intelligente. Elle n'est pas integree dans cette version.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Zod
- React Hook Form
- Recharts

## Cadrage Produit

Le document produit de reference est disponible dans [docs/PRODUCT_BLUEPRINT.md](docs/PRODUCT_BLUEPRINT.md).
Le modele de donnees cible est documente dans [docs/DATA_MODEL.md](docs/DATA_MODEL.md).
La strategie de persistance progressive est decrite dans [docs/DATA_PERSISTENCE.md](docs/DATA_PERSISTENCE.md).

## Navigation Cible

- Accueil
- Pilotage
- Indicateurs
- Sources de donnees
- Rapports
- Plans d'action
- Organisations
- Parametres

Les anciens modules operationnels restent dans le projet quand ils sont utiles comme base, mais ils sortent de la navigation principale afin de recentrer Atlas sur le pilotage de performance.

## Architecture

```text
docs/
  PRODUCT_BLUEPRINT.md Cadrage produit officiel
integrations/
  contracts/           Interfaces TypeScript des connecteurs externes
  providers/mock/      Providers mockes sans dependance fournisseur
  registry.ts          Point d'acces decouple aux providers actifs
prisma/
  schema.prisma        Modele multi-tenant et objets metier
  seed.ts              Donnees de demonstration
src/
  app/
    (auth)/login/      Route preparee pour l'authentification
    (app)/             Layout SaaS authentifie
      pilotage/        Cockpit principal Atlas
      data-sources/    Socle des connecteurs clients
      indicators/      Placeholder KPI
      reports/         Placeholder rapports
      action-plans/    Placeholder plans d'action
      organizations/   Placeholder organisations
      settings/        Placeholder parametres
  components/
    app-shell/         Layout principal et sidebar
    data-sources/      Composants sources de donnees
    pilotage/          Composants cockpit Atlas
    ui/                Primitives UI
  lib/
    business/          Fonctions pures de pilotage
    mock/              Donnees mockees Atlas
    validators/        Schemas Zod par domaine
  types/
    atlas.ts           Types produit Atlas
```

## Principes Produit

- Chaque module doit aider a mesurer, comprendre, prioriser ou decider.
- Les ecrans doivent rester lisibles et orientes performance.
- Les sources de donnees sont preparees cote front et types, sans connexion reelle pour l'instant.
- Le coeur metier ne depend jamais directement d'un fournisseur externe.
- Atlas IA est seulement mentionne comme evolution future, sans logique IA ni appel API.

## Architecture D'integration

Le dossier `integrations/` prepare la connexion future avec des APIs externes et connecteurs clients. Les modules metier passent par des contrats et un registre de providers.

```text
modules metier -> services metier -> contracts / registry -> providers -> APIs externes
```

## Lancer Le Projet

```bash
npm install
npm run prisma:generate
npm run dev
```

Le cockpit principal est disponible sur `http://localhost:3000/pilotage`.

## Mode De Donnees

Atlas utilise `DATA_MODE=mock` par defaut. `DATA_MODE=prisma` active progressivement les repositories compatibles Prisma, avec fallback mock si la base n'est pas disponible.
