import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteLocalKpiSnapshotAction } from "@/lib/actions/local-kpi-persistence-actions";
import { getLocalKpiHistory } from "@/lib/local/local-kpi-history-store";
import { getLocalKpiResults } from "@/lib/local/local-kpi-results-store";
import { getLocalKpiConfigurations } from "@/lib/local/local-kpi-store";
import { saveLocalKpiConfigurationData } from "@/lib/services/local-kpi.service";
import { saveLocalKpiHistoryPointData } from "@/lib/services/local-kpi-history.service";
import { deleteLocalKpiResultsByKpiData, saveLocalKpiResultData } from "@/lib/services/local-kpi-results.service";
import type { LocalKpiConfiguration } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";

const prismaMock = vi.hoisted(() => ({
  localKpiConfiguration: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  },
  localKpiResult: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn()
  },
  localKpiHistoryPoint: {
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
const now = "2026-06-01T10:00:00.000Z";

function localKpi(overrides: Partial<LocalKpiConfiguration> = {}): LocalKpiConfiguration {
  return {
    id: "local-kpi-1",
    name: "Somme cout sous-traitance",
    organizationId,
    importId: "import-1",
    sourceFileName: "nova.csv",
    importCreatedAt: now,
    createdAt: now,
    category: "margin",
    calculationType: "sum",
    direction: "lower_is_better",
    primaryField: "NonMappe",
    sourceColumn: "cout_sous_traitance",
    fieldType: "custom",
    customFieldLabel: "Cout sous-traitance",
    displayFieldLabel: "Cout sous-traitance",
    targetValue: 8000,
    warningThreshold: 10000,
    criticalThreshold: 12000,
    frequency: "monthly",
    owner: "Direction operations",
    expectedImpact: "Reduire les couts de sous-traitance.",
    testResult: {
      value: 12800,
      rowsUsed: 3,
      ignoredRows: 0,
      status: "critical"
    },
    persisted: false,
    ...overrides
  };
}

function kpiResult(overrides: Partial<LocalKpiResult> = {}): LocalKpiResult {
  return {
    id: "local-kpi-result-local-kpi-1",
    kpiId: "local-kpi-1",
    importId: "import-1",
    name: "Somme cout sous-traitance",
    displayFieldLabel: "Cout sous-traitance",
    calculationType: "sum",
    direction: "lower_is_better",
    value: 12800,
    targetValue: 8000,
    warningThreshold: 10000,
    criticalThreshold: 12000,
    status: "critical",
    calculatedAt: now,
    sourceFileName: "nova.csv",
    persisted: false,
    ...overrides
  };
}

function historyPoint(overrides: Partial<LocalKpiHistoryPoint> = {}): LocalKpiHistoryPoint {
  return {
    id: "local-kpi-history-local-kpi-1-1",
    kpiId: "local-kpi-1",
    importId: "import-1",
    calculatedAt: now,
    value: 12800,
    status: "critical",
    direction: "lower_is_better",
    targetValue: 8000,
    warningThreshold: 10000,
    criticalThreshold: 12000,
    sourceFileName: "nova.csv",
    persisted: false,
    ...overrides
  };
}

function prismaKpiRecord(input: LocalKpiConfiguration) {
  return {
    ...input,
    businessDictionaryFieldId: null,
    importId: input.importId ?? null,
    secondaryField: input.secondaryField ?? null,
    sourceColumn: input.sourceColumn ?? null,
    secondarySourceColumn: input.secondarySourceColumn ?? null,
    fieldType: input.fieldType ?? null,
    customFieldLabel: input.customFieldLabel ?? null,
    displayFieldLabel: input.displayFieldLabel ?? null,
    filterField: input.filterField ?? null,
    filterValue: input.filterValue ?? null,
    direction: "LOWER_IS_BETTER",
    thresholdChanges: input.thresholdChanges ?? null,
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.createdAt)
  };
}

function prismaResultRecord(input: LocalKpiResult) {
  return {
    ...input,
    importId: input.importId ?? null,
    displayFieldLabel: input.displayFieldLabel ?? null,
    targetValue: input.targetValue ?? null,
    warningThreshold: input.warningThreshold ?? null,
    criticalThreshold: input.criticalThreshold ?? null,
    trend: input.trend ?? null,
    variation: input.variation ?? null,
    direction: "LOWER_IS_BETTER",
    calculatedAt: new Date(input.calculatedAt),
    createdAt: new Date(input.calculatedAt),
    updatedAt: new Date(input.calculatedAt)
  };
}

function prismaHistoryRecord(input: LocalKpiHistoryPoint) {
  return {
    ...input,
    importId: input.importId ?? null,
    targetValue: input.targetValue ?? null,
    warningThreshold: input.warningThreshold ?? null,
    criticalThreshold: input.criticalThreshold ?? null,
    sourceFileName: input.sourceFileName ?? null,
    trend: input.trend ?? null,
    variation: input.variation ?? null,
    direction: "LOWER_IS_BETTER",
    calculatedAt: new Date(input.calculatedAt),
    createdAt: new Date(input.calculatedAt),
    updatedAt: new Date(input.calculatedAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("kpi engine persistence v1", () => {
  it("cree une configuration KPI locale en mode local", async () => {
    const result = await saveLocalKpiConfigurationData(localKpi());

    expect(result.source).toBe("local");
    expect(getLocalKpiConfigurations()).toHaveLength(1);
    expect(getLocalKpiConfigurations()[0].direction).toBe("lower_is_better");
  });

  it("cree un resultat KPI en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localKpiResult.upsert.mockResolvedValueOnce(prismaResultRecord(kpiResult()));

    const result = await saveLocalKpiResultData(kpiResult(), organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.localKpiResult.upsert).toHaveBeenCalledOnce();
    expect(result.data.status).toBe("critical");
  });

  it("ajoute un point d'historique en fallback local si Prisma echoue", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localKpiHistoryPoint.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveLocalKpiHistoryPointData(historyPoint(), organizationId);

    expect(result.source).toBe("fallback");
    expect(getLocalKpiHistory()).toHaveLength(1);
  });

  it("supprime les resultats KPI par kpiId en mode prisma", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localKpiResult.deleteMany.mockResolvedValueOnce({ count: 1 });

    const result = await deleteLocalKpiResultsByKpiData("local-kpi-1");

    expect(result.source).toBe("prisma");
    expect(prismaMock.localKpiResult.deleteMany).toHaveBeenCalledWith({ where: { kpiId: "local-kpi-1" } });
  });

  it("supprime un snapshot KPI local avec configuration, resultat et historique", async () => {
    await saveLocalKpiConfigurationData(localKpi());
    await saveLocalKpiResultData(kpiResult(), organizationId);
    await saveLocalKpiHistoryPointData(historyPoint(), organizationId);

    await deleteLocalKpiSnapshotAction({ kpiId: "local-kpi-1" });

    expect(getLocalKpiConfigurations()).toHaveLength(0);
    expect(getLocalKpiResults()).toHaveLength(0);
    expect(getLocalKpiHistory()).toHaveLength(0);
  });

  it("retombe en local si Prisma echoue pour une configuration KPI", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localKpiConfiguration.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveLocalKpiConfigurationData(localKpi());

    expect(result.source).toBe("fallback");
    expect(getLocalKpiConfigurations()).toHaveLength(1);
  });

  it("cree une configuration KPI en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localKpiConfiguration.upsert.mockResolvedValueOnce(prismaKpiRecord(localKpi()));

    const result = await saveLocalKpiConfigurationData(localKpi());

    expect(result.source).toBe("prisma");
    expect(prismaMock.localKpiConfiguration.upsert).toHaveBeenCalledOnce();
    expect(result.data.name).toBe("Somme cout sous-traitance");
  });

  it("ajoute un point d'historique en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localKpiHistoryPoint.upsert.mockResolvedValueOnce(prismaHistoryRecord(historyPoint()));

    const result = await saveLocalKpiHistoryPointData(historyPoint(), organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.localKpiHistoryPoint.upsert).toHaveBeenCalledOnce();
    expect(result.data.kpiId).toBe("local-kpi-1");
  });
});
