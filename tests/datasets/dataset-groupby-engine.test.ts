import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import { applyDatasetFilters } from "@/lib/datasets/dataset-filter-engine";
import { groupDataset, summarizeGroupBy, validateGroupBy } from "@/lib/datasets/dataset-groupby-engine";
import {
  clearDatasetGroupByAnalyses,
  getDatasetGroupByAnalyses,
  saveDatasetGroupByAnalysis
} from "@/lib/local/dataset-groupby-store";

const dataset: AtlasDataset = {
  id: "dataset-demo",
  sourceId: "prepared-demo",
  displayName: "Dataset Atlas - interventions",
  rowCount: 5,
  fields: [
    { key: "region", label: "Région", sourceColumn: "region", sourceType: "varchar", atlasType: "text" },
    { key: "agency", label: "Agence", sourceColumn: "agency", sourceType: "varchar", atlasType: "text" },
    { key: "cost", label: "Coût", sourceColumn: "cost", sourceType: "decimal", atlasType: "number" }
  ],
  records: [
    { id: "row-1", values: { region: "Est", agency: "A1", cost: 100 } },
    { id: "row-2", values: { region: "Est", agency: "A2", cost: 300 } },
    { id: "row-3", values: { region: "Ouest", agency: "A3", cost: 200 } },
    { id: "row-4", values: { region: "Ouest", agency: "A4", cost: 600 } },
    { id: "row-5", values: { region: "Nord", agency: "A5", cost: null } }
  ],
  qualityScore: 90,
  warnings: [],
  createdAt: "2026-06-01T10:00:00.000Z"
};

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    })
  };
}

describe("dataset group by engine", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calcule un COUNT par groupe", () => {
    const analysis = groupDataset({ dataset, aggregation: "count", groupedByField: "region" });

    expect(analysis.results.find((result) => result.groupValue === "Est")?.value).toBe(2);
    expect(analysis.results).toHaveLength(3);
  });

  it("calcule une SUM par groupe", () => {
    const analysis = groupDataset({ dataset, aggregation: "sum", field: "cost", groupedByField: "region" });

    expect(analysis.results.find((result) => result.groupValue === "Ouest")?.value).toBe(800);
  });

  it("calcule une AVERAGE par groupe", () => {
    const analysis = groupDataset({ dataset, aggregation: "average", field: "cost", groupedByField: "region" });

    expect(analysis.results.find((result) => result.groupValue === "Est")?.value).toBe(200);
  });

  it("fonctionne apres filtres", () => {
    const filtered = applyDatasetFilters(dataset, {
      id: "filter-east",
      datasetId: dataset.id,
      name: "Est uniquement",
      filters: [{ id: "f1", field: "region", operator: "EQUALS", value: "Est" }],
      createdAt: "2026-06-01T10:00:00.000Z"
    }).dataset;
    const analysis = groupDataset({ dataset: filtered, aggregation: "sum", field: "cost", groupedByField: "agency" });

    expect(analysis.results).toHaveLength(2);
    expect(analysis.results[0].value).toBe(300);
  });

  it("identifie meilleur et pire groupe", () => {
    const analysis = groupDataset({ dataset, aggregation: "sum", field: "cost", groupedByField: "region" });
    const summary = summarizeGroupBy(analysis);

    expect(summary.bestGroup?.groupValue).toBe("Ouest");
    expect(summary.worstGroup?.groupValue).toBe("Nord");
    expect(summary.gap).toBe(800);
  });

  it("gere un dataset vide", () => {
    const emptyDataset = { ...dataset, records: [], rowCount: 0 };
    const validation = validateGroupBy({ dataset: emptyDataset, aggregation: "count", groupedByField: "region" });
    const analysis = groupDataset({ dataset: emptyDataset, aggregation: "count", groupedByField: "region" });

    expect(validation.valid).toBe(false);
    expect(analysis.results).toHaveLength(0);
  });

  it("sauvegarde les analyses localement", () => {
    const analysis = groupDataset({ dataset, aggregation: "count", groupedByField: "region" });

    saveDatasetGroupByAnalysis(analysis);

    expect(getDatasetGroupByAnalyses()).toHaveLength(1);

    clearDatasetGroupByAnalyses();
    expect(getDatasetGroupByAnalyses()).toHaveLength(0);
  });
});
