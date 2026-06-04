# Mapping SQL vers Atlas V1

## Objectif

La Phase 59 ajoute le premier moteur de mapping SQL vers Atlas.

Le but est de traduire une structure SQL en vocabulaire metier Atlas :

```text
table SQL
colonnes SQL
types SQL
↓
champs Atlas
validation
score qualite
```

Cette phase ne lance aucun import, ne cree aucun KPI et n'ecrit jamais dans la base SQL.

## Architecture

Fichiers principaux :

```text
src/lib/connectors/sql/
├── atlas-field-catalog.ts
├── sql-mapping-types.ts
└── sql-mapping-engine.ts

src/lib/local/
└── sql-mappings-store.ts

src/components/sql-mappings/
└── sql-mappings-page.tsx

src/app/(app)/sql-mappings/
└── page.tsx
```

## Catalogue Atlas V1

Premier catalogue :

- Entreprise
- Client
- Projet
- Mission
- Date
- Region
- Agence
- Montant
- Cout
- Quantite
- Statut
- Utilisateur
- Intervention
- Reference
- Produit
- Categorie

Le catalogue est volontairement simple. Il prepare une future extension vers :

- champs personnalises ;
- dictionnaire metier ;
- gouvernance des mappings ;
- ingestion SQL controlee.

## Suggestions deterministes

Le moteur `suggestSqlMappings()` utilise uniquement le nom des colonnes.

Exemples :

| Colonne SQL | Champ Atlas suggere |
| --- | --- |
| `date` | Date |
| `date_realisation` | Date |
| `created_at` | Date |
| `cout_sous_traitance` | Cout |
| `cost` | Cout |
| `amount` | Montant |
| `montant_ht` | Montant |
| `region` | Region |
| `client_name` | Client |
| `statut` | Statut |

Aucune IA, aucun LLM, aucune interpretation opaque.

## Validation

`validateMapping()` detecte :

- colonnes actives non mappees ;
- colonnes ignorees ;
- doublons de champ Atlas ;
- champs obligatoires manquants ;
- conflits simples.

Le retour contient :

- `valid`
- `qualityScore`
- `warnings`
- `errors`
- `mappedColumnCount`
- `unmappedColumnCount`
- `duplicateTargetFields`
- `missingRequiredFields`

## Score qualite

Le score part de 100 et applique des penalites simples :

- warning ;
- champ obligatoire manquant ;
- doublon ;
- colonne non mappee.

Le score est borne entre 0 et 100.

## Stockage

Les mappings SQL sont stockes localement :

`atlas-sql-mappings-v1`

Aucune persistance Prisma pour cette phase.

## Interface

Route :

`/sql-mappings`

Fonctionnalites :

- choisir une connexion SQL locale ;
- lire un schema mock stable ;
- choisir une table ou une vue ;
- generer un mapping suggere ;
- modifier chaque champ cible ;
- activer/desactiver une colonne ;
- voir score, warnings et errors ;
- sauvegarder le mapping localement.

## Integration

Liens ajoutes :

- navigation Donnees & connaissance -> Mapping SQL ;
- `/data-sources` -> Mapper une table SQL ;
- `/sql-connections` -> Mapper cette table.

## Limites V1

Hors perimetre :

- import automatique ;
- KPI automatique ;
- ETL ;
- ecriture SQL ;
- synchronisation serveur ;
- Prisma ;
- IA ;
- connecteurs SharePoint/API.

Le mapping V1 prepare seulement la future ingestion.

## Tests

Tests ajoutes :

`tests/connectors/sql-mapping-engine.test.ts`

Couverture :

- creation mapping ;
- suggestions ;
- score qualite ;
- doublons ;
- champs obligatoires ;
- mise a jour de colonne.

## Prochaine etape utile

La prochaine evolution naturelle serait :

1. connecter mapping SQL et dictionnaire metier ;
2. permettre un import echantillon local depuis la table mappee ;
3. preparer une ingestion serveur controlee ;
4. journaliser les mappings SQL par organisation.
