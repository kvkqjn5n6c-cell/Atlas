import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportLocalAtlasData, summarizeLocalExport } from "@/lib/migration/local-exporter";
import { importLocalBundleToPrisma } from "@/lib/migration/local-to-prisma-importer";
import { validateLocalMigrationBundle } from "@/lib/migration/local-migration-validator";
import { saveLocalKpiConfiguration } from "@/lib/local/local-kpi-store";
import { saveLocalKpiResult } from "@/lib/local/local-kpi-results-store";
import { saveSqlConnection } from "@/lib/local/sql-connections-store";
import type { LocalKpiConfiguration } from "@/types/local-kpi";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalMigrationBundle } from "@/types/local-to-prisma-migration";

const serviceMock = vi.hoisted(() => ({
  saveLocalKpiConfigurationData: vi.fn()
}));

vi.mock("@/lib/services/local-kpi.service", () => serviceMock);

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

function kpi(overrides: Partial<LocalKpiConfiguration> = {}): LocalKpiConfiguration {
  return {
    id: "local-kpi-1",
    name: "Cout sous-traitance",
    organizationId,
    sourceFileName: "nova.csv",
    createdAt: now,
    category: "operations",
    calculationType: "sum",
    direction: "lower_is_better",
    primaryField: "NonMappe",
    sourceColumn: "cout",
    targetValue: 10000,
    warningThreshold: 12000,
    criticalThreshold: 15000,
    frequency: "monthly",
    owner: "Direction",
    expectedImpact: "Reduire les couts.",
    persisted: false,
    ...overrides
  } as LocalKpiConfiguration;
}

function kpiResult(overrides: Partial<LocalKpiResult> = {}): LocalKpiResult {
  return {
    id: "result-1",
    kpiId: "local-kpi-1",
    name: "Cout sous-traitance",
    calculationType: "sum",
    direction: "lower_is_better",
    value: 16000,
    status: "critical",
    calculatedAt: now,
    sourceFileName: "nova.csv",
    persisted: false,
    ...overrides
  } as LocalKpiResult;
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("local to prisma migration", () => {
  it("exporte un bundle local et resume les volumes", () => {
    saveLocalKpiConfiguration(kpi());

    const bundle = exportLocalAtlasData();
    const summary = summarizeLocalExport(bundle);

    expect(bundle.source).toBe("localStorage");
    expect(bundle.domains.find((domain) => domain.domain === "local_kpis")?.count).toBe(1);
    expect(summary.totalRecords).toBeGreaterThanOrEqual(1);
  });

  it("masque les mots de passe SQL dans l'export", () => {
    saveSqlConnection({
      id: "sql-1",
      name: "PostgreSQL demo",
      provider: "postgresql",
      host: "localhost",
      port: 5432,
      database: "atlas",
      username: "atlas",
      password: "secret",
      persisted: false
    });

    const bundle = exportLocalAtlasData();
    const sqlDomain = bundle.domains.find((domain) => domain.domain === "sql_connections_redacted");

    expect(sqlDomain?.records[0]).toMatchObject({ password: "[REDACTED]" });
    expect(JSON.stringify(sqlDomain?.records)).not.toContain("secret");
  });

  it("valide un bundle et detecte les doublons", () => {
    const bundle: LocalMigrationBundle = {
      id: "bundle-1",
      generatedAt: now,
      source: "localStorage",
      version: "phase75-v1",
      domains: [
        {
          domain: "local_kpis",
          count: 2,
          records: [kpi(), kpi({ name: "Doublon" })],
          warnings: [],
          errors: []
        }
      ],
      warnings: [],
      errors: []
    };

    const validation = validateLocalMigrationBundle(bundle);

    expect(validation.valid).toBe(false);
    expect(validation.errors.join(" ")).toContain("IDs dupliques");
  });

  it("detecte une reference KPI cassee", () => {
    const bundle: LocalMigrationBundle = {
      id: "bundle-1",
      generatedAt: now,
      source: "localStorage",
      version: "phase75-v1",
      domains: [
        { domain: "local_kpis", count: 0, records: [], warnings: [], errors: [] },
        { domain: "local_kpi_results", count: 1, records: [kpiResult({ kpiId: "missing-kpi" })], warnings: [], errors: [] }
      ],
      warnings: [],
      errors: []
    };

    const validation = validateLocalMigrationBundle(bundle);

    expect(validation.warnings.join(" ")).toContain("Reference KPI absente");
  });

  it("n'importe rien si DATA_MODE n'est pas prisma", async () => {
    const bundle = exportLocalAtlasData();

    const report = await importLocalBundleToPrisma(bundle);

    expect(report.success).toBe(false);
    expect(report.warnings.join(" ")).toContain("DATA_MODE");
  });

  it("importe en best effort en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    serviceMock.saveLocalKpiConfigurationData.mockResolvedValueOnce({
      data: kpi(),
      source: "prisma"
    });
    const bundle: LocalMigrationBundle = {
      id: "bundle-1",
      generatedAt: now,
      source: "localStorage",
      version: "phase75-v1",
      domains: [
        {
          domain: "local_kpis",
          count: 1,
          records: [kpi()],
          warnings: [],
          errors: []
        }
      ],
      warnings: [],
      errors: []
    };

    const report = await importLocalBundleToPrisma(bundle);

    expect(report.domainResults[0].imported).toBe(1);
    expect(serviceMock.saveLocalKpiConfigurationData).toHaveBeenCalledOnce();
  });
});
