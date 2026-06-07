import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDatasetGroupByAnalyses,
  saveDatasetGroupByAnalysis
} from "@/lib/local/dataset-groupby-store";
import {
  deleteDatasetGroupByAnalysesByDatasetData,
  getDatasetGroupByAnalysesData,
  getDatasetGroupByAnalysisByIdData,
  saveDatasetGroupByAnalysisData
} from "@/lib/services/dataset-groupby.service";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";

const prismaMock = vi.hoisted(() => ({
  datasetGroupByAnalysis: {
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
const generatedAt = "2026-06-01T10:00:00.000Z";

function analysis(overrides: Partial<DatasetGroupByAnalysis> = {}): DatasetGroupByAnalysis {
  return {
    id: "groupby-analysis-1",
    datasetId: "dataset-1",
    aggregation: "sum",
    field: "cost",
    groupedBy: {
      id: "groupby-region",
      datasetId: "dataset-1",
      field: "region",
      label: "Region",
      createdAt: generatedAt
    },
    results: [
      { groupValue: "Est", rowCount: 4, value: 12000, percentage: 60 },
      { groupValue: "Ouest", rowCount: 2, value: 4000, percentage: 40 }
    ],
    generatedAt,
    warnings: [],
    persisted: false,
    ...overrides
  };
}

function prismaAnalysisRecord(input: DatasetGroupByAnalysis) {
  return {
    ...input,
    organizationId,
    groupedBy: input.groupedBy,
    results: input.results,
    summary: { groupCount: input.results.length },
    generatedAt: new Date(input.generatedAt),
    createdAt: new Date(input.generatedAt),
    updatedAt: new Date(input.generatedAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("dataset group by persistence v1", () => {
  it("sauvegarde une analyse en mode local", async () => {
    const result = await saveDatasetGroupByAnalysisData(analysis(), organizationId);

    expect(result.source).toBe("local");
    expect(getDatasetGroupByAnalyses()).toHaveLength(1);
    expect(getDatasetGroupByAnalyses()[0].datasetId).toBe("dataset-1");
  });

  it("lit une analyse en mode local", async () => {
    const saved = saveDatasetGroupByAnalysis(analysis());

    const result = await getDatasetGroupByAnalysisByIdData(saved.id);

    expect(result.source).toBe("local");
    expect(result.data?.id).toBe(saved.id);
  });

  it("lit les analyses en mode local", async () => {
    const saved = saveDatasetGroupByAnalysis(analysis());

    const result = await getDatasetGroupByAnalysesData();

    expect(result.source).toBe("local");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(saved.id);
  });

  it("lit les analyses en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const input = analysis();
    prismaMock.datasetGroupByAnalysis.findMany.mockResolvedValueOnce([prismaAnalysisRecord(input)]);

    const result = await getDatasetGroupByAnalysesData();

    expect(result.source).toBe("prisma");
    expect(prismaMock.datasetGroupByAnalysis.findMany).toHaveBeenCalledOnce();
    expect(result.data[0].id).toBe(input.id);
  });

  it("retombe en local si la lecture Prisma des analyses echoue", async () => {
    const saved = saveDatasetGroupByAnalysis(analysis());
    process.env.DATA_MODE = "prisma";
    prismaMock.datasetGroupByAnalysis.findMany.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await getDatasetGroupByAnalysesData();

    expect(result.source).toBe("fallback");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(saved.id);
  });

  it("sauvegarde une analyse en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const input = analysis();
    prismaMock.datasetGroupByAnalysis.upsert.mockResolvedValueOnce(prismaAnalysisRecord(input));

    const result = await saveDatasetGroupByAnalysisData(input, organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.datasetGroupByAnalysis.upsert).toHaveBeenCalledOnce();
    expect(result.data.results).toHaveLength(2);
  });

  it("retombe en local si Prisma echoue", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.datasetGroupByAnalysis.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveDatasetGroupByAnalysisData(analysis(), organizationId);

    expect(result.source).toBe("fallback");
    expect(getDatasetGroupByAnalyses()).toHaveLength(1);
  });

  it("supprime les analyses d'un dataset en mode local", async () => {
    saveDatasetGroupByAnalysis(analysis());
    saveDatasetGroupByAnalysis(analysis({ id: "groupby-analysis-2", datasetId: "dataset-2" }));

    const result = await deleteDatasetGroupByAnalysesByDatasetData("dataset-1");

    expect(result.source).toBe("local");
    expect(getDatasetGroupByAnalyses()).toHaveLength(1);
    expect(getDatasetGroupByAnalyses()[0].datasetId).toBe("dataset-2");
  });

  it("supprime les analyses d'un dataset en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.datasetGroupByAnalysis.deleteMany.mockResolvedValueOnce({ count: 1 });

    const result = await deleteDatasetGroupByAnalysesByDatasetData("dataset-1");

    expect(result.source).toBe("prisma");
    expect(prismaMock.datasetGroupByAnalysis.deleteMany).toHaveBeenCalledWith({ where: { datasetId: "dataset-1" } });
  });
});
