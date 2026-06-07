import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";
import {
  getDatasetFilterSets,
  saveDatasetFilterSet
} from "@/lib/local/dataset-filters-store";
import {
  deleteDatasetFilterSetsByDatasetData,
  getDatasetFilterSetByIdData,
  getDatasetFilterSetsData,
  saveDatasetFilterSetData
} from "@/lib/services/dataset-filters.service";

const prismaMock = vi.hoisted(() => ({
  datasetFilterSet: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn()
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

const organizationId = "org-atlas-demo";
const createdAt = "2026-06-01T10:00:00.000Z";

function filterSet(overrides: Partial<DatasetFilterSet> = {}): DatasetFilterSet {
  return {
    id: "dataset-filter-set-1",
    datasetId: "dataset-1",
    name: "Region Est",
    filters: [{ id: "filter-1", field: "region", operator: "EQUALS", value: "Est" }],
    createdAt,
    ...overrides
  };
}

function prismaFilterSetRecord(input: DatasetFilterSet) {
  return {
    ...input,
    organizationId,
    datasetId: input.datasetId ?? null,
    filters: input.filters,
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.createdAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("dataset filters persistence v1", () => {
  it("sauvegarde un jeu de filtres en mode local", async () => {
    const result = await saveDatasetFilterSetData(filterSet(), organizationId);

    expect(result.source).toBe("local");
    expect(getDatasetFilterSets()).toHaveLength(1);
    expect(getDatasetFilterSets()[0].datasetId).toBe("dataset-1");
  });

  it("lit les jeux de filtres en mode local", async () => {
    const saved = saveDatasetFilterSet(filterSet());

    const result = await getDatasetFilterSetsData();

    expect(result.source).toBe("local");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(saved.id);
  });

  it("lit un jeu de filtres par id en mode local", async () => {
    const saved = saveDatasetFilterSet(filterSet());

    const result = await getDatasetFilterSetByIdData(saved.id);

    expect(result.source).toBe("local");
    expect(result.data?.id).toBe(saved.id);
  });

  it("lit les jeux de filtres en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const input = filterSet();
    prismaMock.datasetFilterSet.findMany.mockResolvedValueOnce([prismaFilterSetRecord(input)]);

    const result = await getDatasetFilterSetsData();

    expect(result.source).toBe("prisma");
    expect(prismaMock.datasetFilterSet.findMany).toHaveBeenCalledOnce();
    expect(result.data[0].id).toBe(input.id);
  });

  it("retombe en local si la lecture Prisma des filtres echoue", async () => {
    const saved = saveDatasetFilterSet(filterSet());
    process.env.DATA_MODE = "prisma";
    prismaMock.datasetFilterSet.findMany.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await getDatasetFilterSetsData();

    expect(result.source).toBe("fallback");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(saved.id);
  });

  it("supprime les filtres d'un dataset en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.datasetFilterSet.deleteMany.mockResolvedValueOnce({ count: 1 });

    const result = await deleteDatasetFilterSetsByDatasetData("dataset-1");

    expect(result.source).toBe("prisma");
    expect(prismaMock.datasetFilterSet.deleteMany).toHaveBeenCalledWith({ where: { datasetId: "dataset-1" } });
  });
});
