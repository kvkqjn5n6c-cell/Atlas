# Atlas AI Layer

## Rôle

Atlas AI Layer est la couche générative du système. Elle enrichit les analyses, reformule les synthèses, aide à produire des recommandations et assiste les agents, mais elle ne remplace pas le moteur métier déterministe.

L'IA est une composante d'Atlas, pas son centre de gravité.

## Responsabilités

- Reformuler des insights en langage dirigeant.
- Générer des synthèses à partir de faits vérifiés.
- Proposer des plans d'action à partir de règles, KPI et mémoire.
- Aider les agents à produire des livrables.
- Expliquer les signaux avec sources et éléments utilisés.
- Respecter le contexte tenant et les permissions.

## Entrées

- Résultats du Business Engine.
- Atlas Memory validée.
- KPI, alertes, règles et historiques.
- Documents autorisés.
- Contexte utilisateur.
- Permissions.

## Sorties

- Synthèses.
- Reformulations.
- Recommandations argumentées.
- Brouillons de rapports.
- Questions de clarification.
- Propositions d'actions.

## Dépendances

- Atlas Security pour filtrer les accès.
- Atlas Multi-Tenant pour borner les données.
- Atlas Memory pour le contexte.
- Atlas Business Engine pour les faits et règles.
- Atlas Agents pour les missions spécialisées.

## Garde-fous

- Pas de décision critique basée uniquement sur une génération IA.
- Pas d'accès hors organisation.
- Pas de réponse sans source ou preuve lorsque le sujet est métier.
- Pas de fausse certitude si les données sont incomplètes.
- Pas de mutation automatique sans validation humaine.

## Relation avec les agents

Les agents utilisent l'AI Layer comme outil, pas comme autorité finale. Un agent peut demander à l'IA :

- de synthétiser ;
- de comparer ;
- de reformuler ;
- de préparer un livrable ;
- de proposer des pistes.

Mais l'agent doit rester responsable de la structure, du contexte et des règles métier.

## Évolutions futures

- Recherche augmentée sur la mémoire Atlas.
- Citations de sources.
- Journal des prompts.
- Évaluation qualité des réponses.
- Modèles spécialisés selon le domaine.
- Validation humaine avant action.
