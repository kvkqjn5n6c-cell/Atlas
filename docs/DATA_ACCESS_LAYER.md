# Atlas - Data Access Layer

## Objectif

Cette note formalise la transition progressive d'Atlas vers une couche d'accès aux données plus propre.

L'objectif est d'éviter que les composants UI lisent directement :

- `localStorage` ;
- les stores locaux ;
- les mocks ;
- Prisma ;
- les repositories bas niveau.

## Problème actuel

Atlas a évolué rapidement par phases. Plusieurs composants lisent encore directement les stores locaux ou les mocks pour valider les parcours produit.

Cette approche a permis de démontrer vite :

- imports CSV locaux ;
- mapping ;
- KPI locaux ;
- alertes ;
- insights ;
- synthèse dirigeant.

Mais elle bloque progressivement :

- la bascule Prisma ;
- la future Atlas Memory ;
- les connecteurs ;
- les agents spécialisés ;
- les tests unitaires ;
- le multi-tenant serveur.

## Architecture cible

```text
UI
  -> hooks client ou services serveur
  -> services métier/data
  -> repositories ou stores adapters
  -> source réelle, mock ou locale
```

## Rôle des couches

### Store local

Adapter technique autour de `localStorage`.

Il sait lire, écrire, supprimer et protéger contre les erreurs navigateur. Il ne doit pas contenir de logique produit large.

Exemples :

- `local-import-store.ts`
- `local-kpi-store.ts`
- `local-kpi-results-store.ts`
- `local-kpi-history-store.ts`
- `local-alert-rules-store.ts`
- `business-dictionary-store.ts`

### Service local-data

Couche de composition métier locale.

Elle centralise plusieurs stores et moteurs pour retourner des données prêtes à afficher.

Exemples :

- `local-kpis-data.service.ts`
- `local-alerts-data.service.ts`
- `local-insights-data.service.ts`
- `local-imports-data.service.ts`
- `local-business-dictionary-data.service.ts`

### Hook client

Couche React qui consomme les services locaux et gère :

- chargement côté navigateur ;
- refresh ;
- suppression ou mise à jour locale ;
- données prêtes pour les composants.

Exemples :

- `useLocalKpiWorkspace`
- `useLocalKpiAlerts`
- `useLocalInsights`
- `useLocalExecutiveSummary`
- `useLocalImportsWorkspace`
- `useLocalAlertRules`

### Repository

Couche de persistance évolutive.

Il peut lire Prisma, mock ou fallback local selon `DATA_MODE`.

### Service applicatif

Couche qui prépare les données pour les pages serveur ou les workflows métier.

## Règle de développement

Les nouveaux composants ne doivent pas importer directement `@/lib/local/*` ou `@/lib/mock/*` sauf exception justifiée.

Préférer :

- hooks pour composants client ;
- services pour composition métier ;
- repositories pour accès Prisma/mock ;
- stores uniquement comme adapters techniques.

## Refactor Phase 32

Centralisé dans cette phase :

- cockpit KPI local via `useLocalKpiWorkspace` ;
- rapports KPI locaux via `useLocalKpiWorkspace` ;
- alertes locales via `useLocalKpiAlerts` ;
- workspace d'imports via `useLocalImportsWorkspace` ;
- lecture des KPI locaux dans configuration via `useLocalKpiWorkspace`.

## Accès directs encore présents

À centraliser progressivement :

- création KPI depuis import ;
- édition des seuils ;
- panneau des règles d'alerte ;
- page dictionnaire métier ;
- import fichier local ;
- certains écrans mockés historiques ;
- cockpit principal encore alimenté par mocks historiques.

## Préparation Prisma, Memory, Connectors et Agents

Cette couche prépare :

- Prisma réel : les hooks pourront appeler des services eux-mêmes branchés sur repositories ;
- Atlas Memory : les services pourront enrichir leurs retours avec mémoire organisationnelle ;
- Connecteurs : les imports locaux pourront être remplacés par des jobs serveur ;
- Agents : les agents consommeront des services stables plutôt que des stores UI.

## Principe stratégique

La dette ne doit pas être supprimée par une refonte massive. Elle doit être réduite flux par flux, en gardant le produit fonctionnel à chaque étape.
