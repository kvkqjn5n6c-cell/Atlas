# Atlas Memory V1

## Objectif

Atlas Memory V1 pose une première mémoire métier structurée par organisation. Elle reste locale et mockée, mais prépare la future exploitation par le moteur métier, les agents spécialisés et Atlas IA.

Cette phase ne crée ni chatbot, ni LLM, ni persistance Prisma.

## Structure documentaire

La mémoire est simulée avec des documents Markdown :

- `entreprise.md`
- `strategie.md`
- `objectifs.md`
- `processus.md`
- `regles_metier.md`
- `glossaire.md`
- `clients.md`
- `fournisseurs.md`
- `historique_decisions.md`
- `offres.md`
- `kpi.md`
- `equipe.md`

Chaque document contient :

- une clé stable ;
- un titre lisible ;
- une description ;
- un contenu Markdown ;
- une organisation ;
- une source `mock` ou `local` ;
- `persisted: false`.

## Stockage

Le store local `src/lib/local/atlas-memory-store.ts` utilise `localStorage`.

Il protège le rendu serveur :

- aucune lecture `window` côté SSR ;
- fallback sur les mocks ;
- sauvegarde locale uniquement ;
- réinitialisation possible depuis le mock.

## Route

La page `/atlas-memory` permet de :

- lister les documents mémoire ;
- ouvrir un document ;
- modifier son contenu ;
- sauvegarder localement ;
- réinitialiser depuis le modèle ;
- voir le lien conceptuel avec Atlas Core, Business Engine, connecteurs et agents futurs.

## Limites

- Pas de persistance Prisma.
- Pas de versioning réel.
- Pas de gestion multi-utilisateur.
- Pas d'indexation sémantique.
- Pas d'Atlas IA.
- Pas de contrôle de conflit entre utilisateurs.

## Prochaines étapes

1. Créer un modèle Prisma `AtlasMemoryDocument`.
2. Ajouter un versioning léger.
3. Relier la mémoire aux KPI, règles et recommandations.
4. Ajouter une gouvernance par rôle.
5. Préparer l'exploitation future par agents spécialisés.
