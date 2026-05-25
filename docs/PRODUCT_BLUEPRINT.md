# Atlas - Product Blueprint

Document de cadrage produit officiel pour garder Atlas coherent, modulaire et centre sur le pilotage de performance.

## Vision Produit

Atlas est une plateforme web de pilotage de performance pour PME/TPE.

Atlas se positionne entre un espace client qui affiche seulement des chiffres et un mini ERP trop large. Le produit centralise les indicateurs, suit les ecarts aux objectifs, detecte les derives, priorise les alertes, produit des rapports et prepare des plans d'action.

Atlas n'est pas un ERP complet, ni un logiciel comptable complet.

Atlas IA designera plus tard une composante d'analyse intelligente. Elle n'est pas integree dans cette phase.

## Philosophie

- Mesurer ce qui compte.
- Detecter rapidement les derives.
- Transformer les alertes en decisions.
- Relier chaque KPI a une source de donnees.
- Garder une interface sobre, actionnable et non tentaculaire.

## Navigation Cible

- Accueil
- Pilotage
- Indicateurs
- Sources de donnees
- Rapports
- Plans d'action
- Organisations
- Parametres

## Flux Cible

```text
Sources de donnees -> KPI -> Alertes -> Recommandations -> Plans d'action -> Rapports
```

## Architecture

```text
Interface Atlas
  -> modules de pilotage
  -> services metier
  -> types et mocks Atlas
  -> contracts / registry
  -> providers futurs
  -> APIs externes
```

Le coeur produit ne doit jamais dependre directement d'un fournisseur externe.

## Modules V1

- Pilotage
- Indicateurs
- Sources de donnees
- Rapports
- Plans d'action
- Organisations
- Parametres

## Sources De Donnees

La page Sources de donnees prepare les futurs connecteurs clients :

- Excel
- CSV
- MySQL
- PostgreSQL
- SQL Server

Statuts :

- connecte
- a verifier
- erreur
- inactif

Usages metier :

- CA
- marge
- activite
- tresorerie
- interventions
- qualite

## Cockpit Pilotage

La page Pilotage est le coeur du produit :

- score de performance global ;
- KPI critiques ;
- KPI a surveiller ;
- tendances ;
- alertes prioritaires ;
- recommandations deterministes ;
- decisions recommandees ;
- plan d'action court terme.

## Types Centraux

- `Organization`
- `PerformanceKPI`
- `DataSource`
- `DataSourceType`
- `DataSourceStatus`
- `Report`
- `ActionPlanItem`
- `Alert`

## Regles Anti-Derive

- Ne pas presenter Atlas comme un ERP.
- Ne pas creer de CRUD complet sans impact pilotage.
- Ne pas connecter de vraie API tant que le contrat produit n'est pas stabilise.
- Ne pas integrer Atlas IA maintenant.
- Ne pas ajouter de module qui ne produit pas de decision, alerte, KPI, rapport ou plan d'action.

## Vision Long Terme

Atlas doit devenir la couche de pilotage transverse des PME : connecter les donnees clients, transformer ces donnees en indicateurs, faire ressortir les risques, structurer les plans d'action et preparer l'arrivee future d'Atlas IA.
