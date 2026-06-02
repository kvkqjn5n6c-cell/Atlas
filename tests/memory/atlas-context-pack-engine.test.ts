import { describe, expect, it } from "vitest";
import {
  buildAtlasContextPack,
  buildExecutiveSummaryContext,
  buildKpiAnalysisContext,
  buildRiskReviewContext
} from "@/lib/memory/atlas-context-pack-engine";
import { generateLocalKpiAlerts } from "@/lib/kpi-engine/local-kpi-alerts";
import { extractAtlasKnowledgeItems } from "@/lib/memory/atlas-memory-engine";
import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";
import { buildAlertRule, buildKpiResult } from "../fixtures/local-engine-fixtures";

const organizationId = "org-atlas-demo";
const documents = getAtlasMemoryMockByOrganization(organizationId);
const detectedKnowledge = extractAtlasKnowledgeItems(documents, organizationId);
const approvedKnowledge = detectedKnowledge.map((item) => ({
  ...item,
  status: "approved" as const,
  approvedAt: "2026-06-01T10:00:00.000Z"
}));

describe("atlas context pack engine", () => {
  it("cree un pack analyse KPI avec documents, connaissances et KPI", () => {
    const result = buildKpiResult();
    const pack = buildKpiAnalysisContext({
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      kpiResults: [result]
    });

    expect(pack.purpose).toBe("kpi_analysis");
    expect(pack.includedDocuments.length).toBeGreaterThan(0);
    expect(pack.includedKnowledge.length).toBeGreaterThan(0);
    expect(pack.includedKpis).toHaveLength(1);
    expect(pack.persisted).toBe(false);
  });

  it("cree un pack synthese dirigeant", () => {
    const pack = buildExecutiveSummaryContext({
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge
    });

    expect(pack.title).toBe("Synthèse dirigeant");
    expect(pack.includedDocuments.some((source) => source.sourceDocument === "strategie.md")).toBe(true);
  });

  it("cree un pack revue des risques avec alertes critiques", () => {
    const result = buildKpiResult({ status: "critical" });
    const rule = buildAlertRule();
    const alerts = generateLocalKpiAlerts([result], [], [rule]);
    const pack = buildRiskReviewContext({
      organizationId,
      documents,
      knowledgeItems: approvedKnowledge,
      kpiResults: [result],
      alerts,
      alertRules: [rule]
    });

    expect(pack.includedAlerts.length).toBeGreaterThan(0);
    expect(pack.includedRules.length).toBeGreaterThan(0);
  });

  it("ignore les connaissances detectees et rejetees", () => {
    const governedKnowledge = [
      { ...detectedKnowledge[0], status: "approved" as const, approvedAt: "2026-06-01T10:00:00.000Z" },
      { ...detectedKnowledge[1], status: "detected" as const },
      { ...detectedKnowledge[2], status: "rejected" as const, rejectedAt: "2026-06-01T10:00:00.000Z" }
    ];
    const pack = buildAtlasContextPack("executive_summary", {
      organizationId,
      documents,
      knowledgeItems: governedKnowledge
    });

    expect(pack.includedKnowledge).toHaveLength(1);
    expect(pack.includedKnowledge[0].status).toBe("approved");
    expect(pack.limitations.some((limitation) => limitation.includes("détectée"))).toBe(true);
    expect(pack.limitations.some((limitation) => limitation.includes("rejetée"))).toBe(true);
  });

  it("signale les limites quand les donnees sont insuffisantes", () => {
    const pack = buildAtlasContextPack("commercial_review", {
      organizationId,
      documents: [],
      knowledgeItems: [],
      kpiResults: [],
      alerts: [],
      alertRules: []
    });

    expect(pack.limitations.length).toBeGreaterThan(0);
    expect(pack.limitations).toEqual(expect.arrayContaining(["Aucune connaissance validée disponible dans Atlas Memory."]));
  });
});
