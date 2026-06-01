# Atlas Roadmap cible

## Phase actuelle

Atlas dispose d'un prototype avancé :

- cockpit ;
- imports CSV locaux ;
- mapping ;
- dictionnaire métier ;
- KPI locaux ;
- règles d'alerte ;
- alertes dynamiques ;
- insights déterministes ;
- synthèse dirigeant ;
- Prisma-ready partiel.

Limite : la valeur produit est démontrable, mais la persistance et la gouvernance ne sont pas encore consolidées.

## Étape 1 - Consolidation

Objectif : stabiliser le socle existant.

- Nettoyer les libellés et l'encodage.
- Centraliser les accès localStorage dans des services.
- Ajouter tests moteurs KPI, règles, insights, synthèses.
- Clarifier modes mock, local et Prisma.
- Réduire les restes ERP.

## Étape 2 - Persistance réelle

Objectif : sortir progressivement du navigateur.

- Migration Prisma initiale complète.
- Persister organisations, sources, imports, mappings.
- Persister dictionnaire métier.
- Persister KPI, résultats, historique, règles.
- Brancher les pages via services/repositories.
- Garder les mocks comme fixtures de démo.

## Étape 3 - Mémoire Atlas

Objectif : créer la mémoire structurée par organisation.

- Modèle de mémoire.
- Versioning.
- Validation humaine.
- Historique de décisions.
- Glossaire métier.
- Liens entre mémoire, KPI, règles et rapports.

## Étape 4 - Connecteurs

Objectif : alimenter Atlas depuis les systèmes clients.

- CSV/Excel robuste côté serveur.
- SQL en lecture seule.
- SharePoint/OneDrive.
- APIs métier.
- ERP/CRM.
- Monitoring des imports.

## Étape 5 - Agents

Objectif : spécialiser les analyses.

- Agent KPI.
- Agent Risques.
- Agent COPIL.
- Agent Synthèse dirigeant.
- Agent Recommandations.
- Agent Commercial.
- Agent Compétences.

## Étape 6 - Atlas AI Layer

Objectif : enrichir les analyses avec l'IA générative, sans remplacer le moteur métier.

- RAG borné par tenant.
- Citations des sources.
- Génération de synthèses.
- Propositions de plans d'action.
- Contrôle humain.
- Journal des prompts et sorties.

## Étape 7 - SaaS complet

Objectif : industrialiser.

- Auth réelle.
- Multi-tenant robuste.
- Audit log.
- Paiement et abonnement si nécessaire.
- Monitoring.
- Gestion des quotas.
- RGPD.
- Support client.

## Priorité stratégique

La prochaine priorité n'est pas d'ajouter de nouveaux écrans. Elle est de consolider la donnée, la mémoire et le moteur métier afin que les agents et l'IA reposent sur un socle fiable.
