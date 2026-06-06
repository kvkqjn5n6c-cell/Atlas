import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getGroupByInsights,
  saveGroupByInsights
} from "@/lib/local/dataset-groupby-insights-store";
import {
  deleteDatasetGroupByInsightsByAnalysisData,
  deleteDatasetGroupByInsightsByDatasetData,
  getDatasetGroupByInsightByIdData,
  saveDatasetGroupByInsightData,
  saveDatasetGroupByInsightsData
} from "@/lib/services/dataset-groupby-insights.service";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";

const prismaMock = vi.hoisted(() => ({
  datasetGroupByInsight: {
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

function insight(overrides: Partial<DatasetGroupByInsight> = {}): DatasetGroupByInsight {
  return {
    id: "groupby-insight-1",
    datasetId: "dataset-1",
    groupByAnalysisId: "groupby-analysis-1",
    title: "Est concentre les couts",
    summary: "La region Est concentre une part importante des couts.",
    insightType: "concentration",
    severity: "watch",
    groupValue: "Est",
    value: 12000,
    comparisonValue: 16000,
    gap: 75,
    reasons: ["Part du premier groupe superieure a 50%."],
    recommendedAction: "Analyser les causes operationnelles.",
    createdAt,
    persisted: false,
    ...overrides
  };
}

function prismaInsightRecord(input: DatasetGroupByInsight) {
  return {
    ...input,
    organizationId,
    comparisonValue: input.comparisonValue ?? null,
    gap: input.gap ?? null,
    recommendedAction: input.recommendedAction ?? null,
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.createdAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("dataset group by insights persistence v1", () => {
  it("sauvegarde un insight en mode local", async () => {
    const result = await saveDatasetGroupByInsightData(insight(), organizationId);

    expect(result.source).toBe("local");
    expect(getGroupByInsights()).toHaveLength(1);
    expect(getGroupByInsights()[0].insightType).toBe("concentration");
  });

  it("lit un insight en mode local", async () => {
    const saved = saveGroupByInsights([insight()])[0];

    const result = await getDatasetGroupByInsightByIdData(saved.id);

    expect(result.source).toBe("local");
    expect(result.data?.id).toBe(saved.id);
  });

  it("sauvegarde plusieurs insights en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const insights = [
      insight(),
      insight({ id: "groupby-insight-2", insightType: "weak_group", groupValue: "Ouest", value: 4000 })
    ];
    prismaMock.datasetGroupByInsight.upsert
      .mockResolvedValueOnce(prismaInsightRecord(insights[0]))
      .mockResolvedValueOnce(prismaInsightRecord(insights[1]));

    const result = await saveDatasetGroupByInsightsData(insights, organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.datasetGroupByInsight.upsert).toHaveBeenCalledTimes(2);
    expect(result.data).toHaveLength(2);
  });

  it("retombe en local si Prisma echoue", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.datasetGroupByInsight.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveDatasetGroupByInsightData(insight(), organizationId);

    expect(result.source).toBe("fallback");
    expect(getGroupByInsights()).toHaveLength(1);
  });

  it("supprime les insights par analysisId en mode local", async () => {
    saveGroupByInsights([
      insight(),
      insight({ id: "groupby-insight-2", groupByAnalysisId: "groupby-analysis-2" })
    ]);

    const result = await deleteDatasetGroupByInsightsByAnalysisData("groupby-analysis-1");

    expect(result.source).toBe("local");
    expect(getGroupByInsights()).toHaveLength(1);
    expect(getGroupByInsights()[0].groupByAnalysisId).toBe("groupby-analysis-2");
  });

  it("supprime les insights par dataset en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.datasetGroupByInsight.deleteMany.mockResolvedValueOnce({ count: 2 });

    const result = await deleteDatasetGroupByInsightsByDatasetData("dataset-1");

    expect(result.source).toBe("prisma");
    expect(prismaMock.datasetGroupByInsight.deleteMany).toHaveBeenCalledWith({ where: { datasetId: "dataset-1" } });
  });
});
