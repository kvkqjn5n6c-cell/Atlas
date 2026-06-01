import type { AtlasMemoryDocumentKey } from "@/types/atlas-memory";
import type { KnowledgeStatus } from "@/types/atlas-memory-knowledge";

export type AtlasMemorySearchScope =
  | "all"
  | "documents"
  | "knowledge"
  | "approved"
  | "detected"
  | "rejected";

export type AtlasMemorySearchResultType =
  | "document"
  | "knowledge"
  | "objective"
  | "rule"
  | "decision"
  | "glossary";

export type AtlasMemorySearchIndexEntry = {
  id: string;
  type: AtlasMemorySearchResultType;
  title: string;
  content: string;
  sourceDocument: AtlasMemoryDocumentKey;
  status?: KnowledgeStatus;
  createdAt?: string;
};

export type AtlasMemorySearchResult = {
  id: string;
  type: AtlasMemorySearchResultType;
  title: string;
  excerpt: string;
  sourceDocument: AtlasMemoryDocumentKey;
  status?: KnowledgeStatus;
  score: number;
  matchedTerms: string[];
  createdAt?: string;
};
