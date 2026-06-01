# Modules historiques Atlas

## Contexte

Atlas a pivoté depuis un ancien outil de gestion d'entreprise vers un copilote décisionnel métier. Certains modules hérités restent dans le code pour éviter une suppression brutale, mais ils ne font plus partie de la navigation principale.

## Modules masqués

| Module | Route | Statut | Raison |
| --- | --- | --- | --- |
| Accueil historique | `/home` | Redirigé vers `/pilotage` | Le cockpit est le point d'entrée produit |
| Clients | `/clients` | Conservé hors navigation | Peut redevenir une dimension de pilotage, pas un CRM |
| Devis | `/quotes` | Placeholder archivé | Trop orienté gestion commerciale |
| Factures | `/invoices` | Conservé hors navigation | Utile comme source cash, pas comme module de facturation complet |
| Paiements | `/payments` | Conservé hors navigation | Utile comme signal de risque cash |
| Dépenses | `/expenses` | Placeholder archivé | À traiter comme donnée de marge ou cash |
| Projets | `/projects` | Placeholder archivé | À réintroduire seulement si utile aux KPI opérationnels |
| Tâches | `/tasks` | Placeholder archivé | Remplacé par les plans d'action de pilotage |
| Trésorerie | `/cashflow` | Conservé hors navigation | Peut rester une lecture cash, mais pas un module financier complet |
| Exports | `/exports` | Placeholder archivé | Les rapports sont le livrable prioritaire |

## Navigation cible

La navigation visible doit rester centrée sur :

- Présentation : Démo
- Pilotage : Pilotage, Indicateurs, Alertes, Plans d'action, Rapports
- Données & connaissance : Sources de données, Imports & mappings, Dictionnaire métier
- Administration : Organisations, Utilisateurs, Configuration KPI, Paramètres

## Règle de retour

Un module historique ne doit revenir dans le produit visible que s'il répond à au moins un de ces critères :

- il alimente un KPI ;
- il améliore la qualité de donnée ;
- il déclenche ou explique une alerte ;
- il nourrit une synthèse dirigeant ;
- il sert un plan d'action ou un rapport.

Atlas ne doit pas redevenir un ERP, un CRM ou un logiciel de gestion complet.
