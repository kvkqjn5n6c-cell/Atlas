# Dataset Decision Flow

## Objectif

Le flux Dataset montre comment Atlas transforme une donnee operationnelle brute en decision pilotable, sans IA, sans SQL live et sans automatisation opaque.

Flux cible :

```text
SQL
-> Source SQL preparee
-> Dataset Atlas
-> Analyse comparative Group By
-> Insight comparatif
-> Recommandation
-> Priorite
-> Plan d'action
-> Journal decisionnel
```

## Etapes

### 1. SQL

Atlas explore une connexion SQL en lecture seule. La lecture reste limitee aux schemas, tables et previews.

Visible dans :
- `/sql-connections`
- `/sql-mappings`

### 2. Source SQL preparee

Un mapping valide transforme une table SQL en source preparee. Cette source decrit les champs Atlas disponibles, la qualite du mapping et les warnings.

Visible dans :
- `/sql-mappings`
- `/data-sources`

### 3. Dataset Atlas

Atlas cree un dataset local temporaire a partir de la preview limitee. Le dataset normalise les champs et expose des statistiques de qualite.

Visible dans :
- `/datasets`
- `/data-sources`

### 4. Analyse comparative Group By

Atlas compare les groupes metier d'un dataset : par exemple cout par region, nombre d'interventions par agence ou moyenne par client.

Visible dans :
- `/datasets`

### 5. Insight comparatif

Atlas interprete deterministiquement les ecarts simples : meilleur groupe, groupe faible, concentration, dispersion ou anomalie candidate.

Visible dans :
- `/datasets`
- `/executive`
- `/pilotage`
- `/copil`

### 6. Recommandation et priorite

Les insights comparatifs peuvent alimenter des recommandations et des priorites locales. La source Dataset reste visible pour expliquer l'origine du signal.

Visible dans :
- `/pilotage`
- `/priorities`
- `/executive`
- `/copil`

### 7. Plan d'action

Une recommandation issue Dataset / Group By peut etre transformee explicitement en plan d'action local. Le plan conserve le dataset, le groupe et l'insight comparatif lies.

Visible dans :
- `/pilotage`
- `/action-plans`

### 8. Journal decisionnel

Les actions issues du flux Dataset sont tracables dans le journal decisionnel.

Evenements journalises automatiquement :

- `dataset_generated` : un Dataset Atlas est genere depuis une source SQL preparee.
- `dataset_kpi_created` : un KPI local est cree depuis un Dataset Atlas.
- `dataset_analysis` : une analyse comparative Group By est sauvegardee.
- `groupby_insight` : un insight comparatif est genere depuis une analyse Group By.
- `dataset_action_plan_created` : un plan d'action est cree depuis une recommandation Dataset / Group By.

Chaque entree conserve les liens utiles : dataset, analyse, insight, recommandation, plan, groupe concerne et metadonnees simples.

Visible dans :
- `/decision-journal`
- `/pilotage`
- `/reports`

## Ecrans strategiques

- `/executive` affiche les signaux Dataset consolides et le bloc "Decisions issues des donnees".
- `/pilotage` affiche une activite Dataset courte : datasets, analyses, insights, recommandations et plans.
- `/copil` ajoute les faits marquants issus des donnees dans le brief.
- `/demo-atlas` presente commercialement le flux SQL -> Dataset -> Analyse -> Action.
- Les context packs `executive_summary` et `copil_preparation` incluent les signaux Dataset disponibles.

## Limites

- Pas de lecture SQL massive.
- Pas d'import complet.
- Pas de Prisma pour les datasets.
- Pas de moteur statistique avance.
- Pas d'IA, de LLM, d'embeddings ou de vector store.
- Les signaux restent locaux et bases sur les donnees deja preparees.

## Prochaine etape

La prochaine evolution utile sera d'exposer des liens de navigation directs depuis chaque entree du journal vers le Dataset, l'analyse Group By ou le plan d'action concerne.
