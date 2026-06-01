import { describe, expect, it } from "vitest";
import { calculateLocalKpiFromImport } from "@/lib/kpi-engine/local-kpi-calculator";
import { buildKpiDraft, buildThresholdDraft, localImportFixture } from "../fixtures/local-engine-fixtures";

describe("calculateLocalKpiFromImport", () => {
  it("calcule une somme", () => {
    const result = calculateLocalKpiFromImport(localImportFixture, buildKpiDraft({ calculationType: "sum" }));

    expect(result.value).toBe(600);
    expect(result.rowsUsed).toBe(3);
  });

  it("calcule une moyenne", () => {
    const result = calculateLocalKpiFromImport(
      localImportFixture,
      buildKpiDraft({ calculationType: "average", primaryField: "Marge", sourceColumn: "margin" })
    );

    expect(result.value).toBe(30);
  });

  it("calcule un ratio", () => {
    const result = calculateLocalKpiFromImport(
      localImportFixture,
      buildKpiDraft({
        calculationType: "ratio",
        primaryField: "ChiffreAffaires",
        sourceColumn: "revenue",
        secondaryField: "NonMappe",
        secondarySourceColumn: "denominator"
      })
    );

    expect(result.value).toBe(10);
  });

  it("classe un KPI higher_is_better conforme", () => {
    const result = calculateLocalKpiFromImport(
      localImportFixture,
      buildThresholdDraft("ChiffreAffaires", "revenue", "sum", "higher_is_better", "healthy")
    );

    expect(result.status).toBe("healthy");
  });

  it("classe un KPI higher_is_better en surveillance", () => {
    const result = calculateLocalKpiFromImport(
      localImportFixture,
      buildThresholdDraft("ChiffreAffaires", "revenue", "sum", "higher_is_better", "watch")
    );

    expect(result.status).toBe("watch");
  });

  it("classe un KPI higher_is_better critique", () => {
    const result = calculateLocalKpiFromImport(
      localImportFixture,
      buildThresholdDraft("ChiffreAffaires", "revenue", "sum", "higher_is_better", "critical")
    );

    expect(result.status).toBe("critical");
  });

  it("classe un KPI lower_is_better conforme", () => {
    const result = calculateLocalKpiFromImport(
      localImportFixture,
      buildThresholdDraft("NonMappe", "cost", "sum", "lower_is_better", "healthy")
    );

    expect(result.value).toBe(12800);
    expect(result.status).toBe("healthy");
  });

  it("classe un KPI lower_is_better en surveillance", () => {
    const result = calculateLocalKpiFromImport(
      localImportFixture,
      buildThresholdDraft("NonMappe", "cost", "sum", "lower_is_better", "watch")
    );

    expect(result.status).toBe("watch");
  });

  it("classe un KPI lower_is_better critique", () => {
    const result = calculateLocalKpiFromImport(
      localImportFixture,
      buildThresholdDraft("NonMappe", "cost", "sum", "lower_is_better", "critical")
    );

    expect(result.status).toBe("critical");
  });
});
