# Dataset Pipeline View

## Role

La vue Pipeline Dataset donne une lecture synthetique de la chaine qui transforme une donnee externe en decision pilotable.

Elle ne cree aucune nouvelle donnee. Elle orchestre visuellement les objets deja disponibles en local :

```text
SQL -> Mapping -> Source preparee -> Dataset -> KPI -> Group By -> Insight -> Recommandation -> Priorite -> Plan -> Journal
```

## Etapes affichees

- Connexion SQL : connexions locales en lecture seule.
- Mapping SQL : tables mappees vers les champs Atlas.
- Source preparee : source SQL prete pour le pipeline Atlas.
- Dataset Atlas : dataset normalise issu d'une preview limitee.
- KPI Dataset : KPI local genere depuis un Dataset.
- Analyse Group By : comparaison par groupe metier.
- Insight comparatif : interpretation deterministe des ecarts.
- Recommandation : action proposee depuis un insight Dataset.
- Priorite : sujet classe dans les priorites Atlas.
- Plan d'action : plan local cree depuis la recommandation Dataset.
- Journal decisionnel : trace locale des evenements Dataset.

## Donnees utilisees

La page lit uniquement les stores locaux existants :

- connexions SQL ;
- mappings SQL ;
- sources SQL preparees ;
- Datasets Atlas ;
- KPI Dataset ;
- analyses Group By ;
- insights Group By ;
- plans d'action locaux ;
- journal decisionnel.

Les recommandations et priorites Dataset sont regenerees deterministiquement depuis les insights comparatifs existants.

## Score de completion

Le score est calcule sur les onze etapes du pipeline.

- Une etape est completee si au moins un objet correspondant existe.
- Une etape est en warning si des objets existent mais portent des avertissements.
- Une etape est disponible quand l'etape precedente existe et qu'il manque l'objet courant.
- Une etape est manquante quand la chaine n'a pas encore atteint ce niveau.

## Prochaine etape recommandee

Atlas choisit la premiere etape manquante ou disponible dans l'ordre du pipeline. Cela aide l'utilisateur a savoir ou cliquer ensuite sans automatiser l'action.

## Usage demonstration

Cette vue sert a expliquer rapidement :

- ce qui est deja connecte ;
- ce qui est transforme ;
- ce qui produit de l'analyse ;
- ce qui est deja passe en action ;
- ce qui est trace dans la memoire decisionnelle.

## Limites

- Pas de SQL live.
- Pas d'import complet.
- Pas de Prisma.
- Pas d'IA.
- Pas de creation automatique de KPI, recommandations ou plans.
- Vue agregee : elle ne reconstruit pas encore un graphe detaille table par table.
