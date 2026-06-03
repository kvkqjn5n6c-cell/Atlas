# Prisma Alert Engine V1

## Objectif

Cette phase rend le moteur d'alertes local progressivement compatible Prisma sans remplacer le fonctionnement local actuel.

Le principe reste le même que pour les phases KPI et décisionnelles :

- `DATA_MODE=local` ou `DATA_MODE=mock` : localStorage reste la source fiable.
- `DATA_MODE=prisma` : Atlas tente Prisma.
- erreur Prisma : fallback localStorage avec warning console.

## Périmètre

Cette version couvre :

- règles d'alerte locales paramétrables ;
- snapshots d'alertes locales générées.

Sont exclus :

- Atlas Memory ;
- recommandations ;
- priorités ;
- context packs ;
- connecteurs ;
- IA.

## Règles d'alerte locales

Le modèle `LocalAlertRule` existait déjà dans Prisma.

Couche d'accès :

- `src/lib/repositories/local-alert-rules.repository.ts`
- `src/lib/services/local-alert-rules.service.ts`
- `src/lib/actions/local-alert-rules-actions.ts`

Les composants continuent à écrire localement en premier, puis déclenchent une synchronisation Prisma best-effort.

## Snapshots d'alertes locales

Les alertes locales restent calculées à la volée depuis :

- résultats KPI ;
- historique KPI ;
- règles d'alerte locales.

Pour préparer la persistance, cette phase ajoute `LocalAlertSnapshot`.

Un snapshot conserve uniquement une trace compacte :

- identifiant d'alerte ;
- source ;
- criticité ;
- titre ;
- message ;
- KPI/règle liés ;
- date de génération ;
- métadonnées utiles.

Il ne remplace pas le moteur d'alertes.

## Pourquoi ne pas utiliser `Alert`

`Alert` représente la future alerte persistée côté plateforme.

`LocalAlertSnapshot` représente une trace transitoire issue du moteur local/mock. Ce choix évite de mélanger :

- alertes serveur futures ;
- alertes locales calculées depuis localStorage ;
- règles expérimentales personnalisées.

## Limites

- Les lectures UI restent principalement calculées à la volée.
- Les snapshots peuvent être absents si l'utilisateur ne visite pas une page qui recalcule les alertes.
- Il n'y a pas encore de mécanisme serveur planifié pour recalculer les alertes.
- Les snapshots ne constituent pas encore un workflow complet d'alerte résolue/assignée.

## Vérifications

```bash
npx prisma validate
npm run prisma:generate
npm run lint
npm run build
npm run test
```
