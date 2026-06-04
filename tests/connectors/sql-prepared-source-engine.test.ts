import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMapping, updateMapping } from "@/lib/connectors/sql/sql-mapping-engine";
import {
  createPreparedSqlSource,
  getAvailableAtlasFields,
  summarizePreparedSqlSource,
  validatePreparedSqlSource
} from "@/lib/connectors/sql/sql-prepared-source-engine";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import type { SqlTableInfo, SqlTablePreviewResult } from "@/lib/connectors/sql/sql-types";
import {
  clearPreparedSqlSources,
  getPreparedSqlSourceById,
  getPreparedSqlSources,
  savePreparedSqlSource
} from "@/lib/local/sql-prepared-sources-store";

const table: SqlTableInfo = {
  schema: "dbo",
  name: "interventions",
  type: "table",
  columns: [
    { name: "date_intervention", dataType: "date", nullable: false, ordinalPosition: 1 },
    { name: "client", dataType: "varchar", nullable: false, ordinalPosition: 2 },
    { name: "region", dataType: "varchar", nullable: true, ordinalPosition: 3 },
    { name: "cout_sous_traitance", dataType: "decimal", nullable: true, ordinalPosition: 4 }
  ]
};

const preview: SqlTablePreviewResult = {
  provider: "postgresql",
  tableName: "interventions",
  schema: "dbo",
  columns: table.columns,
  rows: [
    {
      date_intervention: "2026-05-01",
      client: "Client A",
      region: "Est",
      cout_sous_traitance: 1250
    }
  ],
  rowLimit: 100,
  readAt: "2026-06-01T10:00:00.000Z"
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

describe("sql prepared source engine", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cree une source preparee depuis un mapping valide", () => {
    const mapping = createMapping({ connectionId: "sql-demo", table });
    const prepared = createPreparedSqlSource(mapping, table, preview);

    expect(prepared.source.tableName).toBe("interventions");
    expect(prepared.source.mappingId).toBe(mapping.tableMapping.id);
    expect(prepared.source.qualityScore).toBeGreaterThanOrEqual(80);
    expect(prepared.source.rowPreviewCount).toBe(1);
    expect(prepared.preview.limitedTo).toBe(100);
  });

  it("exclut les colonnes desactivees", () => {
    const mapping = createMapping({ connectionId: "sql-demo", table });
    const disabled = updateMapping({
      mapping,
      sourceColumn: "region",
      enabled: false
    });
    const prepared = createPreparedSqlSource(disabled, table, preview);

    expect(prepared.source.mappedFields.map((field) => field.sourceColumn)).not.toContain("region");
  });

  it("expose les champs Atlas disponibles", () => {
    const mapping = createMapping({ connectionId: "sql-demo", table });
    const prepared = createPreparedSqlSource(mapping, table, preview);

    expect(getAvailableAtlasFields(prepared.source).map((field) => field.key)).toEqual(
      expect.arrayContaining(["date", "client", "region", "cost"])
    );
  });

  it("genere des warnings si les champs cles sont absents", () => {
    const mapping = createMapping({
      connectionId: "sql-demo",
      table: {
        ...table,
        columns: table.columns.filter((column) => column.name !== "date_intervention")
      }
    });
    const prepared = createPreparedSqlSource(mapping, table, preview);

    expect(prepared.source.warnings.some((warning) => warning.includes("Date"))).toBe(true);
    expect(validatePreparedSqlSource(prepared.source).warnings.length).toBeGreaterThan(0);
  });

  it("resume une source preparee", () => {
    const mapping = createMapping({ connectionId: "sql-demo", table });
    const prepared = createPreparedSqlSource(mapping, table, preview);
    const summary = summarizePreparedSqlSource(prepared.source);

    expect(summary.title).toBe("dbo.interventions");
    expect(summary.summary).toContain("score qualite");
    expect(summary.fields).toContain("Date");
  });

  it("sauvegarde et recupere les sources preparees localement", () => {
    const mapping = createMapping({ connectionId: "sql-demo", table });
    const prepared: PreparedSqlSourceBundle = createPreparedSqlSource(mapping, table, preview);

    const saved = savePreparedSqlSource(prepared);

    expect(getPreparedSqlSources()).toHaveLength(1);
    expect(getPreparedSqlSourceById(saved.source.id)?.source.displayName).toBe("dbo.interventions");

    clearPreparedSqlSources();
    expect(getPreparedSqlSources()).toHaveLength(0);
  });
});
