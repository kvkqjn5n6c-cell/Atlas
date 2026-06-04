import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMapping, updateMapping } from "@/lib/connectors/sql/sql-mapping-engine";
import { createPreparedSqlSource } from "@/lib/connectors/sql/sql-prepared-source-engine";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import type { SqlTableInfo, SqlTablePreviewResult } from "@/lib/connectors/sql/sql-types";
import {
  createDatasetFromPreparedSource,
  getDatasetStatistics,
  summarizeDataset,
  validateDataset
} from "@/lib/datasets/atlas-dataset-engine";
import {
  clearDatasets,
  getDatasetById,
  getDatasets,
  saveDataset
} from "@/lib/local/atlas-datasets-store";

const table: SqlTableInfo = {
  schema: "dbo",
  name: "interventions",
  type: "table",
  columns: [
    { name: "date_intervention", dataType: "date", nullable: false, ordinalPosition: 1 },
    { name: "client", dataType: "varchar", nullable: false, ordinalPosition: 2 },
    { name: "region", dataType: "varchar", nullable: true, ordinalPosition: 3 },
    { name: "cout_sous_traitance", dataType: "decimal", nullable: true, ordinalPosition: 4 },
    { name: "commentaire_interne", dataType: "varchar", nullable: true, ordinalPosition: 5 }
  ]
};

function preview(rows: SqlTablePreviewResult["rows"]): SqlTablePreviewResult {
  return {
    provider: "postgresql",
    tableName: table.name,
    schema: table.schema,
    columns: table.columns,
    rows,
    rowLimit: 100,
    readAt: "2026-06-01T10:00:00.000Z"
  };
}

function preparedSource(): PreparedSqlSourceBundle {
  const mapping = updateMapping({
    mapping: createMapping({ connectionId: "sql-demo", table }),
    sourceColumn: "commentaire_interne",
    enabled: false
  });

  return createPreparedSqlSource(
    mapping,
    table,
    preview([
      {
        date_intervention: "2026-05-01",
        client: "Client A",
        region: "Est",
        cout_sous_traitance: 1250,
        commentaire_interne: "ignore"
      },
      {
        date_intervention: "2026-05-08",
        client: "Client B",
        region: "",
        cout_sous_traitance: null,
        commentaire_interne: "ignore"
      }
    ])
  );
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

describe("atlas dataset engine", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cree un dataset Atlas depuis une source SQL preparee", () => {
    const dataset = createDatasetFromPreparedSource(preparedSource());

    expect(dataset.sourceId).toContain("prepared-sql");
    expect(dataset.rowCount).toBe(2);
    expect(dataset.fields.map((field) => field.key)).toEqual(expect.arrayContaining(["date", "client", "region", "cost"]));
    expect(dataset.records[0].values.client).toBe("Client A");
  });

  it("exclut les colonnes non mappees ou desactivees", () => {
    const dataset = createDatasetFromPreparedSource(preparedSource());

    expect(dataset.fields.map((field) => field.sourceColumn)).not.toContain("commentaire_interne");
    expect(dataset.records[0].values).not.toHaveProperty("commentaire_interne");
  });

  it("calcule les statistiques et valeurs manquantes", () => {
    const dataset = createDatasetFromPreparedSource(preparedSource());
    const statistics = getDatasetStatistics(dataset);

    expect(statistics.totalRows).toBe(2);
    expect(statistics.totalFields).toBe(4);
    expect(statistics.missingValues).toBe(2);
    expect(statistics.completeness).toBe(75);
    expect(statistics.warnings.some((warning) => warning.includes("valeur"))).toBe(true);
  });

  it("produit un score qualite borne et une validation", () => {
    const dataset = createDatasetFromPreparedSource(preparedSource());
    const validation = validateDataset(dataset);

    expect(validation.valid).toBe(true);
    expect(validation.qualityScore).toBeGreaterThanOrEqual(0);
    expect(validation.qualityScore).toBeLessThanOrEqual(100);
  });

  it("resume le dataset", () => {
    const dataset = createDatasetFromPreparedSource(preparedSource());
    const summary = summarizeDataset(dataset);

    expect(summary.executiveSummary).toContain("ligne(s) preview");
    expect(summary.technicalSummary).toContain("score qualite");
  });

  it("sauvegarde et recupere les datasets localement", () => {
    const dataset = createDatasetFromPreparedSource(preparedSource());
    const saved = saveDataset(dataset);

    expect(getDatasets()).toHaveLength(1);
    expect(getDatasetById(saved.id)?.displayName).toBe(dataset.displayName);

    clearDatasets();
    expect(getDatasets()).toHaveLength(0);
  });
});
