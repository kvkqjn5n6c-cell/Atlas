# Atlas Core

## Rôle

Atlas Core est le socle applicatif qui orchestre les organisations, utilisateurs, rôles, contextes actifs, modules, permissions et workflows transverses.

Il ne contient pas la logique métier profonde des KPI ou des connecteurs. Il coordonne les blocs spécialisés.

## Responsabilités

- Gérer le contexte actif : organisation, période, utilisateur, rôle.
- Exposer les parcours principaux : pilotage, sources, KPI, alertes, rapports, plans d'action.
- Garantir que chaque accès est rattaché à une organisation.
- Fournir les contrats de communication entre UI, services, repositories et moteurs métier.
- Centraliser les conventions de statut, permissions, navigation et modes de données.

## Entrées

- Session utilisateur.
- Organisation active.
- Période active.
- Permissions.
- Données des services Atlas.

## Sorties

- Données prêtes pour les pages.
- Navigation adaptée au rôle.
- Badges de mode technique.
- Contexte transmis aux moteurs, agents et connecteurs.

## Dépendances

- Atlas Security pour les permissions.
- Atlas Multi-Tenant pour l'isolation.
- Repositories/services pour l'accès aux données.
- Atlas Business Engine pour les calculs et décisions.

## Évolutions futures

- Remplacer le contexte mocké par un vrai contexte de session.
- Déplacer les accès directs localStorage vers des services dédiés.
- Unifier les retours de services et erreurs.
- Introduire une orchestration serveur pour les jobs longs.
- Ajouter une observabilité produit : erreurs, latence, usage, audit.

## Règle d'architecture

Le Core ne doit pas connaître les détails d'un connecteur, d'un fournisseur IA ou d'un système client. Il orchestre des contrats stables.
