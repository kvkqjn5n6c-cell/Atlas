import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import {
  convertToLocalKpi,
  createDatasetKpi,
  previewDatasetKpi,
  validateDatasetKpi
} from "@/lib/datasets/dataset-kpi-engine";
import {
  clearDatasetKpis,
  getDatasetKpis,
  saveDatasetKpi
} from "@/lib/local/dataset-kpi-store";

const dataset: AtlasDataset = {
  id: "atlas-dataset-demo",
  sourceId: "prepared-sql-demo",
  displayName: "Dataset Atlas - dbo.interventions",
  rowCount: 3,
  fields: [
    { key: "client", label: "Client", sourceColumn: "client", sourceType: "varchar", atlasType: "text" },
    { key: "amount", label: "Montant", sourceColumn: "montant_ht", sourceType: "decimal", atlasType: "number" },
    { key: "cost", label: "Coût", sourceColumn: "cout_sous_traitance", sourceType: "decimal", atlasType: "number" },
    { key: "status", label: "Statut", sourceColumn: "statut", sourceType: "varchar", atlasType: "text" }
  ],
  records: [
    { id: "row-1", values: { client: "Client A", amount: 4200, cost: 1200, status: "ok" } },
    { id: "row-2", values: { client: "Client B", amount: 5100, cost: 800, status: "ok" } },
    { id: "row-3", values: { client: "Client C", amount: 3000, cost: null, status: "ko" } }
  ],
  qualityScore: 88,
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

describe("dataset kpi engine", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calcule un COUNT", () => {
    const definition = createDatasetKpi({ dataset, name: "Nombre interventions", aggregation: "count" });
    const preview = previewDatasetKpi(dataset, definition);

    expect(preview.value).toBe(3);
    expect(preview.rowCount).toBe(3);
    expect(validateDatasetKpi(dataset, definition).valid).toBe(true);
  });

  it("calcule une SUM", () => {
    const definition = createDatasetKpi({ dataset, name: "CA", aggregation: "sum", field: "amount" });
    const preview = previewDatasetKpi(dataset, definition);

    expect(preview.value).toBe(12300);
    expect(preview.rowCount).toBe(3);
  });

  it("calcule une AVERAGE", () => {
    const definition = createDatasetKpi({ dataset, name: "Coût moyen", aggregation: "average", field: "cost" });
    const preview = previewDatasetKpi(dataset, definition);

    expect(preview.value).toBe(1000);
    expect(preview.rowCount).toBe(2);
  });

  it("calcule un RATIO", () => {
    const definition = createDatasetKpi({
      dataset,
      name: "Ratio coût / CA",
      aggregation: "ratio",
      field: "cost",
      secondaryField: "amount"
    });
    const preview = previewDatasetKpi(dataset, definition);

    expect(preview.value).toBe(0.16);
    expect(preview.rowCount).toBe(2);
  });

  it("valide les champs numeriques requis", () => {
    const definition = createDatasetKpi({ dataset, name: "Somme client", aggregation: "sum", field: "client" });
    const validation = validateDatasetKpi(dataset, definition);

    expect(validation.valid).toBe(false);
    expect(validation.errors.join(" ")).toContain("numerique");
  });

  it("convertit une definition en KPI local compatible Atlas", () => {
    const definition = createDatasetKpi({ dataset, name: "Somme coût sous-traitance", aggregation: "sum", field: "cost" });
    const converted = convertToLocalKpi({ dataset, definition });

    expect(converted.kpi.name).toBe("Somme coût sous-traitance");
    expect(converted.kpi.sourceFileName).toBe(dataset.displayName);
    expect(converted.kpi.importId).toBeUndefined();
    expect(converted.result.value).toBe(2000);
    expect(converted.historyPoint.kpiId).toBe(converted.kpi.id);
  });

  it("sauvegarde les definitions KPI dataset localement", () => {
    const definition = createDatasetKpi({ dataset, name: "Nombre interventions", aggregation: "count" });

    saveDatasetKpi(definition);

    expect(getDatasetKpis()).toHaveLength(1);
    expect(getDatasetKpis()[0].name).toBe("Nombre interventions");

    clearDatasetKpis();
    expect(getDatasetKpis()).toHaveLength(0);
  });
});
