import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import type {
  AtlasDataset,
  AtlasDatasetField,
  AtlasDatasetRecord,
  AtlasDatasetSummary,
  AtlasDatasetValidationResult,
  DatasetStatistics
} from "@/lib/datasets/atlas-dataset-types";

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

function inferAtlasType(sourceType: string, atlasFieldKey: string): AtlasDatasetField["atlasType"] {
  const normalizedType = sourceType.toLowerCase();
  const normalizedKey = atlasFieldKey.toLowerCase();

  if (normalizedKey.includes("date") || normalizedType.includes("date") || normalizedType.includes("time")) return "date";
  if (
    ["amount", "cost", "quantity"].includes(normalizedKey) ||
    /int|decimal|numeric|number|float|double|money|real/.test(normalizedType)
  ) {
    return "number";
  }
  if (/bool|bit/.test(normalizedType)) return "boolean";
  return "text";
}

function buildDatasetId(sourceId: string) {
  return `atlas-dataset-${normalizeId(sourceId)}`;
}

function isMissing(value: unknown) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function buildFields(bundle: PreparedSqlSourceBundle): AtlasDatasetField[] {
  return bundle.source.mappedFields
    .filter((field) => field.enabled)
    .map((field) => ({
      key: field.atlasFieldKey,
      label: field.atlasFieldLabel,
      sourceColumn: field.sourceColumn,
      sourceType: field.sourceType,
      atlasType: inferAtlasType(field.sourceType, field.atlasFieldKey)
    }));
}

function buildRecords(datasetId: string, fields: AtlasDatasetField[], bundle: PreparedSqlSourceBundle): AtlasDatasetRecord[] {
  return bundle.preview.rows.map((row, index) => ({
    id: `${datasetId}-row-${index + 1}`,
    values: Object.fromEntries(fields.map((field) => [field.key, row[field.sourceColumn] ?? null]))
  }));
}

export function getDatasetStatistics(dataset: AtlasDataset): DatasetStatistics {
  const totalCells = dataset.rowCount * dataset.fields.length;
  const missingValues = dataset.records.reduce(
    (count, record) => count + dataset.fields.filter((field) => isMissing(record.values[field.key])).length,
    0
  );
  const emptyFields = dataset.fields.filter((field) =>
    dataset.records.every((record) => isMissing(record.values[field.key]))
  );
  const completeness = totalCells === 0 ? 0 : Math.round(((totalCells - missingValues) / totalCells) * 100);
  const warnings = [...new Set([
    ...dataset.warnings,
    ...(dataset.rowCount === 0 ? ["Dataset sans ligne exploitable dans la preview."] : []),
    ...emptyFields.map((field) => `Colonne vide dans la preview : ${field.label}.`),
    ...(missingValues > 0 ? [`${missingValues} valeur(s) manquante(s) detectee(s).`] : [])
  ])];

  return {
    totalRows: dataset.rowCount,
    totalFields: dataset.fields.length,
    mappedFields: dataset.fields.length,
    missingValues,
    completeness,
    warnings
  };
}

function calculateDatasetQuality(sourceScore: number, statistics: DatasetStatistics) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(sourceScore * 0.7 + statistics.completeness * 0.3 - statistics.warnings.length * 3)
    )
  );
}

export function createDatasetFromPreparedSource(bundle: PreparedSqlSourceBundle): AtlasDataset {
  const timestamp = now();
  const datasetId = buildDatasetId(bundle.source.id);
  const fields = buildFields(bundle);
  const records = buildRecords(datasetId, fields, bundle);
  const baseDataset: AtlasDataset = {
    id: datasetId,
    sourceId: bundle.source.id,
    displayName: `Dataset Atlas - ${bundle.source.displayName}`,
    rowCount: records.length,
    fields,
    records,
    qualityScore: bundle.source.qualityScore,
    warnings: [...bundle.source.warnings],
    createdAt: timestamp
  };
  const statistics = getDatasetStatistics(baseDataset);

  return {
    ...baseDataset,
    qualityScore: calculateDatasetQuality(bundle.source.qualityScore, statistics),
    warnings: statistics.warnings
  };
}

export function validateDataset(dataset: AtlasDataset): AtlasDatasetValidationResult {
  const errors: string[] = [];
  const statistics = getDatasetStatistics(dataset);

  if (!dataset.sourceId) errors.push("Source SQL preparee manquante.");
  if (dataset.fields.length === 0) errors.push("Aucun champ Atlas normalise.");
  if (dataset.records.length === 0) errors.push("Aucun record disponible depuis la preview.");

  return {
    valid: errors.length === 0,
    qualityScore: dataset.qualityScore,
    statistics,
    warnings: statistics.warnings,
    errors
  };
}

export function summarizeDataset(dataset: AtlasDataset): AtlasDatasetSummary {
  const statistics = getDatasetStatistics(dataset);
  const executiveSummary =
    statistics.totalRows === 0
      ? "Aucune ligne exploitable dans ce dataset temporaire."
      : `${dataset.displayName} contient ${statistics.totalRows} ligne(s) preview et ${statistics.totalFields} champ(s) Atlas, avec ${statistics.completeness}% de completude.`;
  const technicalSummary = `Source ${dataset.sourceId}, ${statistics.missingValues} valeur(s) manquante(s), score qualite ${dataset.qualityScore}/100.`;

  return {
    executiveSummary,
    technicalSummary,
    statistics
  };
}
