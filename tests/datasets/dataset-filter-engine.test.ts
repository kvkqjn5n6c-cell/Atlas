import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import { applyDatasetFilters, summarizeDatasetFilters, validateDatasetFilters } from "@/lib/datasets/dataset-filter-engine";
import type { DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";
import {
  clearDatasetFilterSets,
  getDatasetFilterSets,
  saveDatasetFilterSet
} from "@/lib/local/dataset-filters-store";

const dataset: AtlasDataset = {
  id: "dataset-demo",
  sourceId: "prepared-demo",
  displayName: "Dataset Atlas - interventions",
  rowCount: 4,
  fields: [
    { key: "client", label: "Client", sourceColumn: "client", sourceType: "varchar", atlasType: "text" },
    { key: "region", label: "Région", sourceColumn: "region", sourceType: "varchar", atlasType: "text" },
    { key: "amount", label: "Montant", sourceColumn: "montant", sourceType: "decimal", atlasType: "number" },
    { key: "status", label: "Statut", sourceColumn: "status", sourceType: "varchar", atlasType: "text" }
  ],
  records: [
    { id: "row-1", values: { client: "Client A", region: "Est", amount: 4200, status: "ok" } },
    { id: "row-2", values: { client: "Client B", region: "Ouest", amount: 5100, status: "ok" } },
    { id: "row-3", values: { client: "Client C", region: "Est", amount: 800, status: "" } },
    { id: "row-4", values: { client: "Alpha Services", region: "", amount: 1200, status: "ko" } }
  ],
  qualityScore: 90,
  warnings: [],
  createdAt: "2026-06-01T10:00:00.000Z"
};

function filterSet(filters: DatasetFilterSet["filters"]): DatasetFilterSet {
  return {
    id: "filter-set-demo",
    datasetId: dataset.id,
    name: "Filtre test",
    filters,
    createdAt: "2026-06-01T10:00:00.000Z"
  };
}

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

describe("dataset filter engine", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("filtre avec EQUALS", () => {
    const result = applyDatasetFilters(dataset, filterSet([
      { id: "f1", field: "region", operator: "EQUALS", value: "Est" }
    ]));

    expect(result.dataset.rowCount).toBe(2);
  });

  it("filtre avec CONTAINS", () => {
    const result = applyDatasetFilters(dataset, filterSet([
      { id: "f1", field: "client", operator: "CONTAINS", value: "alpha" }
    ]));

    expect(result.dataset.records[0].values.client).toBe("Alpha Services");
  });

  it("filtre avec GREATER_THAN", () => {
    const result = applyDatasetFilters(dataset, filterSet([
      { id: "f1", field: "amount", operator: "GREATER_THAN", value: "4000" }
    ]));

    expect(result.dataset.rowCount).toBe(2);
  });

  it("filtre avec LESS_THAN", () => {
    const result = applyDatasetFilters(dataset, filterSet([
      { id: "f1", field: "amount", operator: "LESS_THAN", value: "1000" }
    ]));

    expect(result.dataset.rowCount).toBe(1);
  });

  it("filtre les valeurs vides", () => {
    const result = applyDatasetFilters(dataset, filterSet([
      { id: "f1", field: "status", operator: "IS_EMPTY" }
    ]));

    expect(result.dataset.rowCount).toBe(1);
    expect(result.dataset.records[0].id).toBe("row-3");
  });

  it("combine plusieurs filtres", () => {
    const result = applyDatasetFilters(dataset, filterSet([
      { id: "f1", field: "region", operator: "EQUALS", value: "Est" },
      { id: "f2", field: "amount", operator: "GREATER_THAN", value: "1000" }
    ]));

    expect(result.dataset.rowCount).toBe(1);
    expect(result.dataset.records[0].id).toBe("row-1");
  });

  it("produit des statistiques de filtre", () => {
    const filters = filterSet([{ id: "f1", field: "region", operator: "EQUALS", value: "Est" }]);
    const result = applyDatasetFilters(dataset, filters);
    const summary = summarizeDatasetFilters(dataset, result.dataset, filters);

    expect(summary.totalRows).toBe(4);
    expect(summary.filteredRows).toBe(2);
    expect(summary.percentage).toBe(50);
  });

  it("valide les filtres numeriques", () => {
    const validation = validateDatasetFilters(dataset, filterSet([
      { id: "f1", field: "client", operator: "GREATER_THAN", value: "100" }
    ]));

    expect(validation.valid).toBe(false);
    expect(validation.errors.join(" ")).toContain("numerique");
  });

  it("sauvegarde les jeux de filtres localement", () => {
    saveDatasetFilterSet(filterSet([{ id: "f1", field: "region", operator: "EQUALS", value: "Est" }]));

    expect(getDatasetFilterSets()).toHaveLength(1);

    clearDatasetFilterSets();
    expect(getDatasetFilterSets()).toHaveLength(0);
  });
});
