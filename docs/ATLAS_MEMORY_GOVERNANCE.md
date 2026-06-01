# Atlas Memory Governance

Atlas Memory Governance ajoute une validation humaine simple entre la détection de connaissances et leur utilisation par le moteur métier.

## Pourquoi

Depuis Atlas Memory V1, Atlas sait détecter :

- objectifs ;
- règles métier ;
- décisions ;
- entrées de glossaire.

Une connaissance détectée n'est pas forcément fiable. Elle peut provenir d'un brouillon, d'une formulation ambiguë ou d'un document dépassé. Atlas ne doit donc pas l'utiliser automatiquement pour influencer les insights ou la synthèse dirigeant.

## Statuts

Chaque connaissance possède un statut :

- `detected` : détectée automatiquement, en attente de validation ;
- `approved` : validée par un humain, utilisable par le moteur métier ;
- `rejected` : rejetée, ignorée par le moteur métier.

## Cycle de vie

1. Atlas lit les documents mémoire.
2. Le moteur extrait des connaissances candidates.
3. L'interface affiche les connaissances détectées.
4. Un utilisateur peut valider, rejeter ou réinitialiser chaque connaissance.
5. Le statut est conservé localement dans `localStorage`.
6. Le moteur métier ne reçoit que les connaissances validées.

## Utilisation par le moteur métier

Les insights, risques et synthèses dirigeant utilisent uniquement les connaissances avec `status = approved`.

Les connaissances simplement détectées ou rejetées ne peuvent pas enrichir :

- les insights ;
- les recommandations ;
- la synthèse dirigeant ;
- les notes mémoire affichées dans les rapports.

## Limites actuelles

Cette première version reste volontairement simple :

- stockage local navigateur uniquement ;
- pas de workflow d'approbation avancé ;
- pas de rôle utilisateur dédié ;
- pas d'audit trail complet ;
- pas de persistance Prisma ;
- pas d'IA générative.

## Évolutions futures

La gouvernance pourra ensuite évoluer vers :

- une persistance multi-tenant ;
- un historique de validation ;
- des rôles d'approbation ;
- un versioning des documents mémoire ;
- des agents spécialisés consommant uniquement la mémoire validée ;
- une couche Atlas IA contrainte par les connaissances approuvées.
