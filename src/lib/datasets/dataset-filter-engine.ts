import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import type {
  DatasetFilter,
  DatasetFilterSet,
  DatasetFilterSummary,
  DatasetFilterValidationResult
} from "@/lib/datasets/dataset-filter-types";

function isEmpty(value: unknown) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function numericValue(value: unknown) {
  if (isEmpty(value)) return null;
  const parsed = typeof value === "number" ? value : Number(String(value).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesFilter(value: unknown, filter: DatasetFilter) {
  const filterValue = filter.value ?? "";

  if (filter.operator === "IS_EMPTY") return isEmpty(value);
  if (filter.operator === "IS_NOT_EMPTY") return !isEmpty(value);
  if (filter.operator === "EQUALS") return normalize(value) === normalize(filterValue);
  if (filter.operator === "NOT_EQUALS") return normalize(value) !== normalize(filterValue);
  if (filter.operator === "CONTAINS") return normalize(value).includes(normalize(filterValue));
  if (filter.operator === "STARTS_WITH") return normalize(value).startsWith(normalize(filterValue));
  if (filter.operator === "ENDS_WITH") return normalize(value).endsWith(normalize(filterValue));

  const currentNumber = numericValue(value);
  const expectedNumber = numericValue(filterValue);

  if (currentNumber === null || expectedNumber === null) return false;
  if (filter.operator === "GREATER_THAN") return currentNumber > expectedNumber;
  if (filter.operator === "LESS_THAN") return currentNumber < expectedNumber;

  return true;
}

export function validateDatasetFilters(dataset: AtlasDataset, filterSet: DatasetFilterSet): DatasetFilterValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (filterSet.datasetId && filterSet.datasetId !== dataset.id) errors.push("Le jeu de filtres ne correspond pas au dataset.");
  if (filterSet.filters.length === 0) warnings.push("Aucun filtre actif.");

  filterSet.filters.forEach((filter) => {
    const field = dataset.fields.find((item) => item.key === filter.field);
    if (!field) errors.push(`Champ filtre introuvable : ${filter.field}.`);
    if (["GREATER_THAN", "LESS_THAN"].includes(filter.operator) && field && field.atlasType !== "number") {
      errors.push(`Le filtre numerique ${filter.operator} necessite un champ numerique.`);
    }
    if (!["IS_EMPTY", "IS_NOT_EMPTY"].includes(filter.operator) && isEmpty(filter.value)) {
      errors.push(`Valeur manquante pour le filtre ${field?.label ?? filter.field}.`);
    }
  });

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

export function applyDatasetFilters(dataset: AtlasDataset, filterSet: DatasetFilterSet) {
  const validation = validateDatasetFilters(dataset, filterSet);
  const warnings = [...dataset.warnings, ...validation.warnings, ...validation.errors];

  if (!validation.valid) {
    return {
      dataset: {
        ...dataset,
        id: `${dataset.id}-filtered-invalid-${filterSet.id}`,
        displayName: `${dataset.displayName} - filtres invalides`,
        records: [],
        rowCount: 0,
        warnings
      },
      validation
    };
  }

  const records = filterSet.filters.length === 0
    ? dataset.records
    : dataset.records.filter((record) =>
        filterSet.filters.every((filter) => matchesFilter(record.values[filter.field], filter))
      );

  return {
    dataset: {
      ...dataset,
      id: `${dataset.id}-filtered-${filterSet.id}`,
      displayName: `${dataset.displayName} - ${filterSet.name}`,
      records,
      rowCount: records.length,
      warnings
    },
    validation
  };
}

export function summarizeDatasetFilters(dataset: AtlasDataset, filteredDataset: AtlasDataset, filterSet: DatasetFilterSet): DatasetFilterSummary {
  const percentage = dataset.rowCount === 0 ? 0 : Math.round((filteredDataset.rowCount / dataset.rowCount) * 100);
  const label = filterSet.filters.length === 0
    ? "Aucun filtre applique."
    : `${filteredDataset.rowCount}/${dataset.rowCount} ligne(s) conservee(s), soit ${percentage}%.`;

  return {
    label,
    totalRows: dataset.rowCount,
    filteredRows: filteredDataset.rowCount,
    percentage,
    warnings: filteredDataset.warnings
  };
}
