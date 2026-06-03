# Prisma Atlas Memory V1

## Objectif

Cette phase prépare la persistance serveur d'Atlas Memory sans remplacer le fonctionnement local actuel.

Le principe reste progressif :

- `DATA_MODE=local` ou `DATA_MODE=mock` : localStorage reste la source fiable.
- `DATA_MODE=prisma` : Atlas tente Prisma.
- erreur Prisma : fallback localStorage avec warning console.

## Périmètre Prisma-ready

Cette version couvre :

- documents Atlas Memory Markdown ;
- connaissances détectées, validées ou rejetées ;
- métadonnées simples de gouvernance.

Sont exclus :

- recherche vectorielle ;
- embeddings ;
- IA ;
- agents ;
- recommandations ;
- priorités ;
- context packs ;
- connecteurs.

## Modèles ajoutés

### AtlasMemoryDocument

Stocke une version persistable d'un document mémoire :

- organisation ;
- slug (`strategie.md`, `regles_metier.md`, etc.) ;
- titre ;
- description ;
- contenu Markdown ;
- catégorie ;
- statut ;
- version ;
- métadonnées.

### AtlasMemoryKnowledgeItem

Stocke une connaissance extraite/gouvernée :

- organisation ;
- document source ;
- type (`objective`, `business_rule`, `decision`, `glossary`) ;
- valeur ;
- statut (`detected`, `approved`, `rejected`) ;
- dates de détection, validation, rejet ;
- notes.

## Couche d'accès

Repositories :

- `src/lib/repositories/atlas-memory-documents.repository.ts`
- `src/lib/repositories/atlas-memory-knowledge.repository.ts`

Services :

- `src/lib/services/atlas-memory-documents.service.ts`
- `src/lib/services/atlas-memory-knowledge.service.ts`

Actions serveur :

- `src/lib/actions/atlas-memory-persistence-actions.ts`

## Intégration actuelle

La page `/atlas-memory` continue à lire depuis localStorage et les mocks pour préserver le comportement.

Les écritures suivantes déclenchent maintenant une synchronisation Prisma best-effort :

- sauvegarde d'un document mémoire ;
- réinitialisation d'un document ;
- validation d'une connaissance ;
- rejet d'une connaissance ;
- réinitialisation d'une connaissance.

## Ce qui reste local ou calculé

- L'extraction des connaissances reste déterministe et calculée depuis les documents.
- La recherche locale reste un index en mémoire navigateur.
- Les context packs ne sont pas persistés.
- Les insights et synthèses continuent à consommer uniquement les connaissances `approved`.

## Limites

- Pas de migration automatique de toutes les données localStorage vers PostgreSQL.
- Pas encore de versioning documentaire complet.
- Pas encore d'audit trail serveur des validations/rejets.
- Pas encore de résolution de conflits multi-utilisateur.

## Prochaine étape naturelle

Avant Atlas IA ou agents, la prochaine étape backend utile serait :

- lecture hybride serveur pour Atlas Memory ;
- versioning des documents ;
- journal d'audit des validations/rejets ;
- migration douce localStorage vers Prisma par organisation.
