import type { SqlPreviewCellValue } from "@/lib/connectors/sql/sql-types";

export type AtlasDatasetField = {
  key: string;
  label: string;
  sourceColumn: string;
  sourceType: string;
  atlasType: "date" | "number" | "boolean" | "text";
};

export type AtlasDatasetRecord = {
  id: string;
  values: Record<string, SqlPreviewCellValue>;
};

export type AtlasDataset = {
  id: string;
  sourceId: string;
  displayName: string;
  rowCount: number;
  fields: AtlasDatasetField[];
  records: AtlasDatasetRecord[];
  qualityScore: number;
  warnings: string[];
  createdAt: string;
};

export type DatasetStatistics = {
  totalRows: number;
  totalFields: number;
  mappedFields: number;
  missingValues: number;
  completeness: number;
  warnings: string[];
};

export type AtlasDatasetValidationResult = {
  valid: boolean;
  qualityScore: number;
  statistics: DatasetStatistics;
  warnings: string[];
  errors: string[];
};

export type AtlasDatasetSummary = {
  executiveSummary: string;
  technicalSummary: string;
  statistics: DatasetStatistics;
};
