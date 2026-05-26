# Limites de l'import local Atlas

L'import CSV local sert à prévisualiser un fichier, préparer un mapping et tester la faisabilité d'un KPI sans persistance.

## Ce qui est analysé

- nombre de lignes lues ;
- nombre de colonnes ;
- types détectés par colonne ;
- cellules vides estimées ;
- colonnes numériques, date et texte ;
- colonnes avec valeurs manquantes ;
- taille du fichier ;
- temps de parsing ;
- indicateur de fichier volumineux.

## Ce qui est stocké

Atlas ne stocke pas le fichier complet dans le navigateur.

Le stockage local conserve uniquement :
- métadonnées de l'import ;
- mapping validé ;
- statistiques de synthèse ;
- aperçu limité à 50 lignes maximum ;
- ImportJob simulé avec `persisted: false`.

## Pourquoi limiter l'aperçu

Un export de 60 000 lignes peut être analysé localement, mais l'interface ne doit jamais tenter de rendre ou stocker toutes les lignes. Cela protège :
- les performances du navigateur ;
- la mémoire disponible ;
- la taille maximale de `localStorage` ;
- la clarté de l'expérience utilisateur.

## Limites actuelles

- Le calcul KPI local reste basé sur l'aperçu stocké, pas sur toutes les lignes.
- Excel `.xlsx` est préparé côté interface mais non parsé dans cette phase.
- Aucune donnée n'est écrite en base Prisma.
- Aucun connecteur externe n'est appelé.

## Évolution prévue

Le traitement complet devra être déplacé côté serveur avec :
- stockage d'import en base ;
- jobs asynchrones ;
- parsing robuste ;
- historisation des erreurs ;
- calcul KPI sur jeu complet ;
- purge contrôlée des données temporaires.
