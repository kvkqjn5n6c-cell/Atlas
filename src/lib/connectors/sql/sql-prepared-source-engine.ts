import { getAtlasFieldById, getRequiredAtlasFields } from "@/lib/connectors/sql/atlas-field-catalog";
import { getMappedColumns, validateMapping } from "@/lib/connectors/sql/sql-mapping-engine";
import type { SqlMappingBundle } from "@/lib/connectors/sql/sql-mapping-types";
import type {
  PreparedSqlAvailableAtlasField,
  PreparedSqlMappedField,
  PreparedSqlPreview,
  PreparedSqlSource,
  PreparedSqlSourceBundle,
  PreparedSqlSourceValidationResult
} from "@/lib/connectors/sql/sql-prepared-source-types";
import type { SqlTableInfo, SqlTablePreviewResult } from "@/lib/connectors/sql/sql-types";

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

function buildPreparedSourceId(mapping: SqlMappingBundle) {
  return `prepared-sql-${normalizeId(mapping.tableMapping.id)}`;
}

function tableDisplayName(table: SqlTableInfo) {
  return `${table.schema ? `${table.schema}.` : ""}${table.name}`;
}

function uniqueAvailableFields(mappedFields: PreparedSqlMappedField[]): PreparedSqlAvailableAtlasField[] {
  const fields = new Map<string, PreparedSqlAvailableAtlasField>();

  mappedFields.forEach((field) => {
    if (!fields.has(field.atlasFieldKey)) {
      fields.set(field.atlasFieldKey, {
        key: field.atlasFieldKey,
        label: field.atlasFieldLabel,
        required: field.required
      });
    }
  });

  return [...fields.values()];
}

function buildMappedFields(mapping: SqlMappingBundle): PreparedSqlMappedField[] {
  return getMappedColumns(mapping).map((column) => {
    const atlasField = getAtlasFieldById(column.targetField);

    return {
      sourceColumn: column.sourceColumn,
      sourceType: column.sourceType,
      atlasFieldKey: column.targetField ?? "unknown",
      atlasFieldLabel: atlasField?.label ?? column.targetField ?? "Champ Atlas inconnu",
      required: Boolean(atlasField?.required ?? column.required),
      enabled: true
    };
  });
}

function buildKeyFieldWarnings(source: PreparedSqlSource) {
  const availableKeys = new Set(source.availableAtlasFields.map((field) => field.key));

  return getRequiredAtlasFields()
    .filter((field) => !availableKeys.has(field.id))
    .map((field) => `Champ cle indisponible pour le futur pipeline : ${field.label}.`);
}

export function getAvailableAtlasFields(source: PreparedSqlSource): PreparedSqlAvailableAtlasField[] {
  return source.availableAtlasFields;
}

export function createPreparedSqlSource(
  mapping: SqlMappingBundle,
  schema: SqlTableInfo,
  preview: SqlTablePreviewResult,
  organizationId = DEFAULT_ORGANIZATION_ID
): PreparedSqlSourceBundle {
  const timestamp = now();
  const mappedFields = buildMappedFields(mapping);
  const validation = validateMapping(mapping);
  const sourceId = buildPreparedSourceId(mapping);
  const sourceBase: PreparedSqlSource = {
    id: sourceId,
    organizationId,
    connectionId: mapping.tableMapping.connectionId,
    tableName: schema.name,
    schema: schema.schema,
    displayName: tableDisplayName(schema),
    mappingId: mapping.tableMapping.id,
    mappedFields,
    qualityScore: validation.qualityScore,
    rowPreviewCount: preview.rows.length,
    availableAtlasFields: uniqueAvailableFields(mappedFields),
    warnings: [...validation.errors, ...validation.warnings],
    createdAt: timestamp,
    updatedAt: timestamp,
    persisted: false
  };

  const source: PreparedSqlSource = {
    ...sourceBase,
    warnings: [...sourceBase.warnings, ...buildKeyFieldWarnings(sourceBase)]
  };

  const preparedPreview: PreparedSqlPreview = {
    sourceId,
    columns: preview.columns,
    rows: preview.rows,
    generatedAt: preview.readAt,
    limitedTo: preview.rowLimit
  };

  return { source, preview: preparedPreview };
}

export function validatePreparedSqlSource(source: PreparedSqlSource): PreparedSqlSourceValidationResult {
  const errors: string[] = [];
  const warnings = [...source.warnings];

  if (!source.connectionId) errors.push("Connexion SQL manquante.");
  if (!source.tableName) errors.push("Table SQL manquante.");
  if (!source.mappingId) errors.push("Mapping SQL manquant.");
  if (source.mappedFields.length === 0) errors.push("Aucun champ Atlas disponible.");
  if (source.rowPreviewCount === 0) warnings.push("Aucun apercu de donnees n'est disponible.");

  return {
    valid: errors.length === 0,
    qualityScore: source.qualityScore,
    mappedFieldCount: source.mappedFields.length,
    warnings,
    errors
  };
}

export function summarizePreparedSqlSource(source: PreparedSqlSource) {
  const validation = validatePreparedSqlSource(source);
  const fields = source.availableAtlasFields.map((field) => field.label).join(", ") || "aucun champ Atlas";

  return {
    title: source.displayName,
    status: validation.valid ? "Prête pour pipeline Atlas" : "Préparation incomplète",
    summary: `${source.displayName} expose ${source.mappedFields.length} champ(s) Atlas avec un score qualite de ${source.qualityScore}/100.`,
    fields,
    warnings: validation.warnings,
    errors: validation.errors
  };
}
