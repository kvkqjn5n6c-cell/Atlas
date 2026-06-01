# Atlas Security

## Rôle

Atlas Security protège les données, la mémoire, les agents, les recommandations et les actions des organisations clientes.

La sécurité doit être pensée comme une couche transverse : aucun module ne doit contourner les permissions.

## Responsabilités

- Authentification.
- Autorisation.
- Gestion des rôles.
- Isolation des données.
- Audit des actions.
- Traçabilité des recommandations.
- Gestion RGPD.
- Protection des connecteurs et secrets.

## Rôles cibles

- SUPER_ADMIN : administration globale Atlas.
- CONSULTANT : accompagnement multi-organisations autorisées.
- CLIENT_ADMIN : gestion d'une organisation cliente.
- CLIENT_USER : consultation et participation limitée.

## Permissions principales

- voir les organisations ;
- gérer les utilisateurs ;
- gérer les sources ;
- configurer les KPI ;
- modifier les objectifs ;
- consulter le pilotage ;
- consulter les rapports ;
- gérer les plans d'action ;
- valider la mémoire ;
- exécuter ou valider un agent.

## Audit

Les événements sensibles doivent être journalisés :

- connexion ;
- changement de rôle ;
- import ;
- mapping ;
- configuration KPI ;
- changement de seuil ;
- règle d'alerte ;
- génération de rapport ;
- recommandation validée ;
- action créée ou clôturée.

## RGPD

Atlas doit prévoir :

- conservation limitée ;
- suppression sur demande ;
- export des données ;
- traçabilité des traitements ;
- minimisation des données personnelles ;
- séparation des données opérationnelles et de la mémoire ;
- politique claire de rétention des imports.

## Secrets et connecteurs

- Les identifiants connecteurs ne doivent jamais être exposés côté client.
- Les tokens doivent être chiffrés.
- Les accès doivent être révocables.
- Les logs ne doivent pas contenir de secrets.

## Atlas AI Layer

L'IA générative ne doit jamais accéder directement à des données hors périmètre. Toute requête IA doit être filtrée par :

- organisation ;
- utilisateur ;
- rôle ;
- permission ;
- finalité ;
- mémoire autorisée.

## Évolutions futures

- Auth réelle.
- RBAC serveur.
- Audit log persistant.
- Chiffrement des secrets.
- Politique RGPD par tenant.
- Journal des prompts et sources utilisées par Atlas AI Layer.
