# Atlas Connectors

## Rôle

Atlas Connectors ingère les données et documents issus des systèmes clients sans coupler le coeur métier à un fournisseur spécifique.

Les connecteurs doivent transformer des sources hétérogènes en données normalisées, traçables et rattachées à une organisation.

## Responsabilités

- Lire une source.
- Détecter les colonnes ou schémas.
- Préparer le mapping.
- Journaliser l'import.
- Signaler les erreurs.
- Transmettre les données normalisées au Business Engine.
- Respecter les permissions et l'isolation tenant.

## Phases de connecteurs

### Phase 1

- CSV
- Excel

Valeur métier : permettre aux PME de démarrer sans projet SI lourd.

Complexité : faible à moyenne, mais attention aux gros fichiers, formats incohérents et qualité de données.

### Phase 2

- SQL
- SharePoint
- OneDrive

Valeur métier : connecter les données récurrentes et documents de travail.

Complexité : moyenne à forte, avec authentification, droits, refresh tokens et volumétrie.

### Phase 3

- API métier
- ERP
- CRM

Valeur métier : automatiser le pilotage depuis les systèmes existants.

Complexité : forte, dépendante des fournisseurs, quotas, schémas et permissions.

## Entrées

- Fichiers.
- Bases de données.
- APIs.
- Documents.
- Paramètres de connexion.
- Mapping validé.

## Sorties

- ImportJob.
- Colonnes détectées.
- Mappings.
- Données normalisées.
- Statistiques d'import.
- Erreurs et alertes de qualité.

## Dépendances

- Atlas Security pour les accès.
- Atlas Multi-Tenant pour l'isolation.
- Atlas Memory pour enrichir les suggestions de mapping.
- Atlas Business Engine pour identifier les KPI alimentables.

## Règle d'architecture

Les connecteurs doivent passer par des contrats. Le coeur métier ne doit jamais importer directement un SDK fournisseur.

## Évolutions futures

- Jobs serveur.
- Files d'attente.
- Reprise sur erreur.
- Connecteurs OAuth.
- Webhooks.
- Monitoring connecteurs.
- Historique de synchronisation par organisation.
