import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMapping } from "@/lib/connectors/sql/sql-mapping-engine";
import { createPreparedSqlSource } from "@/lib/connectors/sql/sql-prepared-source-engine";
import type { SqlTableInfo, SqlTablePreviewResult } from "@/lib/connectors/sql/sql-types";
import { createDatasetFromPreparedSource } from "@/lib/datasets/atlas-dataset-engine";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import {
  getDatasets,
  saveDataset
} from "@/lib/local/atlas-datasets-store";
import {
  deleteAtlasDatasetData,
  getAtlasDatasetByIdData,
  saveAtlasDatasetData
} from "@/lib/services/atlas-datasets.service";

const prismaMock = vi.hoisted(() => ({
  atlasDataset: {
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

function dataset(): AtlasDataset {
  return createDatasetFromPreparedSource(
    createPreparedSqlSource(createMapping({ connectionId: "sql-demo", table }), table, preview)
  );
}

function prismaDatasetRecord(input: AtlasDataset) {
  return {
    ...input,
    organizationId: "org-atlas-demo",
    fields: input.fields,
    records: input.records,
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.createdAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("atlas dataset persistence v1", () => {
  it("sauvegarde un dataset en mode local", async () => {
    const result = await saveAtlasDatasetData(dataset(), "org-atlas-demo");

    expect(result.source).toBe("local");
    expect(getDatasets()).toHaveLength(1);
    expect(getDatasets()[0].displayName).toContain("Dataset Atlas");
  });

  it("lit un dataset en mode local", async () => {
    const saved = saveDataset(dataset());

    const result = await getAtlasDatasetByIdData(saved.id);

    expect(result.source).toBe("local");
    expect(result.data?.id).toBe(saved.id);
  });

  it("sauvegarde un dataset en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const input = dataset();
    prismaMock.atlasDataset.upsert.mockResolvedValueOnce(prismaDatasetRecord(input));

    const result = await saveAtlasDatasetData(input, "org-atlas-demo");

    expect(result.source).toBe("prisma");
    expect(prismaMock.atlasDataset.upsert).toHaveBeenCalledOnce();
    expect(result.data.sourceId).toBe(input.sourceId);
  });

  it("retombe en local si Prisma echoue", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.atlasDataset.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveAtlasDatasetData(dataset(), "org-atlas-demo");

    expect(result.source).toBe("fallback");
    expect(getDatasets()).toHaveLength(1);
  });

  it("supprime un dataset en mode local", async () => {
    const saved = saveDataset(dataset());

    const result = await deleteAtlasDatasetData(saved.id);

    expect(result.source).toBe("local");
    expect(getDatasets()).toHaveLength(0);
  });
});
