import type { AtlasMemoryContext, AtlasMemoryContextItem, AtlasMemoryGlossaryEntry } from "@/types/atlas-memory-context";
import type { AtlasMemoryDocument } from "@/types/atlas-memory";

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

function fallbackListItems(document: AtlasMemoryDocument) {
  return document.content
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

export function generateMemoryContext(documents: AtlasMemoryDocument[]): AtlasMemoryContext {
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
