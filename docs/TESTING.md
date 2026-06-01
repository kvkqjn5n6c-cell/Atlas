# Tests automatisés Atlas

Atlas protège progressivement ses moteurs métier avec Vitest. L'objectif n'est pas une couverture exhaustive, mais une non-régression sur les calculs qui portent la valeur produit : KPI, alertes, règles, insights et synthèse dirigeant.

## Commandes

```bash
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

## Structure

```txt
tests/
├── alerts/
├── executive-summary/
├── fixtures/
├── insights/
└── kpi/
```

Les fixtures centralisées dans `tests/fixtures/local-engine-fixtures.ts` décrivent un import local, des KPI, des historiques et des règles d'alerte cohérents. Les tests restent indépendants de l'UI, de Prisma et du `localStorage`.

## Couverture initiale

- `local-kpi-calculator.ts` : somme, moyenne, ratio, direction du KPI et statuts.
- `local-kpi-alerts.ts` : alertes locales watch, critical et absence d'alerte conforme.
- `local-alert-rules-engine.ts` : seuils, variations, persistance et règle désactivée.
- `local-insights-engine.ts` : risques, surveillance, règles déclenchées, historique insuffisant et priorisation.
- `local-executive-summary-engine.ts` : risques, actions, fiabilité, absence d'alerte et consolidation multi-alertes.

## Prochaines extensions

- Ajouter des tests sur les stores locaux avec `localStorage` simulé.
- Couvrir les services `src/lib/services/local-data`.
- Ajouter des tests de validation sur les formulaires critiques.
- Couvrir les futurs repositories Prisma avec une base de test isolée quand la persistance sera stabilisée.
