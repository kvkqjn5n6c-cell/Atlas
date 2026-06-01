export type AtlasMemoryContextItem = {
  text: string;
  source: string;
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
