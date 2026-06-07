import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
import {
  getDatasetKpis,
  saveDatasetKpi
} from "@/lib/local/dataset-kpi-store";
import {
  deleteDatasetKpiDefinitionsByDatasetData,
  getDatasetKpiDefinitionByIdData,
  getDatasetKpiDefinitionsData,
  saveDatasetKpiDefinitionData
} from "@/lib/services/dataset-kpi.service";

const prismaMock = vi.hoisted(() => ({
  datasetKpiDefinition: {
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

function definition(overrides: Partial<DatasetKpiDefinition> = {}): DatasetKpiDefinition {
  return {
    id: "dataset-kpi-1",
    datasetId: "dataset-1",
    name: "Cout moyen Est",
    description: "KPI genere depuis un Dataset Atlas.",
    type: "average",
    field: "cost",
    secondaryField: undefined,
    aggregation: "average",
    targetValue: 900,
    warningThreshold: 1100,
    criticalThreshold: 1300,
    filterSet: {
      id: "dataset-filter-set-1",
      datasetId: "dataset-1",
      name: "Region Est",
      filters: [{ id: "filter-1", field: "region", operator: "EQUALS", value: "Est" }],
      createdAt
    },
    filteredRowCount: 4,
    createdAt,
    persisted: false,
    ...overrides
  };
}

function prismaDefinitionRecord(input: DatasetKpiDefinition) {
  return {
    ...input,
    organizationId,
    secondaryField: input.secondaryField ?? null,
    targetValue: input.targetValue ?? null,
    warningThreshold: input.warningThreshold ?? null,
    criticalThreshold: input.criticalThreshold ?? null,
    filterSet: input.filterSet ?? null,
    filteredRowCount: input.filteredRowCount ?? null,
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.createdAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("dataset KPI persistence v1", () => {
  it("sauvegarde une definition KPI Dataset en mode local", async () => {
    const result = await saveDatasetKpiDefinitionData(definition(), organizationId);

    expect(result.source).toBe("local");
    expect(getDatasetKpis()).toHaveLength(1);
    expect(getDatasetKpis()[0].datasetId).toBe("dataset-1");
  });

  it("lit les definitions KPI Dataset en mode local", async () => {
    const saved = saveDatasetKpi(definition());

    const result = await getDatasetKpiDefinitionsData();

    expect(result.source).toBe("local");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(saved.id);
  });

  it("lit une definition KPI Dataset par id en mode local", async () => {
    const saved = saveDatasetKpi(definition());

    const result = await getDatasetKpiDefinitionByIdData(saved.id);

    expect(result.source).toBe("local");
    expect(result.data?.id).toBe(saved.id);
  });

  it("lit les definitions KPI Dataset en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const input = definition();
    prismaMock.datasetKpiDefinition.findMany.mockResolvedValueOnce([prismaDefinitionRecord(input)]);

    const result = await getDatasetKpiDefinitionsData();

    expect(result.source).toBe("prisma");
    expect(prismaMock.datasetKpiDefinition.findMany).toHaveBeenCalledOnce();
    expect(result.data[0].id).toBe(input.id);
  });

  it("retombe en local si la lecture Prisma des KPI Dataset echoue", async () => {
    const saved = saveDatasetKpi(definition());
    process.env.DATA_MODE = "prisma";
    prismaMock.datasetKpiDefinition.findMany.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await getDatasetKpiDefinitionsData();

    expect(result.source).toBe("fallback");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(saved.id);
  });

  it("supprime les definitions KPI d'un dataset en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.datasetKpiDefinition.deleteMany.mockResolvedValueOnce({ count: 1 });

    const result = await deleteDatasetKpiDefinitionsByDatasetData("dataset-1");

    expect(result.source).toBe("prisma");
    expect(prismaMock.datasetKpiDefinition.deleteMany).toHaveBeenCalledWith({ where: { datasetId: "dataset-1" } });
  });
});
