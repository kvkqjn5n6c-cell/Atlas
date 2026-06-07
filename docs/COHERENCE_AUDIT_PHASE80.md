# Phase 80 - Audit de coherence Local / Prisma

## Objectif

La Phase 80 ajoute un diagnostic de coherence entre les donnees stockees dans le navigateur et les donnees persistées dans PostgreSQL/Prisma.

L'audit est volontairement non destructif :

- aucune migration automatique ;
- aucune correction automatique ;
- aucune suppression localStorage ;
- aucune ecriture Prisma.

## Domaines couverts

- plans d'action ;
- feedback recommandations ;
- journal decisionnel ;
- Atlas Memory documents ;
- Atlas Memory connaissances ;
- Prepared SQL Sources ;
- Atlas Datasets ;
- Dataset Filters ;
- Dataset KPI ;
- GroupBy Analyses ;
- GroupBy Insights.

Domaines non couverts :

- KPI moteur principal ;
- alertes ;
- dashboard ;
- COPIL.

## Fonctionnement

L'UI `/settings` construit un snapshot local en lisant les stores localStorage concernes.

Ce snapshot contient uniquement les identifiants utiles a l'audit.

L'action serveur lit ensuite Prisma en lecture seule avec des requetes `select id`.

Le moteur compare :

- nombre d'objets par domaine ;
- ids presents dans localStorage ;
- ids presents dans Prisma ;
- objets presents uniquement d'un cote.

Il ne fait pas de comparaison metier profonde.

## Statuts

| Statut | Interpretation |
| --- | --- |
| `MATCH` | Meme nombre d'objets et memes ids des deux cotes. |
| `LOCAL_ONLY` | Des objets existent localement mais aucun objet correspondant n'existe dans Prisma. |
| `PRISMA_ONLY` | Des objets existent dans Prisma mais aucun objet correspondant n'existe localement. |
| `COUNT_MISMATCH` | Les compteurs ou les ensembles d'ids divergent. |
| `CONTENT_MISMATCH` | Statut reserve aux comparaisons par empreinte simple, sans analyse profonde. |

## UI

Une section admin a ete ajoutee dans `/settings` :

`Cohérence Local / Prisma`

Elle affiche :

- score global ;
- domaines audites ;
- compteurs local/Prisma ;
- statut par domaine ;
- differences detectees ;
- export JSON du rapport.

## Export

Le rapport peut etre exporte en JSON.

Cet export ne corrige rien et ne declenche aucune migration.

## Limites

- Le snapshot local depend du navigateur courant.
- En l'absence de migration localStorage vers Prisma, des ecarts sont attendus.
- Atlas Memory documents sont lus depuis le stockage local reel, pas depuis les mocks.
- Le moteur compare surtout existence, ids et compteurs.
- Les divergences de contenu metier ne sont pas interpretees.

## Usage recommande

1. Ouvrir `/settings`.
2. Verifier que les donnees locales sont presentes.
3. Lancer `Cohérence Local / Prisma`.
4. Lire les domaines en ecart.
5. Exporter le JSON si besoin.
6. Decider manuellement s'il faut migrer, ignorer ou investiguer.

## Role futur

Ce diagnostic prepare :

- une bascule Prisma plus sure ;
- des migrations client controlees ;
- un support client plus explicable ;
- un futur outil d'administration multi-tenant.
