import type { AtlasMemoryContext, AtlasMemoryContextItem, AtlasMemoryGlossaryEntry } from "@/types/atlas-memory-context";
import type { AtlasMemoryDocument } from "@/types/atlas-memory";
import type { AtlasKnowledgeItem, AtlasKnowledgeType } from "@/types/atlas-memory-knowledge";

const objectiveSources = new Set(["strategie.md", "objectifs.md"]);
const ruleSources = new Set(["regles_metier.md"]);
const decisionSources = new Set(["historique_decisions.md"]);
const glossarySources = new Set(["glossaire.md"]);

function cleanLine(line: string) {
  return line
    .replace(/^[-*]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .trim();
}

function normalizeForId(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function createAtlasKnowledgeId(
  organizationId: string,
  type: AtlasKnowledgeType,
  sourceDocument: string,
  value: string
) {
  return `${organizationId}:${type}:${sourceDocument}:${normalizeForId(value)}`;
}

function extractStructuredLines(document: AtlasMemoryDocument, prefixes: string[] = []): AtlasMemoryContextItem[] {
  return document.content
    .split(/\r?\n/)
    .map((line) => ({
      rawLine: line.trim(),
      text: cleanLine(line)
    }))
    .filter(({ rawLine, text }) => {
      if (!text || text.startsWith("#")) return false;
      if (/^[-*]\s+/.test(rawLine) || /^\d+\.\s+/.test(rawLine)) return true;
      return prefixes.some((prefix) => text.toLowerCase().startsWith(prefix.toLowerCase()));
    })
    .map(({ text }) => ({
      text: prefixes.some((prefix) => text.toLowerCase().startsWith(prefix.toLowerCase()))
        ? text.replace(/^[^:]+:\s*/, "").trim()
        : text,
      source: document.key
    }))
    .filter((item) => item.text.length > 0);
}

export function extractStrategicObjectives(documents: AtlasMemoryDocument[]): AtlasMemoryContextItem[] {
  return documents
    .filter((document) => objectiveSources.has(document.key))
    .flatMap((document) => extractStructuredLines(document, ["Objectif:"]));
}

export function extractBusinessRules(documents: AtlasMemoryDocument[]): AtlasMemoryContextItem[] {
  return documents
    .filter((document) => ruleSources.has(document.key))
    .flatMap((document) => extractStructuredLines(document, ["Règle:", "Regle:"]));
}

export function extractDecisionHistory(documents: AtlasMemoryDocument[]): AtlasMemoryContextItem[] {
  return documents
    .filter((document) => decisionSources.has(document.key))
    .flatMap((document) => extractStructuredLines(document, ["Décision:", "Decision:"]));
}

export function extractBusinessGlossary(documents: AtlasMemoryDocument[]): AtlasMemoryGlossaryEntry[] {
  return documents
    .filter((document) => glossarySources.has(document.key))
    .flatMap((document) =>
      document.content
        .split(/\r?\n/)
        .map(cleanLine)
        .filter((line) => line.includes(":"))
        .map((line) => {
          const [term, ...definitionParts] = line.split(":");
          const definition = definitionParts.join(":").trim();
          return {
            term: term.trim(),
            definition,
            text: `${term.trim()} : ${definition}`,
            source: document.key
          };
        })
        .filter((entry) => entry.term.length > 0 && entry.definition.length > 0)
    );
}

function knowledgeFromContextItem(
  item: AtlasMemoryContextItem,
  type: AtlasKnowledgeType,
  organizationId: string,
  documents: AtlasMemoryDocument[]
): AtlasKnowledgeItem {
  const sourceDocument = item.source as AtlasKnowledgeItem["sourceDocument"];
  const sourceDocumentValue = documents.find((document) => document.key === sourceDocument);

  return {
    id: createAtlasKnowledgeId(organizationId, type, item.source, item.text),
    organizationId,
    type,
    sourceDocument,
    value: item.text,
    status: "detected",
    detectedAt: sourceDocumentValue?.updatedAt ?? "2026-06-01T00:00:00.000Z",
    approvedAt: null,
    rejectedAt: null,
    notes: null
  };
}

export function extractAtlasKnowledgeItems(
  documents: AtlasMemoryDocument[],
  organizationId = "org-atlas-demo"
): AtlasKnowledgeItem[] {
  const glossaryItems = extractBusinessGlossary(documents).map((entry) => ({
    text: `${entry.term} : ${entry.definition}`,
    source: entry.source
  }));

  return [
    ...extractStrategicObjectives(documents).map((item) => knowledgeFromContextItem(item, "objective", organizationId, documents)),
    ...extractBusinessRules(documents).map((item) => knowledgeFromContextItem(item, "business_rule", organizationId, documents)),
    ...extractDecisionHistory(documents).map((item) => knowledgeFromContextItem(item, "decision", organizationId, documents)),
    ...glossaryItems.map((item) => knowledgeFromContextItem(item, "glossary", organizationId, documents))
  ];
}

function fallbackListItems(document: AtlasMemoryDocument) {
  return document.content
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function contextItemFromKnowledge(item: AtlasKnowledgeItem): AtlasMemoryContextItem {
  return {
    knowledgeId: item.id,
    type: item.type,
    text: item.value,
    source: item.sourceDocument,
    status: item.status
  };
}

export function generateMemoryContext(
  documents: AtlasMemoryDocument[],
  knowledgeItems?: AtlasKnowledgeItem[]
): AtlasMemoryContext {
  if (knowledgeItems) {
    const approvedItems = knowledgeItems.filter((item) => item.status === "approved");

    return {
      objectives: approvedItems.filter((item) => item.type === "objective").map(contextItemFromKnowledge),
      businessRules: approvedItems.filter((item) => item.type === "business_rule").map(contextItemFromKnowledge),
      decisions: approvedItems.filter((item) => item.type === "decision").map(contextItemFromKnowledge),
      glossaryEntries: approvedItems
        .filter((item) => item.type === "glossary")
        .map((item) => {
          const [term, ...definitionParts] = item.value.split(":");
          const definition = definitionParts.join(":").trim();
          return {
            ...contextItemFromKnowledge(item),
            term: term.trim(),
            definition,
            text: item.value
          };
        })
        .filter((entry) => entry.term.length > 0 && entry.definition.length > 0),
      warnings: approvedItems.length === 0 ? ["Aucune connaissance approuvée disponible pour le moteur métier."] : []
    };
  }

  const objectives = extractStrategicObjectives(documents);
  const businessRules = extractBusinessRules(documents);
  const decisions = extractDecisionHistory(documents);
  const glossaryEntries = extractBusinessGlossary(documents);
  const warnings: string[] = [];

  if (objectives.length === 0) {
    const fallbackObjectives = documents
      .filter((document) => objectiveSources.has(document.key))
      .flatMap((document) => fallbackListItems(document).map((text) => ({ text, source: document.key })));
    objectives.push(...fallbackObjectives);
  }

  if (businessRules.length === 0) {
    const fallbackRules = documents
      .filter((document) => ruleSources.has(document.key))
      .flatMap((document) => fallbackListItems(document).map((text) => ({ text, source: document.key })));
    businessRules.push(...fallbackRules);
  }

  if (decisions.length === 0) {
    const fallbackDecisions = documents
      .filter((document) => decisionSources.has(document.key))
      .flatMap((document) => fallbackListItems(document).map((text) => ({ text, source: document.key })));
    decisions.push(...fallbackDecisions);
  }

  if (documents.length === 0) warnings.push("Aucun document mémoire disponible.");
  if (objectives.length === 0) warnings.push("Aucun objectif stratégique détecté.");
  if (businessRules.length === 0) warnings.push("Aucune règle métier détectée.");

  return {
    objectives,
    businessRules,
    decisions,
    glossaryEntries,
    warnings
  };
}

export function memoryTextMatchesKpi(memoryText: string, kpiLabel: string) {
  const normalizedMemory = memoryText.toLowerCase();
  const normalizedKpi = kpiLabel.toLowerCase();
  const keywordGroups = [
    ["sous-traitance", "cout", "coût", "fournisseur"],
    ["marge", "rentabilité", "rentabilite"],
    ["satisfaction", "qualité", "qualite"],
    ["retard", "délai", "delai", "intervention"],
    ["cash", "trésorerie", "tresorerie"],
    ["productivité", "productivite", "dossiers", "charge"]
  ];

  return keywordGroups.some((keywords) =>
    keywords.some((keyword) => normalizedMemory.includes(keyword)) &&
    keywords.some((keyword) => normalizedKpi.includes(keyword))
  );
}
