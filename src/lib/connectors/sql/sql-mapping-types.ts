import type { SqlColumnInfo, SqlTableInfo } from "@/lib/connectors/sql/sql-types";

export type SqlTableMapping = {
  id: string;
  connectionId: string;
  tableName: string;
  schema?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  persisted: false;
};

export type SqlColumnMapping = {
  id: string;
  tableMappingId: string;
  sourceColumn: string;
  sourceType: string;
  targetField?: string;
  required: boolean;
  enabled: boolean;
};

export type SqlMappingBundle = {
  tableMapping: SqlTableMapping;
  columnMappings: SqlColumnMapping[];
};

export type SqlMappingValidationResult = {
  valid: boolean;
  qualityScore: number;
  mappedColumnCount: number;
  unmappedColumnCount: number;
  duplicateTargetFields: string[];
  missingRequiredFields: string[];
  warnings: string[];
  errors: string[];
};

export type SqlMappingSuggestion = {
  sourceColumn: string;
  sourceType: string;
  suggestedField?: string;
  confidence: number;
  reason: string;
};

export type SqlCreateMappingInput = {
  connectionId: string;
  table: SqlTableInfo;
  description?: string;
};

export type SqlUpdateMappingInput = {
  mapping: SqlMappingBundle;
  sourceColumn: string;
  targetField?: string;
  enabled?: boolean;
  required?: boolean;
};

export type SqlColumnMappingInput = Pick<SqlColumnInfo, "name" | "dataType">;
