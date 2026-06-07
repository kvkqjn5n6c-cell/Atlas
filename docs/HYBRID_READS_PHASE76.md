# Phase 76 - Hybrid UI reads

## Resume executif

La Phase 76 introduit une premiere bascule controlee des lectures UI vers les services hybrides Prisma/localStorage.

Perimetre couvert :

- journal decisionnel ;
- plans d'action locaux ;
- feedback recommandations.

Les autres domaines restent inchanges : KPI, alertes, datasets, GroupBy, Atlas Memory, recommandations, priorites, COPIL et dashboard dirigeant.

## Audit prealable

| Domaine | Store localStorage | Service hybride | Actions serveur | Consommateurs UI | Lecture directe identifiee |
| --- | --- | --- | --- | --- | --- |
| Journal decisionnel | `decision-journal-store.ts` | `decision-journal.service.ts` | `decision-engine-persistence-actions.ts` | `/decision-journal`, blocs recents | `/decision-journal` lisait `getJournalEntries()` directement |
| Plans d'action locaux | `local-action-plans-store.ts` | `local-action-plans.service.ts` | `decision-engine-persistence-actions.ts` | `/action-plans`, recommandations, reports | `/action-plans` lisait `getLocalActionPlans()` directement |
| Feedback recommandations | `local-recommendation-feedback-store.ts` | `recommendation-feedback.service.ts` | `decision-engine-persistence-actions.ts` | `/pilotage`, `/reports` | transmis via le workspace KPI, hook dedie prepare |

## Hooks crees

- `useDecisionJournalWorkspace`
- `useLocalActionPlansWorkspace`
- `useRecommendationFeedbackWorkspace`

Chaque hook retourne :

- `data`
- `source`: `local`, `prisma` ou `fallback`
- `isLoading`
- `warnings`
- `reload`

## Strategie de lecture

Le premier rendu client reste stable avec une donnee vide et une source locale par defaut.

Apres montage client :

1. le hook lit d'abord le localStorage navigateur ;
2. il interroge le serveur pour connaitre `DATA_MODE` ;
3. si `DATA_MODE` n'est pas `prisma`, la lecture locale est conservee ;
4. si `DATA_MODE=prisma`, le service hybride tente Prisma ;
5. en cas d'erreur Prisma, le hook conserve les donnees locales deja chargees et expose `source=fallback`.

Cette approche evite les mismatches SSR/hydration et preserve le mode local.

## UI modifiee

### `/decision-journal`

La page utilise maintenant `useDecisionJournalWorkspace`.

Ajouts visibles :

- badge `Source locale`, `Source Prisma` ou `Fallback local` ;
- warning discret en cas de fallback.

### `/action-plans`

La section des plans locaux utilise maintenant `useLocalActionPlansWorkspace`.

Les impacts de plans restent locaux car ils ne font pas partie du perimetre Phase 76.

Ajouts visibles :

- badge de source de lecture ;
- warning discret en cas de fallback.

### Feedback recommandations

Le hook `useRecommendationFeedbackWorkspace` est disponible pour les futures integrations UI. Les blocs `/pilotage` et `/reports` continuent de recevoir le feedback via le workspace KPI afin de ne pas modifier les moteurs metier ni elargir le perimetre.

## Limites

- Les lectures UI principales de KPI, datasets, Atlas Memory, GroupBy et priorites restent locales.
- Les ecritures restent best-effort : localStorage est preserve et Prisma est tente lorsque les actions serveur sont appelees.
- En mode Prisma, les donnees serveur peuvent diverger des donnees navigateur si aucune migration localStorage vers Prisma n'a encore ete executee.
- Les hooks ne suppriment ni ne synchronisent automatiquement les donnees locales.

## Prochaines etapes

- Basculer progressivement les lectures KPI uniquement apres validation du flux Phase 76.
- Ajouter un indicateur global de source de donnees si `DATA_MODE=prisma` devient le mode de demonstration principal.
- Utiliser l'outillage Phase 75 pour migrer explicitement les donnees locales avant une lecture Prisma complete.
