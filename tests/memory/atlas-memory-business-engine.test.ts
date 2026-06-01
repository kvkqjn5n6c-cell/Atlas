import { describe, expect, it } from "vitest";
import { generateLocalExecutiveSummary } from "@/lib/insights/local-executive-summary-engine";
import { generateLocalKpiInsights } from "@/lib/insights/local-insights-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { extractAtlasKnowledgeItems, generateMemoryContext } from "@/lib/memory/atlas-memory-engine";
import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";
import { buildKpiResult } from "../fixtures/local-engine-fixtures";

const documents = getAtlasMemoryMockByOrganization("org-atlas-demo");
const detectedKnowledge = extractAtlasKnowledgeItems(documents, "org-atlas-demo");
const approvedKnowledge = detectedKnowledge.map((item) => ({
  ...item,
  status: "approved" as const,
  approvedAt: "2026-06-01T10:00:00.000Z"
}));
const approvedMemoryContext = generateMemoryContext(documents, approvedKnowledge);
const detectedOnlyMemoryContext = generateMemoryContext(documents, detectedKnowledge);

describe("atlas memory integration with business engine", () => {
  it("ignore les connaissances detectees mais non validees", () => {
    const result = buildKpiResult({
      name: "Somme cout sous-traitance",
      displayFieldLabel: "Cout sous-traitance",
      status: "critical"
    });
    const alerts = generateLocalKpiAlerts([result]);
    const insights = generateLocalKpiInsights([result], [], alerts, [], detectedOnlyMemoryContext);

    expect(insights.some((insight) => insight.memorySources?.length)).toBe(false);
  });

  it("enrichit un insight local avec un objectif memoire valide lie au KPI", () => {
    const result = buildKpiResult({
      name: "Somme cout sous-traitance",
      displayFieldLabel: "Cout sous-traitance",
      status: "critical"
    });
    const alerts = generateLocalKpiAlerts([result]);
    const insights = generateLocalKpiInsights([result], [], alerts, [], approvedMemoryContext);
    const memoryInsight = insights.find((insight) => insight.memorySources?.length);

    expect(memoryInsight).toBeDefined();
    expect(memoryInsight?.summary.toLowerCase()).toContain("objectif");
    expect(memoryInsight?.memorySources).toEqual(expect.arrayContaining(["strategie.md"]));
    expect(memoryInsight?.memoryKnowledgeLabels).toEqual(expect.arrayContaining(["Objectif validé"]));
  });

  it("enrichit la synthese dirigeant avec les connaissances memoire", () => {
    const result = buildKpiResult({
      name: "Somme cout sous-traitance",
      displayFieldLabel: "Cout sous-traitance",
      status: "critical"
    });
    const alerts = generateLocalKpiAlerts([result]);
    const insights = generateLocalKpiInsights([result], [], alerts, [], approvedMemoryContext);
    const summary = generateLocalExecutiveSummary({
      kpiResults: [result],
      histories: [],
      alerts,
      alertRules: [],
      insights,
      memoryContext: approvedMemoryContext
    });

    expect(summary.memoryHighlights.length).toBeGreaterThan(0);
    expect(summary.memoryHighlights.join(" ").toLowerCase()).toContain("mémoire");
  });
});
