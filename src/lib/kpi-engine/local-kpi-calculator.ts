import type { AtlasField } from "@/types/atlas";
import type { LocalValidatedImport } from "@/types/data-import";
import type { LocalKpiDraft, LocalKpiTestResult } from "@/types/local-kpi";
import { getEffectiveAtlasField, getMappingFieldType } from "@/lib/data-pipeline/mapping-suggestions";

function parseNumericValue(value: string | undefined) {
  if (!value) return null;
  const normalizedValue = value.replace(/\s/g, "").replace(",", ".");
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function sourceColumnForField(importData: LocalValidatedImport, field?: AtlasField, explicitSourceColumn?: string) {
  if (explicitSourceColumn) return explicitSourceColumn;
  if (!field) return undefined;
  return importData.mappings.find((mapping) => getEffectiveAtlasField(mapping) === field)?.sourceColumn;
}

function sourceColumnForFilter(importData: LocalValidatedImport, draft: LocalKpiDraft) {
  if (draft.filterField) return sourceColumnForField(importData, draft.filterField);
  if (draft.fieldType === "custom" && draft.sourceColumn) return draft.sourceColumn;
  return undefined;
}

function getStatus(value: number, draft: LocalKpiDraft): LocalKpiTestResult["status"] {
  if (value <= draft.criticalThreshold) return "critical";
  if (value <= draft.warningThreshold) return "watch";
  return "healthy";
}

function getPeriod(importData: LocalValidatedImport) {
  const dateColumn = sourceColumnForField(importData, "Date");
  if (!dateColumn) return undefined;

  const firstDate = importData.previewRows.find((row) => row.values[dateColumn])?.values[dateColumn];
  return firstDate ? `Depuis ${firstDate}` : undefined;
}

function filterRows(importData: LocalValidatedImport, draft: LocalKpiDraft) {
  if (!draft.filterField || !draft.filterValue) return importData.previewRows;
  const filterColumn = sourceColumnForFilter(importData, draft);
  if (!filterColumn) return importData.previewRows;

  return importData.previewRows.filter((row) =>
    String(row.values[filterColumn] ?? "").toLowerCase().includes(draft.filterValue?.toLowerCase() ?? "")
  );
}

export function calculateLocalKpiFromImport(
  importData: LocalValidatedImport,
  draft: LocalKpiDraft
): LocalKpiTestResult {
  const rows = filterRows(importData, draft);
  const primaryColumn = sourceColumnForField(importData, draft.primaryField, draft.sourceColumn);
  const secondaryColumn = sourceColumnForField(importData, draft.secondaryField, draft.secondarySourceColumn);

  if (draft.calculationType !== "count" && !primaryColumn) {
    return {
      value: 0,
      rowsUsed: 0,
      ignoredRows: rows.length,
      status: "not-tested",
      warning: "Le champ principal n'est pas relié à une colonne source.",
      period: getPeriod(importData)
    };
  }

  const mapping = draft.sourceColumn
    ? importData.mappings.find((item) => item.sourceColumn === draft.sourceColumn)
    : undefined;
  const isCustomField = mapping ? getMappingFieldType(mapping) === "custom" : draft.fieldType === "custom";

  const primaryValues = primaryColumn
    ? rows.map((row) => row.values[primaryColumn]).filter((value): value is string => Boolean(value))
    : [];
  const numericValues = primaryValues
    .map(parseNumericValue)
    .filter((value): value is number => value !== null);
  let value = 0;
  let rowsUsed = numericValues.length;
  let warning: string | undefined;

  if (draft.calculationType === "sum") {
    value = numericValues.reduce((total, current) => total + current, 0);
  } else if (draft.calculationType === "average") {
    value = numericValues.length > 0 ? numericValues.reduce((total, current) => total + current, 0) / numericValues.length : 0;
  } else if (draft.calculationType === "count") {
    rowsUsed = rows.length;
    value = rows.length;
  } else if (draft.calculationType === "distinct-count") {
    rowsUsed = primaryValues.length;
    value = new Set(primaryValues).size;
  } else if (draft.calculationType === "rate") {
    rowsUsed = primaryValues.length;
    const positiveValues = primaryValues.filter((item) => ["oui", "true", "1", "ok", "payé", "paye"].includes(item.toLowerCase()));
    value = primaryValues.length > 0 ? (positiveValues.length / primaryValues.length) * 100 : 0;
  } else if (draft.calculationType === "ratio") {
    const secondaryValues = secondaryColumn
      ? rows.map((row) => parseNumericValue(row.values[secondaryColumn])).filter((item): item is number => item !== null)
      : [];
    const primaryTotal = numericValues.reduce((total, current) => total + current, 0);
    const secondaryTotal = secondaryValues.reduce((total, current) => total + current, 0);
    rowsUsed = Math.min(numericValues.length, secondaryValues.length);
    value = secondaryTotal !== 0 ? primaryTotal / secondaryTotal : 0;
    if (!secondaryColumn) warning = "Le ratio nécessite idéalement un champ secondaire.";
  } else {
    value = numericValues.length > 1 ? numericValues[numericValues.length - 1] - numericValues[0] : 0;
    warning = "Évolution période calculée sur l'aperçu limité de l'import local.";
  }

  const ignoredRows = Math.max(0, rows.length - rowsUsed);

  return {
    value: Math.round(value * 100) / 100,
    rowsUsed,
    ignoredRows,
    status: getStatus(value, draft),
    warning:
      warning ??
      (isCustomField
        ? "Calcul de test basé sur un champ personnalisé et sur l'aperçu local stocké."
        : undefined) ??
      "Calcul de test basé sur l'aperçu local stocké, pas sur l'intégralité du fichier importé.",
    period: getPeriod(importData)
  };
}
