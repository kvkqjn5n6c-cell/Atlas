# Atlas Memory Search

Atlas Memory Search ajoute une recherche locale déterministe dans les documents et connaissances de la mémoire Atlas.

## Objectif

La recherche permet de retrouver rapidement :

- un document mémoire ;
- un objectif ;
- une règle métier ;
- une décision ;
- une définition de glossaire ;
- une connaissance détectée, validée ou rejetée.

## Fonctionnement

Le moteur construit un index local à partir :

- des documents Markdown simulés ;
- des connaissances extraites et gouvernées.

La recherche est :

- insensible à la casse ;
- normalisée pour les accents ;
- basée sur des occurrences de termes ;
- enrichie par un bonus quand le titre correspond ;
- enrichie par un bonus quand la connaissance est validée.

Chaque résultat affiche :

- le type de résultat ;
- la source documentaire ;
- le statut si c'est une connaissance ;
- un score simple ;
- les termes trouvés ;
- un extrait.

## Filtres

Les scopes disponibles sont :

- tout ;
- documents ;
- connaissances ;
- validées ;
- détectées ;
- rejetées.

Les connaissances rejetées peuvent être recherchées pour audit, mais elles ne sont pas utilisées par le moteur métier.

## Différence avec une recherche vectorielle

Cette V1 n'utilise pas :

- embeddings ;
- vector store ;
- LLM ;
- recherche sémantique.

Elle est volontairement simple, explicable et locale.

## Rôle futur

Cette recherche prépare :

- les agents spécialisés ;
- la navigation dans Atlas Memory ;
- la gouvernance de connaissance ;
- une future recherche hybride déterministe + sémantique, lorsque la persistance et les règles de sécurité seront stabilisées.
