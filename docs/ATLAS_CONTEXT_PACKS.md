# Atlas Context Packs

Atlas Context Packs prépare la mémoire métier pour les futurs agents spécialisés sans activer d'IA, de chatbot ou de LLM.

## Rôle

Un context pack regroupe les sources utiles à un usage précis :

- analyse KPI ;
- synthèse dirigeant ;
- revue des risques ;
- préparation COPIL ;
- recommandations opérationnelles ;
- revue commerciale.

Chaque pack reste déterministe et explicable.

## Structure

Un pack contient :

- documents inclus ;
- connaissances validées incluses ;
- KPI locaux ;
- alertes locales ;
- règles d'alerte ;
- résumé déterministe ;
- limites et exclusions.

Les connaissances `detected` ou `rejected` sont toujours exclues du contexte utilisable.

## Usage futur

Les packs pourront être transmis plus tard à :

- un Agent KPI ;
- un Agent Risques ;
- un Agent COPIL ;
- un Agent Synthèse dirigeant ;
- un Agent Recommandations ;
- un Agent Commercial.

Cette phase ne crée pas encore ces agents. Elle prépare uniquement la forme des données qu'ils consommeront.

## Pourquoi pas d'IA maintenant

Atlas doit d'abord maîtriser :

- la gouvernance de connaissance ;
- les sources utilisées ;
- les exclusions ;
- les limites ;
- la traçabilité.

L'IA générative pourra être ajoutée plus tard sur cette base, mais elle ne remplace pas le moteur métier déterministe.

## Limites actuelles

- pas de persistance Prisma ;
- pas de versioning des packs ;
- pas de droits d'accès dédiés ;
- pas de scoring avancé de pertinence ;
- pas de récupération automatique de documents externes.
