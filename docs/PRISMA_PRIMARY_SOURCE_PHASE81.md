# Prisma Primary Source - Phase 81

## Objectif

La Phase 81 introduit une bascule controlee vers Prisma comme source principale de lecture pour trois domaines stabilises :

- plans d'action locaux ;
- journal decisionnel ;
- feedback recommandations.

Cette phase ne migre pas automatiquement les donnees, ne supprime pas localStorage et ne modifie pas les moteurs metier.

## Configuration

Atlas conserve `DATA_MODE` :

- `mock`
- `local`
- `prisma`

La Phase 81 ajoute `PRIMARY_SOURCE` :

- `local` : lecture locale par defaut ;
- `prisma` : Prisma devient prioritaire pour les domaines decisionnels couverts.

Par defaut, `PRIMARY_SOURCE=local`.

## Strategie de lecture

Les strategies explicites sont :

- `LOCAL_ONLY` : localStorage uniquement ;
- `PRISMA_PREFERRED` : Prisma en premier, fallback local si indisponible ;
- `PRISMA_ONLY` : reserve pour une phase future.

En Phase 81, les domaines couverts utilisent `PRISMA_PREFERRED` quand `PRIMARY_SOURCE=prisma` ou `DATA_MODE=prisma`.

## Domaines couverts

| Domaine | Strategie Phase 81 | Fallback |
| --- | --- | --- |
| Plans d'action locaux | `PRISMA_PREFERRED` | localStorage |
| Journal decisionnel | `PRISMA_PREFERRED` | localStorage |
| Feedback recommandations | `PRISMA_PREFERRED` | localStorage |

Les autres modules restent hors perimetre :

- Datasets ;
- GroupBy ;
- Insights ;
- Atlas Memory ;
- KPI ;
- Alertes ;
- Dashboard ;
- COPIL.

## Garde-fous coherence

La Phase 81 reutilise l'audit de coherence Phase 80.

Si un domaine decisionnel presente :

- `COUNT_MISMATCH`
- `CONTENT_MISMATCH`

Atlas affiche un warning visible dans `/settings`.

La lecture est maintenue. Aucun blocage, aucune correction et aucune migration automatique ne sont declenches.

## UI Settings

La page `/settings` affiche :

- `DATA_MODE` ;
- `PRIMARY_SOURCE` ;
- la strategie de lecture ;
- les domaines basculables ;
- l'etat de coherence des domaines couverts.

Aucun bouton dangereux n'est expose. La source primaire reste une configuration d'environnement.

## Limites

- La bascule ne garantit pas que PostgreSQL contient deja les donnees locales.
- En cas de divergence localStorage/PostgreSQL, Atlas signale l'ecart mais ne le corrige pas.
- Les ecritures restent pilotees par `DATA_MODE=prisma`.
- `PRISMA_ONLY` n'est pas active en Phase 81.

## Suite recommandee

1. Utiliser l'outillage de migration locale vers Prisma avant toute demonstration en `PRIMARY_SOURCE=prisma`.
2. Surveiller les warnings de coherence dans `/settings`.
3. Etendre progressivement cette politique a d'autres domaines seulement apres validation de coherence.
