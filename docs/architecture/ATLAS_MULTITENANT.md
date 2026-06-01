# Atlas Multi-Tenant

## Rôle

Atlas Multi-Tenant garantit que chaque organisation dispose d'un espace isolé pour ses données, sa mémoire, ses connecteurs, ses agents, ses KPI et ses recommandations.

## Principe central

`organizationId` est la frontière métier et technique principale.

Tout objet important doit être rattaché à une organisation :

- utilisateurs via membership ;
- sources ;
- imports ;
- mappings ;
- dictionnaire métier ;
- mémoire ;
- KPI ;
- résultats ;
- alertes ;
- règles ;
- plans d'action ;
- rapports ;
- agents ;
- journaux d'audit.

## Isolation des données

Chaque requête doit être filtrée par organisation. Aucun accès direct sans contexte tenant ne doit être accepté.

## Isolation de la mémoire

La mémoire Atlas est propre à chaque organisation. Les agents ne peuvent utiliser que la mémoire autorisée pour le tenant courant.

## Isolation des agents

Un agent s'exécute dans un contexte :

- organisation ;
- utilisateur ;
- rôle ;
- période ;
- permissions ;
- mémoire autorisée ;
- sources autorisées.

## Entrées

- Session utilisateur.
- OrganizationUser.
- Organisation active.
- Permissions.
- Scope de données.

## Sorties

- Données filtrées.
- Mémoire filtrée.
- Agents bornés.
- Rapports propres à l'organisation.

## Risques

- Oubli de filtre `organizationId`.
- Fallback mock qui masque une erreur tenant.
- Données localStorage non isolées par utilisateur réel.
- Agents qui consomment une mémoire trop large.
- Exports ou rapports mal scindés.

## Règles d'architecture

- Les repositories doivent exiger `organizationId` pour toute donnée métier.
- Les services doivent refuser les accès hors scope.
- Les agents doivent recevoir un contexte tenant explicite.
- Les connecteurs doivent créer des imports rattachés à une organisation.
- Les logs doivent inclure l'organisation.

## Évolutions futures

- Middleware serveur de tenant.
- Policies d'accès.
- Tests anti-fuite tenant.
- Audit par organisation.
- Stockage mémoire séparé par tenant.
- Agents exécutés dans un contexte borné.
