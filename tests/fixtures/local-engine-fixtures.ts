import type { AtlasField, KPIConfigurationDraft } from "@/types/atlas";
import type { LocalAlertRule, LocalAlertComparisonOperator } from "@/types/local-alert-rules";
import type { KpiDirection, LocalKpiDraft, LocalKpiTestStatus } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalValidatedImport } from "@/types/data-import";

const now = "2026-06-01T10:00:00.000Z";

export const localImportFixture: LocalValidatedImport = {
  id: "import-test",
  fileName: "performance-test.csv",
  createdAt: now,
  updatedAt: now,
  rowsRead: 3,
  columnsDetected: 6,
  mappedColumns: 6,
  unmappedColumns: 0,
  mappingQualityScore: 92,
  mappings: [
    { sourceColumn: "date", atlasField: "Date", detectedType: "date", fieldType: "standard" },
    { sourceColumn: "revenue", atlasField: "ChiffreAffaires", detectedType: "number", fieldType: "standard" },
    { sourceColumn: "margin", atlasField: "Marge", detectedType: "number", fieldType: "standard" },
    { sourceColumn: "cost", atlasField: "NonMappe", detectedType: "number", fieldType: "custom", customFieldLabel: "Cout sous-traitance" },
    { sourceColumn: "denominator", atlasField: "NonMappe", detectedType: "number", fieldType: "custom", customFieldLabel: "Base ratio" },
    { sourceColumn: "client", atlasField: "Client", detectedType: "text", fieldType: "standard" }
  ],
  previewRows: [
    { id: "row-1", values: { date: "2026-05-01", revenue: "100", margin: "20", cost: "3500", denominator: "10", client: "Client A" } },
    { id: "row-2", values: { date: "2026-05-08", revenue: "200", margin: "30", cost: "4200", denominator: "20", client: "Client B" } },
    { id: "row-3", values: { date: "2026-05-15", revenue: "300", margin: "40", cost: "5100", denominator: "30", client: "Client A" } }
  ],
  simulatedImportJob: {
    id: "job-test",
    dataSourceId: "local-source",
    organizationId: "org-atlas-demo",
    status: "completed",
    startedAt: now,
    finishedAt: now,
    rowsRead: 3,
    validRows: 3,
    rejectedRows: 0,
    detectedErrors: 0,
    kpiCoverage: 80,
    durationSeconds: 1,
    trigger: "manual",
    sourceName: "Import local",
    persisted: false
  },
  persisted: false
};

export function buildKpiDraft(overrides: Partial<LocalKpiDraft> = {}): LocalKpiDraft {
  return {
    name: "CA mensuel",
    organizationId: "org-atlas-demo",
    importId: localImportFixture.id,
    sourceFileName: localImportFixture.fileName,
    importCreatedAt: localImportFixture.createdAt,
    category: "revenue",
    calculationType: "sum",
    direction: "higher_is_better",
    primaryField: "ChiffreAffaires",
    sourceColumn: "revenue",
    targetValue: 500,
    warningThreshold: 400,
    criticalThreshold: 300,
    frequency: "monthly",
    owner: "Direction",
    expectedImpact: "Suivre la performance commerciale locale.",
    ...overrides
  };
}

export function buildKpiResult(overrides: Partial<LocalKpiResult> = {}): LocalKpiResult {
  return {
    id: "result-kpi-1",
    kpiId: "kpi-1",
    importId: localImportFixture.id,
    name: "Cout sous-traitance",
    displayFieldLabel: "Cout sous-traitance",
    calculationType: "sum",
    direction: "lower_is_better",
    value: 12800,
    targetValue: 8000,
    warningThreshold: 10000,
    criticalThreshold: 12000,
    status: "critical",
    trend: "up",
    variation: 18,
    calculatedAt: now,
    sourceFileName: localImportFixture.fileName,
    persisted: false,
    ...overrides
  };
}

export function buildHistoryPoint(overrides: Partial<LocalKpiHistoryPoint> = {}): LocalKpiHistoryPoint {
  return {
    id: `history-${overrides.kpiId ?? "kpi-1"}-${overrides.value ?? 100}`,
    kpiId: "kpi-1",
    importId: localImportFixture.id,
    calculatedAt: now,
    value: 12800,
    status: "critical",
    direction: "lower_is_better",
    targetValue: 8000,
    warningThreshold: 10000,
    criticalThreshold: 12000,
    sourceFileName: localImportFixture.fileName,
    trend: "up",
    variation: 18,
    persisted: false,
    ...overrides
  };
}

export function buildAlertRule(overrides: Partial<LocalAlertRule> = {}): LocalAlertRule {
  return {
    id: "rule-1",
    organizationId: "org-atlas-demo",
    kpiId: "kpi-1",
    name: "Depassement cout",
    isActive: true,
    ruleType: "threshold",
    severity: "critical",
    condition: "Valeur superieure au seuil",
    thresholdValue: 10000,
    comparisonOperator: "greater_than",
    message: "Cout sous-traitance trop eleve",
    recommendedAction: "Renegocier les contrats de sous-traitance prioritaires.",
    createdAt: now,
    updatedAt: now,
    persisted: false,
    ...overrides
  };
}

export function buildThresholdDraft(
  valueField: AtlasField,
  sourceColumn: string,
  calculationType: KPIConfigurationDraft["calculationType"],
  direction: KpiDirection,
  statusTarget: LocalKpiTestStatus
) {
  if (direction === "lower_is_better") {
    const thresholdsByStatus = {
      healthy: { targetValue: 15000, warningThreshold: 17000, criticalThreshold: 20000 },
      watch: { targetValue: 8000, warningThreshold: 12000, criticalThreshold: 15000 },
      critical: { targetValue: 8000, warningThreshold: 10000, criticalThreshold: 12000 },
      "not-tested": { targetValue: 0, warningThreshold: 0, criticalThreshold: 0 }
    };
    return buildKpiDraft({
      name: "Cout sous-traitance",
      category: "operations",
      calculationType,
      direction,
      primaryField: valueField,
      sourceColumn,
      customFieldLabel: "Cout sous-traitance",
      displayFieldLabel: "Cout sous-traitance",
      ...thresholdsByStatus[statusTarget]
    });
  }

  const thresholdsByStatus = {
    healthy: { targetValue: 500, warningThreshold: 400, criticalThreshold: 300 },
    watch: { targetValue: 700, warningThreshold: 500, criticalThreshold: 300 },
    critical: { targetValue: 1000, warningThreshold: 800, criticalThreshold: 700 },
    "not-tested": { targetValue: 0, warningThreshold: 0, criticalThreshold: 0 }
  };

  return buildKpiDraft({
    calculationType,
    direction,
    primaryField: valueField,
    sourceColumn,
    ...thresholdsByStatus[statusTarget]
  });
}

export function comparisonRule(
  comparisonOperator: LocalAlertComparisonOperator,
  overrides: Partial<LocalAlertRule> = {}
) {
  return buildAlertRule({ comparisonOperator, ...overrides });
}
