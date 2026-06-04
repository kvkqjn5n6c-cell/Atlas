import type { SqlColumnInfo, SqlPreviewRow } from "@/lib/connectors/sql/sql-types";

export type PreparedSqlMappedField = {
  sourceColumn: string;
  sourceType: string;
  atlasFieldKey: string;
  atlasFieldLabel: string;
  required: boolean;
  enabled: boolean;
};

export type PreparedSqlAvailableAtlasField = {
  key: string;
  label: string;
  required: boolean;
};

export type PreparedSqlSource = {
  id: string;
  organizationId: string;
  connectionId: string;
  tableName: string;
  schema?: string;
  displayName: string;
  mappingId: string;
  mappedFields: PreparedSqlMappedField[];
  qualityScore: number;
  rowPreviewCount: number;
  availableAtlasFields: PreparedSqlAvailableAtlasField[];
  warnings: string[];
  createdAt: string;
  updatedAt: string;
  persisted: false;
};

export type PreparedSqlPreview = {
  sourceId: string;
  columns: SqlColumnInfo[];
  rows: SqlPreviewRow[];
  generatedAt: string;
  limitedTo: number;
};

export type PreparedSqlSourceBundle = {
  source: PreparedSqlSource;
  preview: PreparedSqlPreview;
};

export type PreparedSqlSourceValidationResult = {
  valid: boolean;
  qualityScore: number;
  mappedFieldCount: number;
  warnings: string[];
  errors: string[];
};
