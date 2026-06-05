# Dataset KPI V1

Phase 62 permet de creer explicitement un KPI local Atlas depuis un Dataset Atlas temporaire.

Cette phase ne genere aucun KPI automatiquement. L'utilisateur choisit le dataset, le type de calcul et le champ.

## Architecture

Flux :

Dataset Atlas
-> Definition KPI dataset
-> Preview KPI
-> Conversion en KPI local Atlas
-> Stores KPI locaux existants
-> Pilotage, alertes, priorites, dashboard

Le moteur reutilise les structures existantes :

- `LocalKpiConfiguration`
- `LocalKpiResult`
- `LocalKpiHistoryPoint`

## Types supportes

V1 supporte uniquement :

- `COUNT` : nombre de lignes du dataset ;
- `SUM` : somme d'un champ numerique ;
- `AVERAGE` : moyenne d'un champ numerique ;
- `RATIO` : somme champ A / somme champ B.

## Validation

Le moteur verifie :

- nom KPI obligatoire ;
- dataset correspondant ;
- presence de records ;
- champ principal requis sauf COUNT ;
- champ numerique pour SUM et AVERAGE ;
- deux champs numeriques pour RATIO.

## Integration Atlas

Quand un KPI est genere :

- sa configuration est sauvegardee dans le store KPI local ;
- son resultat est calcule et sauvegarde ;
- un point historique est ajoute ;
- les pages qui lisent les KPI locaux peuvent le reutiliser.

Le KPI garde comme source le nom du Dataset Atlas. Il ne se fait pas passer pour un import CSV.

Depuis la Phase 63, un KPI peut aussi etre calcule sur un Dataset Atlas filtre. Le generateur affiche alors :

- le nombre de lignes du dataset total ;
- le nombre de lignes du dataset filtre ;
- le nombre de lignes reellement utilisees dans le calcul.

Les filtres utilises sont conserves dans la definition Dataset KPI locale.

## Limites

- calcul sur preview uniquement ;
- pas de KPI automatique ;
- pas de Prisma ;
- pas d'IA ;
- pas de filtre avance ;
- pas de group by ;
- pas de recalcul SQL live.

## Suite logique

La suite pourra ajouter :

- filtres simples ;
- group by ;
- seuils configurables avant generation ;
- recalcul depuis source preparee ;
- persistance Prisma des datasets et KPI dataset.
