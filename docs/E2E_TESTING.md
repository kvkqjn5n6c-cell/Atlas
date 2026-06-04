# Tests E2E Atlas

## Objectif

La Phase 57 ajoute une premiere couverture E2E des parcours de demonstration Atlas.

Ces tests ne cherchent pas a couvrir toute l'application. Ils protegent les parcours qui permettent de vendre et demontrer Atlas :

- demo guidee ;
- dashboard dirigeant ;
- Atlas Memory ;
- recommandation vers plan d'action ;
- priorites et COPIL.

## Commandes

Lancer les tests E2E :

```bash
npm.cmd run test:e2e
```

Lancer l'interface Playwright :

```bash
npm.cmd run test:e2e:ui
```

Playwright demarre automatiquement Next avec :

```bash
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Si un serveur existe deja sur `http://localhost:3000`, il est reutilise en local.

## Structure

```text
tests/e2e/
├── atlas-memory.spec.ts
├── demo-atlas.spec.ts
├── executive-dashboard.spec.ts
├── priorities-copil.spec.ts
├── recommendation-to-action-plan.spec.ts
└── fixtures/
    └── local-storage.ts
```

## Donnees de test

Les tests utilisent un contexte navigateur isole.

La fixture `seedCriticalCostKpi` injecte dans `localStorage` :

- un KPI local critique : `Somme coût sous-traitance` ;
- un resultat KPI critique ;
- deux points d'historique ;
- une regle d'alerte critique.

Cela permet de stabiliser les pages qui dependent des donnees locales sans utiliser de donnees reelles de navigateur.

## Parcours couverts

### `/demo-atlas`

Verifie :

- chargement du scenario Nova Services Maintenance ;
- navigation etape suivante / precedente ;
- acces a l'etape finale ;
- presence du bouton de copie du resume.

### `/executive`

Verifie :

- chargement du dashboard dirigeant ;
- affichage de la lecture executive ;
- affichage du score et des sections de priorites / recommandations.

### `/atlas-memory`

Verifie :

- documents memoire visibles ;
- edition d'un document ;
- sauvegarde locale ;
- validation d'une connaissance ;
- recherche locale simple.

### `/pilotage` vers `/action-plans`

Verifie :

- presence d'une recommandation Atlas ;
- creation d'un plan d'action local ;
- visibilite du plan dans `/action-plans`.

### `/priorities` et `/copil`

Verifie :

- chargement du centre de priorites ;
- presence d'un top priorites ou d'un signal local ;
- chargement du brief COPIL ;
- presence du bouton de copie du brief.

## Difference avec les tests unitaires

Les tests unitaires et d'integration Vitest protegent les moteurs :

- KPI ;
- alertes ;
- regles ;
- insights ;
- synthese ;
- recommandations ;
- priorites ;
- COPIL ;
- dashboard.

Les tests E2E protegent l'experience utilisateur reelle :

- rendu des pages ;
- navigation ;
- localStorage navigateur ;
- enchainement recommandation -> plan ;
- robustesse des pages de demonstration.

## Limites

- Les tests restent volontiers courts.
- Ils ne testent pas le presse-papiers pour eviter les variations navigateur.
- Ils ne couvrent pas les imports CSV complets : ce parcours merite une fixture dediee plus tard.
- Ils ne valident pas Prisma ni PostgreSQL.
- Ils n'ont pas vocation a remplacer les tests moteurs existants.

## Prochaine extension utile

Ajouter un E2E d'import CSV minimal :

1. charger un petit fichier CSV ;
2. valider le mapping ;
3. creer un KPI ;
4. verifier son apparition dans `/pilotage`.

Ce test demandera une fixture fichier stable et plus de temps d'execution.
