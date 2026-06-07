import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMapping } from "@/lib/connectors/sql/sql-mapping-engine";
import { createPreparedSqlSource } from "@/lib/connectors/sql/sql-prepared-source-engine";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import type { SqlTableInfo, SqlTablePreviewResult } from "@/lib/connectors/sql/sql-types";
import {
  getPreparedSqlSources,
  savePreparedSqlSource
} from "@/lib/local/sql-prepared-sources-store";
import {
  deletePreparedSqlSourceData,
  getPreparedSqlSourceByIdData,
  getPreparedSqlSourcesData,
  savePreparedSqlSourceData
} from "@/lib/services/prepared-sql-sources.service";

const prismaMock = vi.hoisted(() => ({
  preparedSqlSource: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

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
    clear: vi.fn(() => store.clear())
  };
}

const table: SqlTableInfo = {
  schema: "dbo",
  name: "interventions",
  type: "table",
  columns: [
    { name: "date_intervention", dataType: "date", nullable: false, ordinalPosition: 1 },
    { name: "client", dataType: "varchar", nullable: false, ordinalPosition: 2 },
    { name: "cout", dataType: "decimal", nullable: true, ordinalPosition: 3 }
  ]
};

const preview: SqlTablePreviewResult = {
  provider: "postgresql",
  tableName: table.name,
  schema: table.schema,
  columns: table.columns,
  rows: [{ date_intervention: "2026-06-01", client: "Client A", cout: 1200 }],
  rowLimit: 100,
  readAt: "2026-06-01T10:00:00.000Z"
};

function preparedSource(): PreparedSqlSourceBundle {
  return createPreparedSqlSource(createMapping({ connectionId: "sql-demo", table }), table, preview);
}

function prismaPreparedSourceRecord(bundle: PreparedSqlSourceBundle) {
  return {
    ...bundle.source,
    schema: bundle.source.schema ?? null,
    mappedFields: bundle.source.mappedFields,
    availableAtlasFields: bundle.source.availableAtlasFields,
    preview: bundle.preview,
    createdAt: new Date(bundle.source.createdAt),
    updatedAt: new Date(bundle.source.updatedAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("prepared SQL source persistence v1", () => {
  it("sauvegarde une source preparee en mode local", async () => {
    const result = await savePreparedSqlSourceData(preparedSource());

    expect(result.source).toBe("local");
    expect(getPreparedSqlSources()).toHaveLength(1);
    expect(getPreparedSqlSources()[0].source.displayName).toBe("dbo.interventions");
  });

  it("lit une source preparee en mode local", async () => {
    const saved = savePreparedSqlSource(preparedSource());

    const result = await getPreparedSqlSourceByIdData(saved.source.id);

    expect(result.source).toBe("local");
    expect(result.data?.source.id).toBe(saved.source.id);
  });

  it("lit les sources preparees en mode local", async () => {
    const saved = savePreparedSqlSource(preparedSource());

    const result = await getPreparedSqlSourcesData(saved.source.organizationId);

    expect(result.source).toBe("local");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].source.id).toBe(saved.source.id);
  });

  it("lit les sources preparees en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const bundle = preparedSource();
    prismaMock.preparedSqlSource.findMany.mockResolvedValueOnce([prismaPreparedSourceRecord(bundle)]);

    const result = await getPreparedSqlSourcesData(bundle.source.organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.preparedSqlSource.findMany).toHaveBeenCalledOnce();
    expect(result.data[0].source.id).toBe(bundle.source.id);
  });

  it("retombe en local si la lecture Prisma des sources preparees echoue", async () => {
    const saved = savePreparedSqlSource(preparedSource());
    process.env.DATA_MODE = "prisma";
    prismaMock.preparedSqlSource.findMany.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await getPreparedSqlSourcesData(saved.source.organizationId);

    expect(result.source).toBe("fallback");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].source.id).toBe(saved.source.id);
  });

  it("sauvegarde une source preparee en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const bundle = preparedSource();
    prismaMock.preparedSqlSource.upsert.mockResolvedValueOnce(prismaPreparedSourceRecord(bundle));

    const result = await savePreparedSqlSourceData(bundle);

    expect(result.source).toBe("prisma");
    expect(prismaMock.preparedSqlSource.upsert).toHaveBeenCalledOnce();
    expect(result.data.source.mappingId).toBe(bundle.source.mappingId);
  });

  it("retombe en local si Prisma echoue", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.preparedSqlSource.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await savePreparedSqlSourceData(preparedSource());

    expect(result.source).toBe("fallback");
    expect(getPreparedSqlSources()).toHaveLength(1);
  });

  it("supprime une source preparee en mode local", async () => {
    const saved = savePreparedSqlSource(preparedSource());

    const result = await deletePreparedSqlSourceData(saved.source.id);

    expect(result.source).toBe("local");
    expect(getPreparedSqlSources()).toHaveLength(0);
  });
});
