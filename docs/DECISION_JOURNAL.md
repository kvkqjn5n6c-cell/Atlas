# Journal décisionnel Atlas

Le journal décisionnel est la première mémoire locale des décisions Atlas. Il trace les événements qui permettent de reconstituer le cycle :

KPI -> alerte -> recommandation -> plan d'action -> impact -> feedback -> connaissance mémoire.

## Rôle

Le journal sert à répondre à quatre questions :

- Qu'est-ce qu'Atlas a recommandé ?
- Qu'est-ce qui a été transformé en action ?
- Quel impact a été observé ?
- Quelles connaissances mémoire ont été validées ou rejetées ?

## Alimentation

Le journal est alimenté localement lors de ces événements :

- création d'une recommandation déterministe ;
- calcul d'un score de confiance ;
- création d'un plan d'action depuis une recommandation ;
- mise à jour d'un plan d'action ;
- mesure d'impact d'un plan ;
- enregistrement d'un feedback sur une recommandation ;
- validation ou rejet d'une connaissance Atlas Memory ;
- generation d'un Dataset Atlas depuis une source SQL preparee ;
- creation d'un KPI local depuis un Dataset Atlas ;
- sauvegarde d'une analyse comparative Group By ;
- generation d'un insight comparatif ;
- creation d'un plan d'action depuis une recommandation Dataset / Group By.

Chaque événement contient une date, un type, une source, des liens vers les KPI, recommandations, plans d'action ou références mémoire concernées, et des métadonnées simples.

## Stockage

Phase 46 reste locale :

- stockage dans `localStorage` ;
- aucune écriture Prisma ;
- aucun serveur ;
- aucun moteur IA.

Le store `src/lib/local/decision-journal-store.ts` protège les accès SSR, gère les erreurs JSON et trie les entrées par date décroissante.

## Interface

La route `/decision-journal` affiche :

- une chronologie descendante ;
- des filtres par type, priorité et période ;
- les liens techniques utiles vers KPI, recommandations, plans et mémoire ;
- une suppression locale d'entrée si nécessaire.

Le cockpit affiche les 5 derniers événements dans “Activité Atlas récente”.
Les rapports affichent “Historique décisionnel récent”.

## Evenements Dataset

La chaine Dataset ajoute cinq types d'evenements :

- `dataset_generated` : badge "Dataset genere".
- `dataset_kpi_created` : badge "KPI Dataset".
- `dataset_analysis` : badge "Analyse Dataset".
- `groupby_insight` : badge "Insight comparatif".
- `dataset_action_plan_created` : badge "Plan Dataset".

Ces evenements apparaissent dans `/decision-journal`, dans l'activite recente du cockpit et dans l'historique decisionnel des rapports. Ils permettent de retracer :

```text
Dataset -> Group By -> Insight -> Recommandation -> Plan
```

La deduplication locale repose sur l'identifiant d'evenement. Par exemple, regenerer le meme Dataset depuis la meme source preparee remplace l'entree `dataset_generated` existante au lieu d'ajouter un doublon.

## Context packs

Les context packs suivants peuvent inclure `decisionHistory` :

- `executive_summary` ;
- `copil_preparation` ;
- `operational_recommendations`.

Cela prépare les futurs agents spécialisés sans appeler d'IA ni de LLM.

## Limites

- Le journal est lié au navigateur.
- Il n'est pas partagé entre utilisateurs.
- Les événements sont best effort : si le stockage local échoue, l'interface reste stable.
- La déduplication repose sur des identifiants déterministes pour éviter les doublons lors des recalculs.

## Évolution future

Les prochaines étapes seront :

- persistance Prisma par organisation ;
- journal d'audit serveur ;
- liens explicites vers objets persistés ;
- restitution dans Atlas Memory ;
- usage par les agents et recommandations futures.
