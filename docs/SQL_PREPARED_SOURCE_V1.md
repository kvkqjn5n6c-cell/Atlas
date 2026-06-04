# SQL Prepared Source V1

Phase 60 transforme un mapping SQL valide en source SQL preparee, exploitable plus tard par le pipeline Atlas.

Cette phase ne fait pas d'import, ne cree pas de KPI et n'ecrit jamais dans la base SQL externe.

## Role

Une source SQL preparee est un snapshot local qui decrit :

- la connexion SQL cible ;
- la table ou vue selectionnee ;
- le mapping SQL vers les champs Atlas ;
- les colonnes activees ;
- le score de qualite du mapping ;
- les champs Atlas disponibles ;
- un apercu limite des donnees.

Elle sert de couche intermediaire entre l'exploration SQL et une future ingestion Atlas.

## Difference avec une connexion SQL

Une connexion SQL contient uniquement les parametres de connexion.

Une source SQL preparee indique ce qu'Atlas peut comprendre dans une table precise.

## Difference avec un mapping SQL

Un mapping SQL traduit les colonnes vers le vocabulaire Atlas.

Une source SQL preparee fige ce mapping avec :

- le score de qualite ;
- les champs disponibles ;
- les warnings ;
- la preview limitee.

## Difference avec un import

Un import cree une donnee exploitee par Atlas.

Une source SQL preparee ne lit pas toute la table et ne produit aucun KPI. Elle reste une preparation pour pipeline futur.

## Validation

La source reprend la validation du mapping :

- champs obligatoires manquants ;
- doublons ;
- colonnes ignorees ;
- colonnes actives non mappees.

Elle ajoute des warnings si les champs cles du pipeline ne sont pas disponibles.

## Stockage

Le stockage est localStorage uniquement via `sql-prepared-sources-store.ts`.

Prisma n'est pas utilise pour cette phase.

## Interface

- `/sql-mappings` permet de preparer une source depuis un mapping exploitable.
- `/data-sources` affiche les sources SQL preparees dans une section dediee.

Le CTA "Utiliser dans le pipeline Atlas" reste volontairement desactive et marque Phase suivante.

## Limites

- pas d'ingestion ;
- pas de scheduling ;
- pas de KPI automatique ;
- pas d'ecriture SQL ;
- preview limitee a 100 lignes ;
- stockage local navigateur.

## Phase suivante

La Phase 61 pourra connecter une source SQL preparee au pipeline Atlas en lecture controlee, probablement sous forme de preview transformee ou d'import limite.
