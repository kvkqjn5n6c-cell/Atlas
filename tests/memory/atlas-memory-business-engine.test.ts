import { describe, expect, it } from "vitest";
import { generateLocalExecutiveSummary } from "@/lib/insights/local-executive-summary-engine";
import { generateLocalKpiInsights } from "@/lib/insights/local-insights-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { generateMemoryContext } from "@/lib/memory/atlas-memory-engine";
import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";
import { buildKpiResult } from "../fixtures/local-engine-fixtures";

const memoryContext = generateMemoryContext(getAtlasMemoryMockByOrganization("org-atlas-demo"));

describe("atlas memory integration with business engine", () => {
  it("enrichit un insight local avec un objectif memoire lie au KPI", () => {
    const result = buildKpiResult({
      name: "Somme cout sous-traitance",
      displayFieldLabel: "Cout sous-traitance",
      status: "critical"
    });
    const alerts = generateLocalKpiAlerts([result]);
    const insights = generateLocalKpiInsights([result], [], alerts, [], memoryContext);
    const memoryInsight = insights.find((insight) => insight.memorySources?.length);

    expect(memoryInsight).toBeDefined();
    expect(memoryInsight?.summary.toLowerCase()).toContain("objectif");
    expect(memoryInsight?.memorySources).toEqual(expect.arrayContaining(["strategie.md"]));
  });

  it("enrichit la synthese dirigeant avec les connaissances memoire", () => {
    const result = buildKpiResult({
      name: "Somme cout sous-traitance",
      displayFieldLabel: "Cout sous-traitance",
      status: "critical"
    });
    const alerts = generateLocalKpiAlerts([result]);
    const insights = generateLocalKpiInsights([result], [], alerts, [], memoryContext);
    const summary = generateLocalExecutiveSummary({
      kpiResults: [result],
      histories: [],
      alerts,
      alertRules: [],
      insights,
      memoryContext
    });

    expect(summary.memoryHighlights.length).toBeGreaterThan(0);
    expect(summary.memoryHighlights.join(" ").toLowerCase()).toContain("mémoire");
  });
});
