# Boucle de feedback sur les recommandations

## Objectif

La boucle de feedback permet de qualifier les recommandations Atlas après leur génération.

Elle répond à trois questions simples :

- la recommandation était-elle pertinente ?
- l'action a-t-elle été suivie ?
- un impact métier a-t-il été observé ?

## Fonctionnement local

Le feedback est saisi dans `/pilotage`, dans la section `Recommandations Atlas`.

Pour chaque recommandation, l'utilisateur peut renseigner :

- pertinence : oui, non, à confirmer ;
- action suivie : oui, non, prévue ;
- impact observé : positif, neutre, négatif, inconnu ;
- commentaire libre.

Les données sont stockées localement dans `localStorage`.

## Lien avec les plans d'action

Si une recommandation a déjà généré un plan local, le feedback peut être relié à ce plan.

Si un impact de plan est disponible, Atlas préremplit l'impact observé quand c'est possible :

- impact positif ;
- impact neutre ;
- impact négatif ;
- inconnu.

## Tableau de bord

Le cockpit affiche une synthèse locale :

- recommandations générées ;
- feedback enregistrés ;
- taux de pertinence ;
- taux de suivi ;
- impacts positifs ;
- impacts négatifs.

Ces indicateurs sont descriptifs, pas prédictifs.

## Context packs

Les context packs peuvent inclure :

- recommandations suivies ;
- recommandations ignorées ;
- recommandations jugées non pertinentes ;
- commentaires utilisateur.

Cela prépare les futurs agents spécialisés sans activer d'IA.

## Limites

- Aucun machine learning.
- Aucun LLM.
- Aucune persistance Prisma.
- Aucun partage multi-utilisateur.
- Aucun mécanisme automatique de correction des règles.

Le feedback est une donnée métier structurée qui servira plus tard à améliorer les moteurs Atlas, mais il ne modifie pas les moteurs actuels.
