import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLocalAlertRules } from "@/lib/local/local-alert-rules-store";
import { getLocalAlertSnapshots } from "@/lib/local/local-alert-snapshots-store";
import {
  deleteLocalAlertRuleData,
  saveLocalAlertRuleData,
  toggleLocalAlertRuleData,
  updateLocalAlertRuleData
} from "@/lib/services/local-alert-rules.service";
import {
  saveLocalAlertSnapshotData,
  saveLocalAlertSnapshotsData
} from "@/lib/services/local-alert-snapshots.service";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { LocalAlertSnapshot } from "@/types/local-alert-snapshots";

const prismaMock = vi.hoisted(() => ({
  localAlertRule: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  },
  localAlertSnapshot: {
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

const organizationId = "org-atlas-demo";
const now = "2026-06-01T10:00:00.000Z";

function alertRule(overrides: Partial<LocalAlertRule> = {}): LocalAlertRule {
  return {
    id: "local-alert-rule-1",
    organizationId,
    kpiId: "local-kpi-1",
    name: "Cout sous-traitance superieur a 10000",
    isActive: true,
    ruleType: "threshold",
    severity: "critical",
    condition: "Superieur a 10000",
    thresholdValue: 10000,
    comparisonOperator: "greater_than",
    message: "Le cout sous-traitance depasse le seuil.",
    recommendedAction: "Analyser les postes de sous-traitance prioritaires.",
    createdAt: now,
    updatedAt: now,
    persisted: false,
    ...overrides
  };
}

function alertSnapshot(overrides: Partial<LocalAlertSnapshot> = {}): LocalAlertSnapshot {
  return {
    id: "local-alert-snapshot-local-alert-1",
    organizationId,
    alertId: "local-alert-1",
    sourceType: "alert_rule",
    sourceId: "local-alert-rule-1",
    severity: "critical",
    status: "open",
    title: "Cout sous-traitance critique",
    message: "Le cout sous-traitance depasse le seuil critique.",
    relatedKpiId: "local-kpi-1",
    relatedRuleId: "local-alert-rule-1",
    generatedAt: now,
    metadata: {
      value: 12800,
      sourceFileName: "nova.csv",
      alertSource: "rule",
      recommendedAction: "Analyser les postes prioritaires."
    },
    persisted: false,
    ...overrides
  };
}

function prismaRuleRecord(rule: LocalAlertRule) {
  return {
    id: rule.id,
    organizationId,
    localKpiConfigurationId: rule.kpiId,
    kpiConfigurationId: rule.kpiConfigurationId ?? null,
    name: rule.name,
    isActive: rule.isActive,
    ruleType: "THRESHOLD",
    severity: rule.severity === "critical" ? "CRITICAL" : "WARNING",
    comparisonOperator: "GREATER_THAN",
    thresholdValue: rule.thresholdValue ?? null,
    consecutivePeriods: rule.consecutivePeriods ?? null,
    variationPercent: rule.variationPercent ?? null,
    message: rule.message,
    recommendedAction: rule.recommendedAction,
    createdAt: new Date(rule.createdAt),
    updatedAt: new Date(rule.updatedAt)
  };
}

function prismaSnapshotRecord(snapshot: LocalAlertSnapshot) {
  return {
    ...snapshot,
    relatedKpiId: snapshot.relatedKpiId ?? null,
    relatedRuleId: snapshot.relatedRuleId ?? null,
    generatedAt: new Date(snapshot.generatedAt),
    createdAt: new Date(snapshot.generatedAt),
    updatedAt: new Date(snapshot.generatedAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("alert engine persistence v1", () => {
  it("cree une regle d'alerte en mode local", async () => {
    const result = await saveLocalAlertRuleData(alertRule(), organizationId);

    expect(result.source).toBe("local");
    expect(getLocalAlertRules()).toHaveLength(1);
    expect(getLocalAlertRules()[0].name).toBe("Cout sous-traitance superieur a 10000");
  });

  it("met a jour une regle en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const nextRule = alertRule({ name: "Seuil critique sous-traitance" });
    prismaMock.localAlertRule.upsert.mockResolvedValueOnce(prismaRuleRecord(nextRule));

    const result = await updateLocalAlertRuleData(nextRule, organizationId);

    expect(result.source).toBe("prisma");
    expect(prismaMock.localAlertRule.upsert).toHaveBeenCalledOnce();
    expect(result.data.name).toBe("Seuil critique sous-traitance");
  });

  it("active ou desactive une regle", async () => {
    const result = await toggleLocalAlertRuleData(alertRule(), organizationId);

    expect(result.source).toBe("local");
    expect(result.data.isActive).toBe(false);
  });

  it("supprime une regle en mode local", async () => {
    await saveLocalAlertRuleData(alertRule(), organizationId);

    const result = await deleteLocalAlertRuleData("local-alert-rule-1");

    expect(result.source).toBe("local");
    expect(getLocalAlertRules()).toHaveLength(0);
  });

  it("retombe en local si Prisma echoue pour une regle", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localAlertRule.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveLocalAlertRuleData(alertRule(), organizationId);

    expect(result.source).toBe("fallback");
    expect(getLocalAlertRules()).toHaveLength(1);
  });

  it("cree un snapshot d'alerte en mode local", async () => {
    const result = await saveLocalAlertSnapshotData(alertSnapshot());

    expect(result.source).toBe("local");
    expect(getLocalAlertSnapshots()).toHaveLength(1);
    expect(getLocalAlertSnapshots()[0].severity).toBe("critical");
  });

  it("cree un snapshot d'alerte en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localAlertSnapshot.upsert.mockResolvedValueOnce(prismaSnapshotRecord(alertSnapshot()));

    const result = await saveLocalAlertSnapshotData(alertSnapshot());

    expect(result.source).toBe("prisma");
    expect(prismaMock.localAlertSnapshot.upsert).toHaveBeenCalledOnce();
    expect(result.data.alertId).toBe("local-alert-1");
  });

  it("retombe en local si Prisma echoue pour un snapshot", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.localAlertSnapshot.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveLocalAlertSnapshotsData([alertSnapshot()]);

    expect(result.source).toBe("fallback");
    expect(getLocalAlertSnapshots()).toHaveLength(1);
  });
});
