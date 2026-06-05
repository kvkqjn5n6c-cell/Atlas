import type { AtlasDataset, AtlasDatasetField } from "@/lib/datasets/atlas-dataset-types";
import type {
  DatasetGroupByAggregation,
  DatasetGroupByAnalysis,
  DatasetGroupByDefinition,
  DatasetGroupByResult,
  DatasetGroupBySummary,
  DatasetGroupByValidationResult
} from "@/lib/datasets/dataset-groupby-types";

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

function valueLabel(value: unknown) {
  if (value === null || value === undefined || value === "") return "(vide)";
  return String(value);
}

function findField(dataset: AtlasDataset, key?: string) {
  return dataset.fields.find((field) => field.key === key);
}

export function supportedGroupFields(dataset: AtlasDataset): AtlasDatasetField[] {
  return dataset.fields.filter((field) => field.atlasType !== "number");
}

export function validateGroupBy(input: {
  dataset: AtlasDataset;
  aggregation: DatasetGroupByAggregation;
  field?: string;
  groupedByField: string;
}): DatasetGroupByValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const groupField = findField(input.dataset, input.groupedByField);
  const metricField = findField(input.dataset, input.field);

  if (input.dataset.records.length === 0) errors.push("Le dataset ne contient aucun record.");
  if (!groupField) errors.push("Le champ de regroupement est obligatoire.");
  if (input.aggregation !== "count" && !metricField) errors.push("Le champ KPI est obligatoire pour SUM et AVERAGE.");
  if (input.aggregation !== "count" && metricField?.atlasType !== "number") {
    errors.push("SUM et AVERAGE necessitent un champ numerique.");
  }
  if (groupField?.atlasType === "number") warnings.push("Le regroupement sur un champ numerique peut produire trop de groupes.");

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

export function groupDataset(input: {
  dataset: AtlasDataset;
  aggregation: DatasetGroupByAggregation;
  field?: string;
  groupedByField: string;
}): DatasetGroupByAnalysis {
  const validation = validateGroupBy(input);
  const groupField = findField(input.dataset, input.groupedByField);
  const timestamp = now();
  const groupedBy: DatasetGroupByDefinition = {
    id: `dataset-groupby-${normalizeId(input.dataset.id)}-${normalizeId(input.groupedByField)}`,
    datasetId: input.dataset.id,
    field: input.groupedByField,
    label: groupField?.label ?? input.groupedByField,
    createdAt: timestamp
  };

  if (!validation.valid) {
    return {
      id: `dataset-groupby-analysis-${normalizeId(input.dataset.id)}-${timestamp}`,
      datasetId: input.dataset.id,
      aggregation: input.aggregation,
      field: input.field,
      groupedBy,
      results: [],
      generatedAt: timestamp,
      warnings: [...validation.errors, ...validation.warnings],
      persisted: false
    };
  }

  const groupedRows = new Map<string, typeof input.dataset.records>();

  input.dataset.records.forEach((record) => {
    const key = valueLabel(record.values[input.groupedByField]);
    groupedRows.set(key, [...(groupedRows.get(key) ?? []), record]);
  });

  const totalRows = input.dataset.records.length;
  const results: DatasetGroupByResult[] = [...groupedRows.entries()]
    .map(([groupValue, records]) => {
      if (input.aggregation === "count") {
        return {
          groupValue,
          rowCount: records.length,
          value: records.length,
          percentage: totalRows === 0 ? 0 : Math.round((records.length / totalRows) * 100)
        };
      }

      const values = records
        .map((record) => numericValue(record.values[input.field ?? ""]))
        .filter((value): value is number => value !== null);
      const total = values.reduce((sum, value) => sum + value, 0);
      const value = input.aggregation === "average"
        ? values.length > 0 ? total / values.length : 0
        : total;

      return {
        groupValue,
        rowCount: records.length,
        value: Math.round(value * 100) / 100,
        percentage: totalRows === 0 ? 0 : Math.round((records.length / totalRows) * 100)
      };
    })
    .sort((first, second) => second.value - first.value);

  return {
    id: `dataset-groupby-analysis-${normalizeId(input.dataset.id)}-${normalizeId(input.groupedByField)}-${timestamp}`,
    datasetId: input.dataset.id,
    aggregation: input.aggregation,
    field: input.field,
    groupedBy,
    results,
    generatedAt: timestamp,
    warnings: validation.warnings,
    persisted: false
  };
}

export function summarizeGroupBy(analysis: DatasetGroupByAnalysis): DatasetGroupBySummary {
  const bestGroup = analysis.results[0];
  const worstGroup = analysis.results.length > 0 ? analysis.results[analysis.results.length - 1] : undefined;
  const gap = bestGroup && worstGroup ? Math.round((bestGroup.value - worstGroup.value) * 100) / 100 : undefined;
  const average = analysis.results.length > 0
    ? analysis.results.reduce((total, result) => total + result.value, 0) / analysis.results.length
    : 0;
  const dispersion = analysis.results.length > 0
    ? Math.round((analysis.results.reduce((total, result) => total + Math.abs(result.value - average), 0) / analysis.results.length) * 100) / 100
    : undefined;

  return {
    groupCount: analysis.results.length,
    bestGroup,
    worstGroup,
    gap,
    dispersion,
    label: analysis.results.length === 0
      ? "Aucun groupe exploitable."
      : `${analysis.results.length} groupe(s), meilleur groupe ${bestGroup?.groupValue}, ecart ${gap ?? 0}.`
  };
}
