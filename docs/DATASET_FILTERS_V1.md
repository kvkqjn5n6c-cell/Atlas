# Dataset Filters V1

Phase 63 ajoute des filtres simples sur les Datasets Atlas.

Le but est de permettre la creation d'un KPI local sur un sous-ensemble metier du dataset, sans SQL live, sans ETL, sans Prisma et sans IA.

## Operateurs supportes

- `EQUALS`
- `NOT_EQUALS`
- `CONTAINS`
- `STARTS_WITH`
- `ENDS_WITH`
- `GREATER_THAN`
- `LESS_THAN`
- `IS_EMPTY`
- `IS_NOT_EMPTY`

Les comparaisons texte sont insensibles a la casse. Les comparaisons numeriques sont limitees aux champs `number`.

## Fonctionnement

Un `DatasetFilterSet` contient un ou plusieurs filtres.

Le moteur :

1. valide les champs et les operateurs ;
2. applique les filtres aux records du Dataset Atlas ;
3. retourne un nouveau dataset temporaire filtre ;
4. produit un resume : lignes totales, lignes conservees, pourcentage et warnings.

Les filtres sont combines avec une logique `AND`.

## Interaction KPI

Le generateur KPI Dataset peut recevoir un jeu de filtres.

Dans `/datasets`, l'utilisateur voit :

- Dataset total ;
- Dataset filtre ;
- lignes reellement utilisees pour le KPI.

Le KPI local genere conserve la definition des filtres dans la definition Dataset KPI stockee localement et indique les filtres dans son impact attendu.

## Stockage

Les jeux de filtres sont stockes en localStorage via `dataset-filters-store.ts`.

Ils ne sont pas persistés en Prisma.

## Limites

- pas de SQL live ;
- pas de `OR` ;
- pas de group by ;
- pas de pivot ;
- pas d'agregation avancee ;
- pas de recalcul automatique depuis la base SQL ;
- filtres appliques uniquement sur la preview deja convertie en Dataset Atlas.

## Suite possible

La prochaine evolution naturelle serait :

- filtres sauvegardes nommes ;
- selection d'un jeu de filtres existant ;
- group by simple ;
- recalcul manuel depuis source preparee ;
- persistance Prisma.
