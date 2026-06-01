import type { AtlasMemoryDocument } from "@/types/atlas-memory";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type {
  AtlasMemorySearchIndexEntry,
  AtlasMemorySearchResult,
  AtlasMemorySearchResultType,
  AtlasMemorySearchScope
} from "@/types/atlas-memory-search";

const knowledgeTypeToSearchType: Record<AtlasKnowledgeItem["type"], AtlasMemorySearchResultType> = {
  objective: "objective",
  business_rule: "rule",
  decision: "decision",
  glossary: "glossary"
};

export function normalizeSearchText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeSearchQuery(query: string) {
  return normalizeSearchText(query)
    .split(" ")
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
}

function countOccurrences(text: string, term: string) {
  if (!term) return 0;
  return text.split(term).length - 1;
}

function knowledgeTitle(item: AtlasKnowledgeItem) {
  const labels: Record<AtlasKnowledgeItem["type"], string> = {
    objective: "Objectif mémoire",
    business_rule: "Règle métier",
    decision: "Décision historique",
    glossary: "Définition métier"
  };

  return labels[item.type];
}

export function buildAtlasMemorySearchIndex(
  documents: AtlasMemoryDocument[],
  knowledgeItems: AtlasKnowledgeItem[]
): AtlasMemorySearchIndexEntry[] {
  const documentEntries = documents.map((document) => ({
    id: document.id,
    type: "document" as const,
    title: document.title,
    content: `${document.title}\n${document.description}\n${document.content}`,
    sourceDocument: document.key,
    createdAt: document.updatedAt
  }));

  const knowledgeEntries = knowledgeItems.map((item) => ({
    id: item.id,
    type: knowledgeTypeToSearchType[item.type],
    title: knowledgeTitle(item),
    content: item.value,
    sourceDocument: item.sourceDocument,
    status: item.status,
    createdAt: item.approvedAt ?? item.rejectedAt ?? item.detectedAt
  }));

  return [...documentEntries, ...knowledgeEntries];
}

function entryMatchesScope(entry: AtlasMemorySearchIndexEntry, scope?: AtlasMemorySearchScope) {
  if (!scope || scope === "all") return true;
  if (scope === "documents") return entry.type === "document";
  if (scope === "knowledge") return entry.type !== "document";
  if (scope === "approved") return entry.status === "approved";
  if (scope === "detected") return entry.status === "detected";
  if (scope === "rejected") return entry.status === "rejected";
  return true;
}

export function extractSearchExcerpt(text: string, query: string) {
  const terms = tokenizeSearchQuery(query);
  if (terms.length === 0) return text.slice(0, 180);

  const normalizedText = normalizeSearchText(text);
  const firstMatchIndex = terms
    .map((term) => normalizedText.indexOf(term))
    .filter((index) => index >= 0)
    .sort((first, second) => first - second)[0];

  if (firstMatchIndex === undefined) return text.slice(0, 180);

  const start = Math.max(0, firstMatchIndex - 60);
  const excerpt = text.slice(start, start + 220).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "... " : ""}${excerpt}${start + 220 < text.length ? " ..." : ""}`;
}

function scoreEntry(entry: AtlasMemorySearchIndexEntry, terms: string[]) {
  const normalizedTitle = normalizeSearchText(entry.title);
  const normalizedContent = normalizeSearchText(entry.content);
  const matchedTerms = terms.filter((term) => normalizedTitle.includes(term) || normalizedContent.includes(term));

  if (matchedTerms.length === 0) return { score: 0, matchedTerms };

  const occurrenceScore = matchedTerms.reduce(
    (total, term) => total + countOccurrences(normalizedContent, term),
    0
  );
  const titleBonus = matchedTerms.some((term) => normalizedTitle.includes(term)) ? 8 : 0;
  const approvedBonus = entry.status === "approved" ? 5 : 0;
  const exactPhraseBonus = normalizedContent.includes(terms.join(" ")) ? 4 : 0;
  const score = occurrenceScore + titleBonus + approvedBonus + exactPhraseBonus;

  return { score, matchedTerms };
}

export function searchAtlasMemory(
  query: string,
  index: AtlasMemorySearchIndexEntry[],
  options: { scope?: AtlasMemorySearchScope; limit?: number } = {}
): AtlasMemorySearchResult[] {
  const terms = tokenizeSearchQuery(query);
  const scopedEntries = index.filter((entry) => entryMatchesScope(entry, options.scope));

  if (terms.length === 0) {
    return scopedEntries
      .slice(0, options.limit ?? 12)
      .map((entry) => ({
        id: entry.id,
        type: entry.type,
        title: entry.title,
        excerpt: extractSearchExcerpt(entry.content, query),
        sourceDocument: entry.sourceDocument,
        status: entry.status,
        score: entry.status === "approved" ? 5 : 1,
        matchedTerms: [],
        createdAt: entry.createdAt
      }));
  }

  return scopedEntries
    .map((entry) => {
      const scoredEntry = scoreEntry(entry, terms);
      return {
        id: entry.id,
        type: entry.type,
        title: entry.title,
        excerpt: extractSearchExcerpt(entry.content, query),
        sourceDocument: entry.sourceDocument,
        status: entry.status,
        score: scoredEntry.score,
        matchedTerms: scoredEntry.matchedTerms,
        createdAt: entry.createdAt
      };
    })
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, options.limit ?? 12);
}
