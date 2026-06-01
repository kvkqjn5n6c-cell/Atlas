import type { AtlasMemoryDocument, AtlasMemoryDocumentKey } from "@/types/atlas-memory";

const organizationId = "org-atlas-demo";
const updatedAt = "2026-06-01T09:00:00.000Z";

const documents: Array<{
  key: AtlasMemoryDocumentKey;
  title: string;
  description: string;
  content: string;
}> = [
  {
    key: "entreprise.md",
    title: "Entreprise",
    description: "Identité, activité, modèle économique et contexte de l'organisation.",
    content: `# Nova Services Maintenance

PME de maintenance terrain spécialisée dans les interventions multi-sites pour clients professionnels.

## Activité

- Maintenance préventive et corrective.
- Interventions terrain planifiées et urgentes.
- Sous-traitance ponctuelle en région Est.

## Enjeu actuel

L'activité reste stable, mais la marge et la qualité de service sont sous pression.`
  },
  {
    key: "strategie.md",
    title: "Stratégie",
    description: "Axes stratégiques et priorités de pilotage.",
    content: `# Stratégie

## Priorités

1. Stabiliser la marge opérationnelle.
2. Réduire la dépendance à la sous-traitance subie.
3. Fiabiliser la lecture cash à 30 jours.
4. Améliorer la satisfaction client sur les interventions en retard.`
  },
  {
    key: "objectifs.md",
    title: "Objectifs",
    description: "Objectifs métier suivis dans Atlas.",
    content: `# Objectifs

- Marge brute cible : 35 %.
- Retards intervention : moins de 8 %.
- Satisfaction client : 92 / 100.
- Cash disponible à 30 jours : minimum 30 000 EUR.`
  },
  {
    key: "processus.md",
    title: "Processus",
    description: "Processus opérationnels structurants.",
    content: `# Processus

## Interventions

1. Qualification de la demande.
2. Planification technicien.
3. Intervention terrain.
4. Validation client.
5. Retour qualité.

## Pilotage

Le comité hebdomadaire regarde marge, charge, retards, cash et satisfaction.`
  },
  {
    key: "regles_metier.md",
    title: "Règles métier",
    description: "Règles explicites utilisées par le moteur métier.",
    content: `# Règles métier

- Un retard supérieur à 48 h doit être revu en priorité.
- Une marge inférieure à 30 % déclenche une surveillance.
- Une marge inférieure à 25 % déclenche une alerte critique.
- Une hausse de sous-traitance supérieure à 15 % doit être expliquée.`
  },
  {
    key: "glossaire.md",
    title: "Glossaire",
    description: "Vocabulaire métier partagé.",
    content: `# Glossaire

- Intervention : mission terrain réalisée par un technicien.
- Région Est : zone géographique sous tension opérationnelle.
- Sous-traitance subie : recours externe non anticipé.
- KPI local : indicateur créé depuis un import de test.`
  },
  {
    key: "clients.md",
    title: "Clients",
    description: "Segments clients et risques de concentration.",
    content: `# Clients

Les deux plus gros clients représentent une part significative de l'activité mensuelle.

## Points de vigilance

- Dépendance au renouvellement de contrats.
- Retards de validation sur certains sites.
- Satisfaction en baisse si les délais terrain glissent.`
  },
  {
    key: "fournisseurs.md",
    title: "Fournisseurs",
    description: "Partenaires, sous-traitants et dépendances externes.",
    content: `# Fournisseurs

La sous-traitance en région Est est le principal facteur de variabilité de marge.

## Suivi recommandé

- Coût moyen par intervention sous-traitée.
- Nombre d'interventions externalisées.
- Délai de mobilisation fournisseur.`
  },
  {
    key: "historique_decisions.md",
    title: "Historique décisions",
    description: "Décisions de pilotage prises ou à confirmer.",
    content: `# Historique des décisions

## Mai 2026

- Prioriser la réduction des retards région Est.
- Revoir les contrats de sous-traitance.
- Fiabiliser l'import trésorerie avant le prochain rapport dirigeant.`
  },
  {
    key: "offres.md",
    title: "Offres",
    description: "Offres ou lignes de service suivies dans le pilotage.",
    content: `# Offres

- Maintenance préventive.
- Maintenance corrective.
- Intervention urgente.
- Contrat multi-sites.

Les interventions urgentes sont plus rentables mais plus risquées pour la qualité de service.`
  },
  {
    key: "kpi.md",
    title: "KPI",
    description: "Indicateurs clés et logique de lecture.",
    content: `# KPI

## KPI prioritaires

- Marge brute.
- Cash J+30.
- Taux de retard intervention.
- Satisfaction client.
- Coût sous-traitance.

Atlas distingue problème de performance et problème de donnée.`
  },
  {
    key: "equipe.md",
    title: "Équipe",
    description: "Responsables métier et rôles de pilotage.",
    content: `# Équipe

- Direction : arbitrage cash et marge.
- Responsable opérations : retards et charge terrain.
- Qualité : satisfaction client.
- Consultant Atlas : configuration KPI et gouvernance donnée.`
  }
];

export const atlasMemoryMock: AtlasMemoryDocument[] = documents.map((document) => ({
  id: `${organizationId}-${document.key}`,
  organizationId,
  key: document.key,
  title: document.title,
  description: document.description,
  content: document.content,
  updatedAt,
  source: "mock",
  persisted: false
}));

export function getAtlasMemoryMockByOrganization(organizationIdValue: string) {
  return atlasMemoryMock.filter((document) => document.organizationId === organizationIdValue);
}
