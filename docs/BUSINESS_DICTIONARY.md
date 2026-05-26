# Dictionnaire métier Atlas

Le dictionnaire métier mémorise le vocabulaire propre à chaque organisation : champs personnalisés, colonnes sources, usages KPI et synonymes observés dans les imports.

## Objectif

Atlas ne force pas toutes les PME à utiliser le même modèle rigide. Un champ comme `cout_sous_traitance` peut devenir le champ métier “Coût sous-traitance”, être réutilisé dans les imports suivants et alimenter des KPI locaux ou persistants.

## Fonctionnement local

En mode `DATA_MODE=mock`, le dictionnaire reste disponible via `localStorage`.

Il conserve :
- le nom métier ;
- les colonnes sources connues ;
- le type détecté ;
- le nombre d’utilisations ;
- les KPI locaux liés ;
- quelques exemples et tags.

## Fonctionnement Prisma

En mode `DATA_MODE=prisma`, Atlas utilise les modèles :
- `BusinessDictionaryField` ;
- `BusinessDictionarySourceColumn` ;
- `BusinessDictionaryLinkedKpi`.

Le dictionnaire est alors partagé par `organizationId`, avec index sur l’organisation, le libellé normalisé et les colonnes sources.

## Fallback

Si Prisma est indisponible, Atlas garde l’interface stable et bascule sur le comportement local/mock. L’UI affiche un badge technique :
- `Local` ;
- `Prisma` ;
- `Fallback local`.

## Reconnaissance

La suggestion reste déterministe :
1. règles Atlas standards ;
2. dictionnaire métier de l’organisation ;
3. score de similarité sur colonnes sources et libellés normalisés.

Aucun LLM ni Atlas IA n’est utilisé dans cette phase.

## Évolutions prévues

Le dictionnaire prépare :
- la gouvernance des champs métier ;
- la configuration KPI persistante ;
- la réutilisation multi-utilisateur ;
- la future lecture par Atlas IA, sans l’activer maintenant.
