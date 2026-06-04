# Connecteur SQL Atlas V1

## Objectif

La Phase 58 introduit la premiere architecture de connecteur SQL Atlas.

Le but n'est pas de construire un ETL, ni de creer automatiquement des KPI. Le connecteur V1 sert uniquement a explorer une source SQL externe en lecture seule :

- tester une connexion ;
- lire le schema ;
- afficher tables, vues et colonnes ;
- previsualiser au maximum 100 lignes.

## Providers V1

Providers prevus :

- PostgreSQL ;
- SQL Server.

Extensions futures prevues :

- MySQL ;
- Oracle ;
- autres connecteurs SI.

## Architecture

Fichiers principaux :

```text
src/lib/connectors/sql/
├── sql-types.ts
├── sql-connector.ts
├── sql-test-connection.ts
├── sql-schema-reader.ts
├── sql-preview-reader.ts
├── sql-driver-connector.ts
└── sql-mock-connector.ts
```

Role des fichiers :

- `sql-types.ts` : contrats du connecteur.
- `sql-connector.ts` : validation et normalisation de configuration.
- `sql-test-connection.ts` : test connexion + fermeture.
- `sql-schema-reader.ts` : lecture `information_schema`.
- `sql-preview-reader.ts` : apercu donnees limite.
- `sql-driver-connector.ts` : connecteur driver optionnel.
- `sql-mock-connector.ts` : connecteur mock stable pour UI et tests.

## Interface

Route :

`/sql-connections`

Fonctionnalites :

- creer une configuration SQL locale ;
- sauvegarder la configuration en `localStorage` ;
- tester une connexion simulee ;
- lire un schema simule ;
- afficher tables et vues ;
- previsualiser une table.

Un lien est aussi disponible depuis `/data-sources`.

## Stockage

Phase 58 utilise uniquement `localStorage` :

`atlas-sql-connections-v1`

Important : les mots de passe sont stockes localement en clair pour demonstration uniquement.

Ne pas utiliser avec des secrets reels.

## Securite

Garanties V1 :

- aucune ecriture SQL ;
- aucune requete d'UPDATE, INSERT, DELETE ou DDL ;
- preview bornee a 100 lignes ;
- aucun mapping automatique ;
- aucune creation de KPI automatique ;
- aucune persistance Prisma.

Limites V1 :

- pas de chiffrement des secrets ;
- pas de coffre de secrets ;
- pas de RBAC serveur ;
- pas de journal d'audit connecteur ;
- pas de validation sur base reelle dans cette phase ;
- pas de streaming ou pagination avancee.

## Lecture schema

La lecture schema cible :

- tables ;
- vues ;
- colonnes ;
- types ;
- nullabilite ;
- ordre des colonnes.

PostgreSQL et SQL Server passent par `information_schema`.

## Preview donnees

Limite stricte :

- PostgreSQL : `LIMIT 100`
- SQL Server : `SELECT TOP (100)`

Le connecteur refuse les identifiants SQL complexes dans les fonctions driver afin d'eviter les injections via noms de table/schema.

## Tests

Les tests Phase 58 sont mockes et ne necessitent aucune base SQL :

```bash
npm.cmd run test
```

Couverture :

- validation configuration ;
- connexion mock ;
- schema mock ;
- preview mock limitee.

## Roadmap V2

Prochaines evolutions utiles :

1. Executer les operations SQL via server actions ou route handlers exclusivement cote serveur.
2. Installer et valider les drivers reels en environnement controle.
3. Ajouter un coffre de secrets ou une integration environnement securisee.
4. Ajouter un audit trail des tests de connexion et lectures schema.
5. Ajouter un mapping manuel depuis une table SQL vers un import Atlas.
6. Ajouter pagination et echantillonnage robuste.

## Positionnement

Le connecteur SQL V1 est une brique d'exploration.

Il prepare Atlas a sortir progressivement du tout local/mock, mais il ne remplace pas encore le pipeline d'import ni le moteur KPI existant.
