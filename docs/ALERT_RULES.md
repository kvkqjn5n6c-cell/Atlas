# Règles d'alerte KPI

Atlas supporte des règles d'alerte paramétrables sur les KPI locaux. Elles complètent les alertes classiques issues du statut du KPI.

## Objectif

Une règle d'alerte permet de transformer une configuration métier en supervision explicable :

- alerte si une valeur dépasse un seuil ;
- alerte si l'écart à l'objectif devient trop fort ;
- alerte si une variation augmente ou baisse trop vite ;
- alerte si un KPI reste en alerte pendant plusieurs périodes.

## Fonctionnement local

En `DATA_MODE=mock`, les règles restent stockées dans `localStorage`.

Le store local est volontairement simple :

- lecture par KPI ;
- création ;
- modification ;
- activation / désactivation ;
- suppression ;
- limite raisonnable de règles par KPI.

Les alertes existantes restent actives même si aucun règle personnalisée n'est configurée.

## Préparation Prisma

La Phase 28 ajoute un modèle Prisma `LocalAlertRule` relié à :

- `Organization` ;
- `LocalKpiConfiguration` ;
- `KPIConfiguration` pour préparer les futurs KPI persistés.

Les enums Prisma associés sont :

- `AlertRuleType` ;
- `AlertRuleSeverity` ;
- `AlertComparisonOperator`.

La migration SQL est prête dans :

```text
prisma/migrations/20260527103000_add_local_alert_rules/migration.sql
```

## DATA_MODE et fallback

Le repository respecte la stratégie Atlas :

- `DATA_MODE=mock` : lecture et écriture locales ;
- `DATA_MODE=prisma` : tentative Prisma ;
- erreur Prisma : fallback local avec warning console.

L'interface garde une écriture locale immédiate pour ne pas bloquer le dirigeant ou consultant. Une action serveur tente ensuite la persistance Prisma.

## Limites actuelles

- Les règles ne sont pas encore chargées côté serveur dans le cockpit.
- PostgreSQL local doit être actif pour appliquer réellement la migration.
- Le moteur reste volontairement déterministe et simple.
- Atlas IA n'intervient pas.

## Prochaine étape

Quand PostgreSQL local sera disponible, appliquer la migration puis tester une règle partagée entre deux sessions navigateur.
