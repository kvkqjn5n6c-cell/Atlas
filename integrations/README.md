# Integrations

Ce dossier contient la frontiere d'integration d'Atlas.

Le coeur metier ne doit jamais dependre directement d'une PDP, d'une banque, d'un outil comptable, d'un service mail ou d'une API externe specifique. Il depend uniquement des interfaces exposees dans `contracts/`.

## Structure

```text
integrations/
  contracts/          Interfaces TypeScript et types d'echange stables
  providers/
    mock/             Providers de demonstration sans appel reseau
  registry.ts         Point d'acces aux providers actifs
```

## Regles

- Un module metier importe un contrat ou le registre, jamais un provider concret.
- Un provider concret adapte une API externe vers les types internes.
- Les erreurs externes sont converties en `IntegrationResult`.
- Les providers recoivent toujours un `IntegrationContext` avec `organizationId`.
- Les secrets et identifiants fournisseurs devront etre charges hors du domaine metier.

## Ajouter un fournisseur

1. Creer un provider dans `providers/<vendor>/`.
2. Implementer l'interface cible, par exemple `BankProvider` ou `PdpProvider`.
3. Mapper les payloads du fournisseur vers les types de `contracts/`.
4. Enregistrer ce provider dans `registry.ts` ou dans une future resolution par configuration.

Cette approche permet de remplacer une PDP, une banque ou un service mail sans modifier les modules clients, devis, factures, paiements ou tresorerie.
