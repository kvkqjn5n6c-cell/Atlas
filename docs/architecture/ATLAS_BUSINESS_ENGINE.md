# Atlas Business Engine

## Rôle

Atlas Business Engine transforme les données normalisées et la mémoire métier en signaux décisionnels : KPI, alertes, règles, insights, synthèses et recommandations.

Il doit fonctionner de manière déterministe, explicable et testable, même sans IA générative.

## Chaîne métier cible

```text
Données normalisées
  -> KPI
  -> Historique
  -> Tendances
  -> Règles métier
  -> Alertes
  -> Insights
  -> Synthèse dirigeant
  -> Recommandations
  -> Plans d'action
  -> Rapports
```

## Responsabilités

- Calculer les KPI.
- Appliquer le sens métier des KPI.
- Comparer valeurs, objectifs et seuils.
- Évaluer les règles d'alerte.
- Produire des alertes priorisées.
- Générer des insights déterministes.
- Produire des synthèses dirigeant.
- Proposer des actions recommandées.
- Distinguer problème de performance et problème de donnée.

## Entrées

- Données normalisées.
- Configurations KPI.
- Historique KPI.
- Règles d'alerte.
- Dictionnaire métier.
- Mémoire Atlas.
- Sources et qualité de données.

## Sorties

- Résultats KPI.
- Statuts et tendances.
- Alertes.
- Insights.
- Synthèses.
- Recommandations.
- Priorités d'action.
- Éléments de rapport.

## Dépendances

- Atlas Memory pour le contexte métier.
- Atlas Connectors pour les données entrantes.
- Atlas Core pour le contexte tenant/période.
- Atlas Security pour les droits d'accès.
- Atlas AI Layer uniquement pour enrichir ou reformuler, jamais pour remplacer les règles critiques.

## Règles clés

- Toute alerte doit avoir une cause et une action recommandée.
- Toute synthèse doit pouvoir expliquer les éléments utilisés.
- Toute recommandation doit être reliée à des KPI, règles, alertes ou données.
- Les règles déterministes priment sur l'IA pour les décisions critiques.

## Évolutions futures

- Moteur de scoring configurable.
- Simulations de scénarios.
- Moteur de règles versionné.
- Tests automatisés sur règles métier.
- Calculs asynchrones côté serveur.
- Recommandations enrichies par Atlas AI Layer avec preuves.
