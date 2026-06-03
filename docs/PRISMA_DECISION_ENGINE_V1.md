# Prisma Decision Engine V1

Cette phase introduit une première persistance Prisma progressive pour une partie du cœur décisionnel Atlas.

## Périmètre migré

La V1 couvre uniquement :

- plans d'action locaux ;
- feedback sur recommandations ;
- journal décisionnel.

Ces domaines restent utilisables en localStorage. Prisma est ajouté comme rail de persistance progressif, sans big bang.

## Ce qui reste local

Les domaines suivants ne sont pas migrés dans cette phase :

- KPI locaux ;
- résultats KPI ;
- historique KPI ;
- alertes locales ;
- règles d'alerte ;
- Atlas Memory ;
- imports CSV locaux ;
- impacts de plans d'action.

Ils conservent leur fonctionnement actuel.

## Stratégie

Le comportement cible est :

- `DATA_MODE=local` ou `DATA_MODE=mock` : lecture/écriture localStorage ;
- `DATA_MODE=prisma` : tentative Prisma ;
- erreur Prisma : fallback localStorage.

L'interface continue d'écrire localement en premier pour préserver l'expérience existante. Les actions serveur synchronisent ensuite vers Prisma en best effort.

## Modèles ajoutés

Modèles Prisma :

- `LocalActionPlan`
- `LocalRecommendationFeedback`
- `DecisionJournalEntry`

Chaque modèle est relié à `Organization` et contient :

- identifiant stable ;
- timestamps ;
- `persistedSource` ;
- `metadata` lorsque nécessaire.

## Fichiers clés

Repositories :

- `src/lib/repositories/local-action-plans.repository.ts`
- `src/lib/repositories/recommendation-feedback.repository.ts`
- `src/lib/repositories/decision-journal.repository.ts`

Services :

- `src/lib/services/local-action-plans.service.ts`
- `src/lib/services/recommendation-feedback.service.ts`
- `src/lib/services/decision-journal.service.ts`

Actions serveur :

- `src/lib/actions/decision-engine-persistence-actions.ts`

## Limites

- Les lectures UI restent principalement locales pour éviter une rupture d'usage.
- La synchronisation Prisma n'est pas encore bidirectionnelle.
- Les impacts de plans ne sont pas persistés en Prisma dans cette phase.
- Aucun `migrate dev` n'est imposé si PostgreSQL local est absent.

## Commandes utiles

```bash
npx prisma validate
npm run prisma:generate
npm run lint
npm run build
npm run test
```

## Prochaine étape

Une phase suivante pourra migrer les impacts de plans, puis les KPI locaux et historiques, avec une stratégie de lecture serveur plus complète.
