import { describe, expect, it } from "vitest";
import {
  buildAtlasMemorySearchIndex,
  extractSearchExcerpt,
  normalizeSearchText,
  searchAtlasMemory
} from "@/lib/memory/atlas-memory-search-engine";
import { extractAtlasKnowledgeItems } from "@/lib/memory/atlas-memory-engine";
import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";

const documents = getAtlasMemoryMockByOrganization("org-atlas-demo");
const detectedKnowledge = extractAtlasKnowledgeItems(documents, "org-atlas-demo");

function withStatus(item: AtlasKnowledgeItem, status: AtlasKnowledgeItem["status"]) {
  return {
    ...item,
    status,
    approvedAt: status === "approved" ? "2026-06-01T10:00:00.000Z" : null,
    rejectedAt: status === "rejected" ? "2026-06-01T10:00:00.000Z" : null
  };
}

describe("atlas memory search engine", () => {
  it("indexe les documents memoire", () => {
    const index = buildAtlasMemorySearchIndex(documents, []);

    expect(index.some((entry) => entry.type === "document" && entry.sourceDocument === "strategie.md")).toBe(true);
  });

  it("indexe les connaissances gouvernees", () => {
    const index = buildAtlasMemorySearchIndex(documents, detectedKnowledge);

    expect(index.some((entry) => entry.type === "objective" && entry.status === "detected")).toBe(true);
    expect(index.some((entry) => entry.type === "rule")).toBe(true);
  });

  it("recherche sans tenir compte de la casse", () => {
    const index = buildAtlasMemorySearchIndex(documents, detectedKnowledge);
    const results = searchAtlasMemory("MARGE", index, { scope: "all" });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchedTerms).toContain("marge");
  });

  it("normalise les accents", () => {
    expect(normalizeSearchText("Trésorerie opérationnelle")).toContain("tresorerie");

    const index = buildAtlasMemorySearchIndex(documents, detectedKnowledge);
    const results = searchAtlasMemory("tresorerie", index, { scope: "all" });

    expect(results.some((result) => result.sourceDocument === "historique_decisions.md" || result.sourceDocument === "objectifs.md")).toBe(true);
  });

  it("priorise les connaissances validees", () => {
    const objective = detectedKnowledge.find((item) => item.type === "objective" && item.value.toLowerCase().includes("marge"));
    expect(objective).toBeDefined();

    const duplicatedKnowledge = [
      withStatus({ ...objective!, id: "detected-margin" }, "detected"),
      withStatus({ ...objective!, id: "approved-margin" }, "approved")
    ];
    const index = buildAtlasMemorySearchIndex([], duplicatedKnowledge);
    const results = searchAtlasMemory("marge", index, { scope: "knowledge" });

    expect(results[0]).toMatchObject({ id: "approved-margin", status: "approved" });
  });

  it("filtre par statut", () => {
    const mixedKnowledge = [
      withStatus({ ...detectedKnowledge[0], id: "approved-item" }, "approved"),
      withStatus({ ...detectedKnowledge[1], id: "rejected-item" }, "rejected"),
      withStatus({ ...detectedKnowledge[2], id: "detected-item" }, "detected")
    ];
    const index = buildAtlasMemorySearchIndex([], mixedKnowledge);

    expect(searchAtlasMemory("", index, { scope: "approved" })).toHaveLength(1);
    expect(searchAtlasMemory("", index, { scope: "rejected" })).toHaveLength(1);
    expect(searchAtlasMemory("", index, { scope: "detected" })).toHaveLength(1);
  });

  it("genere un extrait autour du terme recherche", () => {
    const excerpt = extractSearchExcerpt(
      "Atlas conserve les objectifs, les règles métier et les décisions afin de fiabiliser la sous-traitance.",
      "sous-traitance"
    );

    expect(excerpt.toLowerCase()).toContain("sous-traitance");
  });
});
