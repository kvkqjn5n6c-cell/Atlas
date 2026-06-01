# Atlas Memory

## Rôle

Atlas Memory est la mémoire structurée et versionnée d'une organisation. Elle permet à Atlas de comprendre le vocabulaire, les règles, les objectifs, les décisions et les connaissances propres à chaque entreprise.

Cette mémoire est distincte d'un simple stockage de fichiers. Elle doit être exploitable par le moteur métier, les agents et la couche IA.

## Structure cible

```text
Organization
 ├── entreprise.md
 ├── strategie.md
 ├── objectifs.md
 ├── processus.md
 ├── regles_metier.md
 ├── glossaire.md
 ├── clients.md
 ├── fournisseurs.md
 ├── historique_decisions.md
 ├── offres.md
 ├── kpi.md
 └── equipe.md
```

## Objectifs

- Donner un contexte métier stable aux agents.
- Mémoriser les décisions et leurs raisons.
- Réutiliser le vocabulaire métier entre imports.
- Relier les KPI aux objectifs, processus, règles et responsabilités.
- Distinguer données opérationnelles, règles métier et connaissance durable.

## Cycle de vie

1. Initialisation depuis un questionnaire, un audit ou des documents clients.
2. Enrichissement par imports, mappings, dictionnaire métier et corrections.
3. Validation par un consultant ou un administrateur client.
4. Versioning des modifications significatives.
5. Exploitation par les agents et le moteur métier.
6. Archivage ou suppression selon les règles RGPD.

## Alimentation

- Saisie structurée.
- Imports CSV/Excel.
- Documents d'entreprise.
- Connecteurs SI.
- Corrections de mapping.
- Décisions prises dans Atlas.
- Retours consultants.

## Exploitation par les agents

- Agent KPI : utilise `objectifs.md`, `kpi.md`, `regles_metier.md`.
- Agent Risques : utilise `processus.md`, `historique_decisions.md`, `kpi.md`.
- Agent COPIL : utilise `strategie.md`, `objectifs.md`, `historique_decisions.md`.
- Agent Synthèse dirigeant : utilise l'ensemble de la mémoire validée.
- Agent Commercial : utilise `offres.md`, `clients.md`, `strategie.md`.
- Agent Compétences : utilise `equipe.md`, `processus.md`, `objectifs.md`.

## Versioning

Chaque entrée mémoire doit pouvoir porter :

- organisation ;
- auteur ;
- date ;
- source ;
- version ;
- statut de validation ;
- traces des changements.

## Isolation

La mémoire est strictement isolée par organisation. Aucun agent ne peut lire la mémoire d'un autre tenant.

## Évolutions futures

- Stockage structuré en base.
- Index documentaire.
- Historique de versions.
- Validation humaine.
- Recherche sémantique encadrée.
- Exploitation par Atlas AI Layer avec citations et sources.
