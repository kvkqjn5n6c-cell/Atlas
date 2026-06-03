# Expérience de Démonstration Atlas

La page `/demo-atlas` est une démonstration commerciale guidée. Elle ne crée pas de nouvelle capacité métier : elle met en scène les capacités existantes d'Atlas dans un récit unique, stable et compréhensible en moins de quinze minutes.

## Objectif

Montrer qu'Atlas n'est pas un simple tableau de bord. Atlas aide une PME à :

- voir les signaux métier importants ;
- comprendre les risques ;
- prioriser les sujets ;
- transformer une recommandation en plan d'action ;
- mesurer un premier impact ;
- préparer un COPIL ;
- garder une trace décisionnelle.

## Scénario

Entreprise : **Nova Services Maintenance**

Nova Services Maintenance est une PME de maintenance terrain. Elle fait face à :

- une marge qui se dégrade ;
- un coût de sous-traitance en hausse ;
- une satisfaction client en baisse ;
- des décisions dispersées ;
- un prochain COPIL à préparer.

Le scénario est volontairement stable et autonome. Il ne dépend pas du localStorage de l'utilisateur ni d'une base Prisma.

## Parcours

La démonstration suit dix étapes :

1. Présentation de Nova Services Maintenance.
2. Situation initiale.
3. Détection Atlas.
4. Priorités Atlas.
5. Recommandations Atlas.
6. Plan d'action proposé.
7. Impact observé.
8. Dashboard dirigeant.
9. Préparation COPIL.
10. Valeur globale d'Atlas.

Chaque étape contient :

- un résumé court ;
- un message dirigeant ;
- des éléments de preuve ;
- une carte métier.

## Usage commercial

Déroulé recommandé :

1. Ouvrir `/demo-atlas`.
2. Présenter le contexte Nova Services Maintenance.
3. Parcourir les étapes une à une avec le prospect.
4. Insister sur la boucle : signal, priorité, recommandation, plan, impact.
5. Copier le résumé Markdown en fin de rendez-vous si besoin.

La page doit rester moins technique que `/pilotage`. Les notions de localStorage, Prisma, mocks ou routes internes ne doivent pas porter le discours commercial.

## Limites

- La démonstration est locale/mockée.
- L'impact présenté est une corrélation observée dans le scénario, pas une causalité absolue.
- Aucun LLM, agent réel ou Atlas IA n'est utilisé.
- La page ne persiste aucune donnée.

## Message clé

Atlas aide le dirigeant à passer de données dispersées à une décision pilotable. La valeur est dans la continuité :

`signaux → priorités → recommandations → plan d'action → impact → COPIL`
