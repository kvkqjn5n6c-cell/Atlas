# Atlas - Vision cible

## Positionnement

Atlas est un copilote décisionnel métier capable de transformer les données opérationnelles, les KPI, les documents et les connaissances de l'entreprise en recommandations concrètes et explicables.

Atlas n'est pas un ERP, pas un simple dashboard et pas un assistant IA générique. L'IA est une composante du système, mais la valeur principale repose sur la connaissance métier structurée, la mémoire de l'organisation, le moteur métier, les intégrations SI, les agents spécialisés et la génération de synthèses actionnables.

## Promesse

Atlas aide une PME à répondre rapidement à quatre questions :

- Où est le risque ?
- Quelle donnée est fiable ?
- Quelle décision doit être prise ?
- Quelle action doit être suivie ?

## Architecture fonctionnelle cible

```text
Sources SI et documents
  -> Connecteurs Atlas
  -> Normalisation
  -> Atlas Memory
  -> Atlas Business Engine
  -> Atlas Agents
  -> Synthèses, recommandations, rapports et plans d'action
```

## Blocs principaux

- Atlas Core : orchestration produit, contexte actif, tenant, permissions et parcours.
- Atlas Memory : mémoire structurée de chaque organisation.
- Atlas Business Engine : calculs, règles, alertes, insights, recommandations.
- Atlas Connectors : ingestion de données et documents depuis les systèmes clients.
- Atlas Agents : agents spécialisés orientés métier.
- Atlas AI Layer : composante générative encadrée par les données, règles et permissions.
- Atlas Security : authentification, autorisation, audit, RGPD.
- Atlas Multi-Tenant : isolation stricte des organisations, données, mémoire et agents.

## Principes directeurs

- Toute recommandation doit être explicable.
- Toute donnée utilisée doit être rattachée à une organisation.
- Un agent ne doit jamais accéder à une mémoire ou une donnée hors tenant.
- Le moteur métier doit pouvoir fonctionner sans IA générative.
- Les connecteurs ne doivent jamais contaminer le coeur métier avec une dépendance fournisseur.
- Les documents produits par Atlas doivent être utiles à une décision ou à un suivi.

## Ce qu'Atlas ne doit pas devenir

- Un ERP complet.
- Un outil comptable.
- Un chatbot généraliste.
- Un lac de données sans lecture métier.
- Une interface qui affiche des métriques sans priorisation.

## Vision long terme

Atlas doit devenir la couche décisionnelle transverse des PME : il relie les données, la mémoire métier, les règles, les alertes, les agents et l'IA pour produire une lecture opérationnelle fiable, suivable et exploitable.
