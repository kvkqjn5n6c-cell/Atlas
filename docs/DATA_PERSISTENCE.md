# Atlas - Persistance progressive

## Mode de donnees

Atlas utilise une configuration volontairement simple :

```text
DATA_MODE=mock | prisma
```

Le mode par defaut est `mock`. Si `DATA_MODE` est absent, invalide ou vide, l'application continue d'utiliser les donnees mockees.

## Pourquoi mock par defaut

Les interfaces Atlas valident encore le produit, les flux metier et l'experience admin/client. Le mode mock evite de rendre l'application dependante d'une base locale pendant cette phase.

La persistance Prisma est introduite progressivement via `src/lib/repositories/`.

## Mode Prisma

`DATA_MODE=prisma` active les lectures Prisma dans les repositories compatibles. Si Prisma echoue, le repository revient aux mocks et affiche un `console.warn` explicite.

Repositories compatibles Prisma dans cette phase :

- `organizations.repository.ts`
- `data-sources.repository.ts`
- `kpi.repository.ts`

Fonctions prioritaires compatibles :

- `getOrganizations()`
- `getOrganizationById(id)`
- `getDataSources()`
- `getDataSourceById(id)`
- `getDataSourcesByOrganization(organizationId)`
- `getKpiConfigurationsByOrganization(organizationId)`
- `getKpiResultsByOrganization(organizationId)`

## Seed Atlas

Le seed Prisma a ete refondu pour le modele Atlas :

```bash
npm run prisma:generate
npm run prisma:seed
```

Il cree :

- organisations ;
- utilisateurs ;
- liens `OrganizationUser` ;
- sources de donnees ;
- imports ;
- mappings ;
- configurations KPI ;
- resultats KPI ;
- alertes ;
- plans d'action ;
- rapports.

Le seed nettoie les donnees Atlas avant recreation afin d'eviter les doublons locaux.

## Limites actuelles

- Le mode mock reste le mode principal de l'interface.
- Les composants existants ne sont pas tous async, donc la bascule UI complete n'est pas faite.
- Aucun connecteur externe n'est active.
- Aucun upload reel n'est active.
- Atlas IA n'est pas branche.
- Les autres repositories resteront mockes jusqu'aux prochaines phases.
