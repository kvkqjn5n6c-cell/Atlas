# Atlas Memory Engine

Atlas Memory Engine transforme les documents mémoire d'une organisation en contexte métier structuré exploitable par le moteur Atlas.

Il ne s'agit pas d'IA générative. La lecture reste déterministe, explicable et limitée à des règles simples.

## Rôle

Le moteur extrait des éléments depuis Atlas Memory :

- objectifs stratégiques ;
- règles métier ;
- décisions historiques ;
- entrées de glossaire ;
- avertissements lorsque la mémoire est incomplète.

Ce contexte enrichit ensuite :

- les insights locaux ;
- les risques ;
- les recommandations ;
- la synthèse dirigeant.

## Documents lus

Les documents utilisés en V1 sont :

- `strategie.md` ;
- `objectifs.md` ;
- `regles_metier.md` ;
- `historique_decisions.md` ;
- `glossaire.md`.

Les autres documents restent consultables dans Atlas Memory, mais ne sont pas encore utilisés directement par le moteur.

## Extraction

Le parsing reste volontairement simple :

- lignes de liste Markdown ;
- lignes commençant par `Objectif:` ;
- lignes commençant par `Règle:` ;
- lignes commençant par `Décision:` ;
- lignes de glossaire au format `Terme : définition`.

Atlas n'analyse pas encore tout le Markdown, ne raisonne pas sur du texte libre complexe et ne fait aucun appel LLM.

## Enrichissement métier

Le moteur compare les connaissances détectées avec les KPI locaux grâce à des familles de mots-clés déterministes :

- sous-traitance, coût, fournisseur ;
- marge, rentabilité ;
- satisfaction, qualité ;
- retard, délai, intervention ;
- cash, trésorerie ;
- productivité, dossiers, charge.

Exemple :

Si Atlas Memory contient un objectif de réduction de la sous-traitance et qu'un KPI `Coût sous-traitance` devient critique, Atlas peut générer un insight indiquant que ce KPI est en contradiction possible avec l'objectif déclaré.

Chaque insight enrichi indique ses sources mémoire, par exemple `strategie.md` ou `regles_metier.md`.

## Limites

Cette V1 reste volontairement bornée :

- pas de parser Markdown avancé ;
- pas de recherche sémantique ;
- pas de vectorisation ;
- pas d'agent ;
- pas d'IA générative ;
- pas de persistance Prisma dédiée.

Les faux positifs restent possibles si des mots-clés se recoupent trop largement.

## Évolutions prévues

Les prochaines étapes pourront ajouter :

- une mémoire persistée par organisation ;
- un versioning des documents mémoire ;
- une validation humaine des connaissances détectées ;
- des agents spécialisés capables de consommer ce contexte ;
- une couche Atlas IA encadrée, qui utilisera la mémoire structurée sans remplacer le moteur métier déterministe.
