import type { AtlasField, KPIConfigurationDraft, PerformanceKPI } from "@/types/atlas";
import type { MappingFieldType } from "@/types/data-import";

export type LocalKpiTestStatus = "healthy" | "watch" | "critical" | "not-tested";

export type LocalKpiTestResult = {
  value: number;
  rowsUsed: number;
  ignoredRows: number;
  status: LocalKpiTestStatus;
  warning?: string;
  period?: string;
};

export type LocalKpiConfiguration = {
  id: string;
  name: string;
  organizationId: string;
  sourceFileName: string;
  createdAt: string;
  category: PerformanceKPI["category"];
  calculationType: KPIConfigurationDraft["calculationType"];
  primaryField: AtlasField;
  secondaryField?: AtlasField;
  filterField?: AtlasField;
  filterValue?: string;
  sourceColumn?: string;
  secondarySourceColumn?: string;
  fieldType?: MappingFieldType;
  customFieldLabel?: string;
  displayFieldLabel?: string;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  frequency: KPIConfigurationDraft["frequency"];
  owner: string;
  expectedImpact: string;
  testResult?: LocalKpiTestResult;
  persisted: false;
};

export type LocalKpiDraft = Omit<LocalKpiConfiguration, "id" | "createdAt" | "testResult" | "persisted">;
