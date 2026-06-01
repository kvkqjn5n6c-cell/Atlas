import type { AtlasKnowledgeType, KnowledgeStatus } from "@/types/atlas-memory-knowledge";

export type AtlasMemoryContextItem = {
  knowledgeId?: string;
  type?: AtlasKnowledgeType;
  text: string;
  source: string;
  status?: KnowledgeStatus;
};

export type AtlasMemoryGlossaryEntry = AtlasMemoryContextItem & {
  term: string;
  definition: string;
};

export type AtlasMemoryContext = {
  objectives: AtlasMemoryContextItem[];
  businessRules: AtlasMemoryContextItem[];
  decisions: AtlasMemoryContextItem[];
  glossaryEntries: AtlasMemoryGlossaryEntry[];
  warnings: string[];
};
