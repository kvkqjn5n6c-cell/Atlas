import { describe, expect, it } from "vitest";
import {
  extractBusinessGlossary,
  extractBusinessRules,
  extractDecisionHistory,
  extractStrategicObjectives,
  generateMemoryContext
} from "@/lib/memory/atlas-memory-engine";
import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";

const documents = getAtlasMemoryMockByOrganization("org-atlas-demo");

describe("atlas memory engine", () => {
  it("extrait les objectifs strategiques depuis la memoire", () => {
    const objectives = extractStrategicObjectives(documents);

    expect(objectives.length).toBeGreaterThan(0);
    expect(objectives.some((objective) => objective.text.toLowerCase().includes("sous-traitance"))).toBe(true);
  });

  it("extrait les regles metier depuis la memoire", () => {
    const rules = extractBusinessRules(documents);

    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((rule) => rule.text.toLowerCase().includes("marge"))).toBe(true);
  });

  it("extrait les decisions historiques depuis la memoire", () => {
    const decisions = extractDecisionHistory(documents);

    expect(decisions.length).toBeGreaterThan(0);
    expect(decisions.some((decision) => decision.text.toLowerCase().includes("sous-traitance"))).toBe(true);
  });

  it("extrait le glossaire metier", () => {
    const glossary = extractBusinessGlossary(documents);

    expect(glossary.length).toBeGreaterThan(0);
    expect(glossary.some((entry) => entry.term.toLowerCase().includes("intervention"))).toBe(true);
  });

  it("genere un contexte memoire exploitable", () => {
    const context = generateMemoryContext(documents);

    expect(context.objectives.length).toBeGreaterThan(0);
    expect(context.businessRules.length).toBeGreaterThan(0);
    expect(context.decisions.length).toBeGreaterThan(0);
    expect(context.glossaryEntries.length).toBeGreaterThan(0);
    expect(context.warnings).toHaveLength(0);
  });
});
