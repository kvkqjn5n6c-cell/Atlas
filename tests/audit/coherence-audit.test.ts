import { describe, expect, it } from "vitest";
import { auditDomain } from "@/lib/audit/coherence-audit-engine";
import { getPrimarySourceCoherenceWarnings } from "@/lib/audit/coherence-guardrails";

describe("coherence audit engine", () => {
  it("detecte un match parfait", () => {
    const result = auditDomain({
      domain: "atlas_datasets",
      localRecords: [{ id: "dataset-1" }],
      prismaRecords: [{ id: "dataset-1" }]
    });

    expect(result.status).toBe("MATCH");
    expect(result.localCount).toBe(1);
    expect(result.prismaCount).toBe(1);
    expect(result.differences).toHaveLength(0);
  });

  it("detecte local only", () => {
    const result = auditDomain({
      domain: "local_action_plans",
      localRecords: [{ id: "plan-1" }],
      prismaRecords: []
    });

    expect(result.status).toBe("LOCAL_ONLY");
    expect(result.localOnlyIds).toEqual(["plan-1"]);
  });

  it("detecte prisma only", () => {
    const result = auditDomain({
      domain: "decision_journal",
      localRecords: [],
      prismaRecords: [{ id: "journal-1" }]
    });

    expect(result.status).toBe("PRISMA_ONLY");
    expect(result.prismaOnlyIds).toEqual(["journal-1"]);
  });

  it("detecte un count mismatch", () => {
    const result = auditDomain({
      domain: "dataset_groupby_analyses",
      localRecords: [{ id: "analysis-1" }, { id: "analysis-2" }],
      prismaRecords: [{ id: "analysis-1" }]
    });

    expect(result.status).toBe("COUNT_MISMATCH");
    expect(result.differences[0].status).toBe("COUNT_MISMATCH");
  });

  it("detecte un content mismatch sur empreinte simple", () => {
    const result = auditDomain({
      domain: "dataset_kpi_definitions",
      localRecords: [{ id: "dataset-kpi-1", fingerprint: "local" }],
      prismaRecords: [{ id: "dataset-kpi-1", fingerprint: "prisma" }]
    });

    expect(result.status).toBe("CONTENT_MISMATCH");
    expect(result.differences[0].id).toBe("dataset-kpi-1");
  });

  it("genere un warning de garde-fou pour un domaine decisionnel en mismatch", () => {
    const domain = auditDomain({
      domain: "local_action_plans",
      localRecords: [{ id: "plan-1" }, { id: "plan-2" }],
      prismaRecords: [{ id: "plan-1" }]
    });

    const warnings = getPrimarySourceCoherenceWarnings({
      id: "coherence-audit-test",
      generatedAt: "2026-06-01T10:00:00.000Z",
      summary: {
        totalDomains: 1,
        matchingDomains: 0,
        differenceDomains: 1,
        localOnly: 0,
        prismaOnly: 0,
        countMismatches: 1,
        contentMismatches: 0,
        score: 0
      },
      domains: [domain],
      warnings: [],
      errors: []
    });

    expect(warnings).toHaveLength(1);
    expect(warnings[0].status).toBe("COUNT_MISMATCH");
    expect(warnings[0].message).toContain("fallback local");
  });
});
