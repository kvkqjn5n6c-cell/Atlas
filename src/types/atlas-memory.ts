export type AtlasMemoryDocumentKey =
  | "entreprise.md"
  | "strategie.md"
  | "objectifs.md"
  | "processus.md"
  | "regles_metier.md"
  | "glossaire.md"
  | "clients.md"
  | "fournisseurs.md"
  | "historique_decisions.md"
  | "offres.md"
  | "kpi.md"
  | "equipe.md";

export type AtlasMemoryDocument = {
  id: string;
  organizationId: string;
  key: AtlasMemoryDocumentKey;
  title: string;
  description: string;
  content: string;
  updatedAt: string;
  source: "mock" | "local";
  persisted: false;
};

export type AtlasMemoryWorkspace = {
  organizationId: string;
  documents: AtlasMemoryDocument[];
  updatedAt: string;
  persisted: false;
};
