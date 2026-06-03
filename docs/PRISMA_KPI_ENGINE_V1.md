# Prisma KPI Engine V1

## Objectif

Cette phase rend le moteur KPI local progressivement compatible Prisma sans remplacer le fonctionnement local actuel.

Le principe reste prudent :

- `DATA_MODE=local` ou `DATA_MODE=mock` : localStorage reste la source fiable.
- `DATA_MODE=prisma` : Atlas tente Prisma.
- erreur Prisma : fallback localStorage avec warning console.

## Périmètre migré

Cette version couvre uniquement :

- configurations KPI locales ;
- résultats KPI locaux ;
- historique KPI local.

Sont exclus de cette phase :

- règles d'alerte ;
- alertes ;
- recommandations ;
- priorités ;
- context packs ;
- Atlas Memory ;
- connecteurs ;
- IA.

## Modèles Prisma utilisés

Les modèles existaient déjà dans le schéma :

- `LocalKpiConfiguration`
- `LocalKpiResult`
- `LocalKpiHistoryPoint`

Ils sont reliés à `Organization` et indexés principalement par :

- `organizationId`
- `kpiId`
- `calculatedAt`

Aucune nouvelle migration n'est nécessaire pour cette phase si la migration KPI existante est déjà présente.

## Couche d'accès

Repositories :

- `src/lib/repositories/local-kpi.repository.ts`
- `src/lib/repositories/local-kpi-results.repository.ts`
- `src/lib/repositories/local-kpi-history.repository.ts`

Services :

- `src/lib/services/local-kpi.service.ts`
- `src/lib/services/local-kpi-results.service.ts`
- `src/lib/services/local-kpi-history.service.ts`

Action serveur :

- `src/lib/actions/local-kpi-persistence-actions.ts`

Les composants continuent à écrire immédiatement en localStorage pour préserver l'expérience actuelle, puis déclenchent une synchronisation Prisma best-effort.

## Points d'écriture raccordés

- création KPI depuis import ;
- recalcul KPI ;
- modification des seuils ;
- sauvegarde du résultat KPI ;
- ajout du point d'historique ;
- suppression d'un KPI et de ses résultats/historiques associés.

## Limites

- Les lectures UI restent majoritairement locales pour éviter une rupture de comportement.
- La synchronisation Prisma n'est pas bloquante.
- Il n'y a pas encore de migration automatique des données localStorage existantes vers PostgreSQL.
- Prisma peut échouer si la base locale n'est pas disponible ou si l'organisation liée n'existe pas encore.

## Commandes de vérification

```bash
npx prisma validate
npm run prisma:generate
npm run lint
npm run build
npm run test
```

Si aucune base PostgreSQL locale n'est disponible, `prisma validate` peut être lancé avec une `DATABASE_URL` temporaire en session.
