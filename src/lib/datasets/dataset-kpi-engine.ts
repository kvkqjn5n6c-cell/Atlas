import type { AtlasDataset, AtlasDatasetField } from "@/lib/datasets/atlas-dataset-types";
import { applyDatasetFilters } from "@/lib/datasets/dataset-filter-engine";
import type { DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";
import type { DatasetKpiDefinition, DatasetKpiPreview, DatasetKpiValidationResult } from "@/lib/datasets/dataset-kpi-types";
import { getLocalKpiStatus, inferKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { buildLocalKpiHistoryPoint } from "@/lib/kpi-engine/local-kpi-results";
import type { AtlasField, PerformanceKPI } from "@/types/atlas";
import type { LocalKpiConfiguration, LocalKpiTestResult } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

function now() {
  return new Date().toISOString();
}

function normalizeId(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function numericValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(String(value).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function findField(dataset: AtlasDataset, key?: string) {
  return dataset.fields.find((field) => field.key === key);
}

function toAtlasField(field?: AtlasDatasetField): AtlasField {
  if (!field) return "NonMappe";

  const fieldMap: Record<string, AtlasField> = {
    date: "Date",
    amount: "ChiffreAffaires",
    cost: "Tresorerie",
    client: "Client",
    region: "Region",
    status: "StatutMission",
    intervention: "Intervention"
  };

  return fieldMap[field.key] ?? "NonMappe";
}

function inferCategory(definition: DatasetKpiDefinition, field?: AtlasDatasetField): PerformanceKPI["category"] {
  const label = `${definition.name} ${field?.label ?? ""} ${field?.key ?? ""}`.toLowerCase();

  if (label.includes("cout") || label.includes("coût") || label.includes("cost")) return "cash";
  if (label.includes("marge")) return "margin";
  if (label.includes("ca") || label.includes("montant") || label.includes("chiffre")) return "revenue";
  if (label.includes("client") || label.includes("satisfaction")) return "quality";
  if (label.includes("qualite") || label.includes("qualité")) return "quality";
  return "operations";
}

function defaultThresholds(value: number, direction = inferKpiDirection({ name: "" })) {
  if (direction === "lower_is_better") {
    return {
      targetValue: Math.round(value * 0.9 * 100) / 100,
      warningThreshold: Math.round(value * 1.05 * 100) / 100,
      criticalThreshold: Math.round(value * 1.2 * 100) / 100
    };
  }

  return {
    targetValue: Math.round(value * 1.1 * 100) / 100,
    warningThreshold: Math.round(value * 0.95 * 100) / 100,
    criticalThreshold: Math.round(value * 0.8 * 100) / 100
  };
}

export function createDatasetKpi(input: {
  dataset: AtlasDataset;
  name: string;
  aggregation: DatasetKpiDefinition["aggregation"];
  field?: string;
  secondaryField?: string;
  description?: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  filterSet?: DatasetFilterSet;
}): DatasetKpiDefinition {
  const timestamp = now();
  const fieldLabel = findField(input.dataset, input.field)?.label ?? "lignes";

  return {
    id: `dataset-kpi-${normalizeId(input.dataset.id)}-${normalizeId(input.name || input.aggregation)}-${Date.now()}`,
    datasetId: input.dataset.id,
    name: input.name || `${input.aggregation.toUpperCase()} ${fieldLabel}`,
    description: input.description ?? `KPI cree depuis ${input.dataset.displayName}`,
    type: input.aggregation,
    field: input.field ?? "",
    secondaryField: input.secondaryField,
    aggregation: input.aggregation,
    targetValue: input.targetValue,
    warningThreshold: input.warningThreshold,
    criticalThreshold: input.criticalThreshold,
    filterSet: input.filterSet,
    filteredRowCount: input.filterSet ? applyDatasetFilters(input.dataset, input.filterSet).dataset.rowCount : undefined,
    createdAt: timestamp,
    persisted: false
  };
}

function effectiveDataset(dataset: AtlasDataset, filterSet?: DatasetFilterSet) {
  return filterSet ? applyDatasetFilters(dataset, filterSet).dataset : dataset;
}

export function validateDatasetKpi(dataset: AtlasDataset, definition: DatasetKpiDefinition, filterSet?: DatasetFilterSet): DatasetKpiValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const scopedDataset = effectiveDataset(dataset, filterSet ?? definition.filterSet);
  const field = findField(scopedDataset, definition.field);
  const secondaryField = findField(scopedDataset, definition.secondaryField);

  if (!definition.name.trim()) errors.push("Le nom du KPI est obligatoire.");
  if (definition.datasetId !== dataset.id) errors.push("La definition KPI ne correspond pas au dataset selectionne.");
  if (scopedDataset.records.length === 0) errors.push("Le dataset filtre ne contient aucun record.");
  if (definition.aggregation !== "count" && !field) errors.push("Le champ principal est obligatoire.");
  if (["sum", "average"].includes(definition.aggregation) && field?.atlasType !== "number") {
    errors.push("Somme et moyenne necessitent un champ numerique.");
  }
  if (definition.aggregation === "ratio") {
    if (!field || !secondaryField) errors.push("Le ratio necessite deux champs.");
    if (field && field.atlasType !== "number") errors.push("Le numerateur du ratio doit etre numerique.");
    if (secondaryField && secondaryField.atlasType !== "number") errors.push("Le denominateur du ratio doit etre numerique.");
  }
  if (definition.aggregation === "count" && !field) warnings.push("Le comptage utilisera toutes les lignes du dataset.");

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

export function previewDatasetKpi(dataset: AtlasDataset, definition: DatasetKpiDefinition, filterSet?: DatasetFilterSet): DatasetKpiPreview {
  const scopedFilterSet = filterSet ?? definition.filterSet;
  const scopedDataset = effectiveDataset(dataset, scopedFilterSet);
  const validation = validateDatasetKpi(dataset, definition, scopedFilterSet);
  const field = findField(scopedDataset, definition.field);
  const secondaryField = findField(scopedDataset, definition.secondaryField);
  const warnings = [...validation.warnings, ...validation.errors];

  if (!validation.valid) {
    return {
      value: 0,
      rowCount: 0,
      totalRowCount: dataset.rowCount,
      filteredRowCount: scopedDataset.rowCount,
      sourceField: field,
      secondarySourceField: secondaryField,
      filterSet: scopedFilterSet,
      warnings
    };
  }

  if (definition.aggregation === "count") {
    return {
      value: scopedDataset.records.length,
      rowCount: scopedDataset.records.length,
      totalRowCount: dataset.rowCount,
      filteredRowCount: scopedDataset.rowCount,
      sourceField: field,
      filterSet: scopedFilterSet,
      warnings
    };
  }

  const values = scopedDataset.records
    .map((record) => numericValue(record.values[definition.field]))
    .filter((value): value is number => value !== null);

  if (definition.aggregation === "sum") {
    return {
      value: Math.round(values.reduce((total, current) => total + current, 0) * 100) / 100,
      rowCount: values.length,
      totalRowCount: dataset.rowCount,
      filteredRowCount: scopedDataset.rowCount,
      sourceField: field,
      filterSet: scopedFilterSet,
      warnings
    };
  }

  if (definition.aggregation === "average") {
    return {
      value: values.length > 0 ? Math.round((values.reduce((total, current) => total + current, 0) / values.length) * 100) / 100 : 0,
      rowCount: values.length,
      totalRowCount: dataset.rowCount,
      filteredRowCount: scopedDataset.rowCount,
      sourceField: field,
      filterSet: scopedFilterSet,
      warnings: values.length === 0 ? [...warnings, "Aucune valeur numerique exploitable."] : warnings
    };
  }

  const secondaryValues = scopedDataset.records
    .map((record) => numericValue(record.values[definition.secondaryField ?? ""]))
    .filter((value): value is number => value !== null);
  const numerator = values.reduce((total, current) => total + current, 0);
  const denominator = secondaryValues.reduce((total, current) => total + current, 0);

  return {
    value: denominator !== 0 ? Math.round((numerator / denominator) * 100) / 100 : 0,
    rowCount: Math.min(values.length, secondaryValues.length),
    totalRowCount: dataset.rowCount,
    filteredRowCount: scopedDataset.rowCount,
    sourceField: field,
    secondarySourceField: secondaryField,
    filterSet: scopedFilterSet,
    warnings: denominator === 0 ? [...warnings, "Denominateur nul pour le ratio."] : warnings
  };
}

export function convertToLocalKpi(input: {
  dataset: AtlasDataset;
  definition: DatasetKpiDefinition;
  organizationId?: string;
  filterSet?: DatasetFilterSet;
}): {
  kpi: LocalKpiConfiguration;
  result: LocalKpiResult;
  historyPoint: LocalKpiHistoryPoint;
} {
  const filterSet = input.filterSet ?? input.definition.filterSet;
  const preview = previewDatasetKpi(input.dataset, input.definition, filterSet);
  const field = preview.sourceField;
  const direction = inferKpiDirection({ name: input.definition.name, displayFieldLabel: field?.label });
  const thresholds = {
    ...defaultThresholds(preview.value, direction),
    ...(input.definition.targetValue !== undefined ? { targetValue: input.definition.targetValue } : {}),
    ...(input.definition.warningThreshold !== undefined ? { warningThreshold: input.definition.warningThreshold } : {}),
    ...(input.definition.criticalThreshold !== undefined ? { criticalThreshold: input.definition.criticalThreshold } : {})
  };
  const testResult: LocalKpiTestResult = {
    value: preview.value,
    rowsUsed: preview.rowCount,
    ignoredRows: Math.max(0, preview.totalRowCount - preview.rowCount),
    status: getLocalKpiStatus(preview.value, {
      direction,
      name: input.definition.name,
      displayFieldLabel: field?.label,
      ...thresholds
    }),
    warning: preview.warnings[0] ?? "Calcul base sur un Dataset Atlas temporaire issu d'une preview SQL limitee.",
    period: filterSet ? `Preview SQL filtree : ${filterSet.name}` : "Preview SQL limitee"
  };
  const kpiId = `local-kpi-${input.definition.id}`;
  const createdAt = now();
  const kpi: LocalKpiConfiguration = {
    id: kpiId,
    name: input.definition.name,
    organizationId: input.organizationId ?? DEFAULT_ORGANIZATION_ID,
    sourceFileName: input.dataset.displayName,
    importCreatedAt: input.dataset.createdAt,
    createdAt,
    category: inferCategory(input.definition, field),
    calculationType: input.definition.type,
    direction,
    primaryField: toAtlasField(field),
    secondaryField: toAtlasField(preview.secondarySourceField),
    sourceColumn: field?.key,
    secondarySourceColumn: preview.secondarySourceField?.key,
    fieldType: "standard",
    displayFieldLabel: field?.label ?? "Lignes dataset",
    targetValue: thresholds.targetValue,
    warningThreshold: thresholds.warningThreshold,
    criticalThreshold: thresholds.criticalThreshold,
    frequency: "monthly",
    owner: "Direction",
    expectedImpact: filterSet
      ? `${input.definition.description} Filtres utilises : ${filterSet.filters.map((filter) => `${filter.field} ${filter.operator} ${filter.value ?? ""}`.trim()).join(", ")}.`
      : input.definition.description,
    testResult,
    persisted: false
  };
  const result: LocalKpiResult = {
    id: `local-kpi-result-${kpi.id}`,
    kpiId: kpi.id,
    importId: kpi.importId,
    name: kpi.name,
    displayFieldLabel: kpi.displayFieldLabel,
    calculationType: kpi.calculationType,
    direction,
    value: testResult.value,
    targetValue: kpi.targetValue,
    warningThreshold: kpi.warningThreshold,
    criticalThreshold: kpi.criticalThreshold,
    status: testResult.status,
    calculatedAt: createdAt,
    sourceFileName: kpi.sourceFileName,
    persisted: false
  };

  return {
    kpi,
    result,
    historyPoint: buildLocalKpiHistoryPoint(result)
  };
}
