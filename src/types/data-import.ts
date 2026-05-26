import type { AtlasField, DataImportJob } from "@/types/atlas";
import type { ImportStatistics } from "@/lib/data-pipeline/import-statistics";

export type DetectedColumnType = "date" | "number" | "text" | "status" | "boolean" | "empty";

export type FilePreviewRow = {
  id: string;
  values: Record<string, string>;
};

export type DetectedColumn = {
  name: string;
  detectedType: DetectedColumnType;
  examples: string[];
  suggestedAtlasField: AtlasField;
};

export type CustomAtlasField = {
  sourceColumn: string;
  label: string;
};

export type MappingFieldType = "standard" | "custom" | "unused";

export type ParsedFileResult = {
  fileName: string;
  fileType: "csv" | "xlsx" | "unsupported";
  delimiter?: "," | ";";
  columns: DetectedColumn[];
  rows: FilePreviewRow[];
  totalRows: number;
  errors: string[];
  warnings: string[];
  statistics?: ImportStatistics;
};

export type LocalColumnMapping = {
  sourceColumn: string;
  atlasField: AtlasField;
  fieldType?: MappingFieldType;
  mappedAtlasField?: AtlasField;
  customFieldLabel?: string;
  dictionaryFieldId?: string;
  dictionaryConfidence?: number;
  dictionaryReason?: string;
};

export type LocalMappingValidation = {
  isValid: boolean;
  warnings: string[];
  unmappedColumns: string[];
  mappedColumns: number;
  qualityScore: number;
};

export type LocalImportSummary = {
  fileName: string;
  rowsRead: number;
  columnsDetected: number;
  mappedColumns: number;
  unmappedColumns: number;
  detectedErrors: number;
  qualityScore: number;
  validationWarnings: string[];
  importJob: DataImportJob & {
    sourceName: string;
    persisted: false;
  };
};

export type LocalValidatedColumnMapping = LocalColumnMapping & {
  detectedType: DetectedColumnType;
};

export type LocalValidatedImport = {
  id: string;
  fileName: string;
  createdAt: string;
  rowsRead: number;
  columnsDetected: number;
  mappedColumns: number;
  unmappedColumns: number;
  mappingQualityScore: number;
  mappings: LocalValidatedColumnMapping[];
  previewRows: FilePreviewRow[];
  simulatedImportJob: LocalImportSummary["importJob"];
  summaryStats?: ImportStatistics;
  persisted: false;
};
