import type { DatasetKpiAggregation } from "@/lib/datasets/dataset-kpi-types";

export type DatasetGroupByAggregation = Extract<DatasetKpiAggregation, "count" | "sum" | "average">;

export type DatasetGroupByDefinition = {
  id: string;
  datasetId: string;
  field: string;
  label: string;
  createdAt: string;
};

export type DatasetGroupByResult = {
  groupValue: string;
  rowCount: number;
  value: number;
  percentage?: number;
};

export type DatasetGroupByAnalysis = {
  id: string;
  datasetId: string;
  aggregation: DatasetGroupByAggregation;
  field?: string;
  groupedBy: DatasetGroupByDefinition;
  results: DatasetGroupByResult[];
  generatedAt: string;
  warnings: string[];
  persisted: false;
};

export type DatasetGroupByValidationResult = {
  valid: boolean;
  warnings: string[];
  errors: string[];
};

export type DatasetGroupBySummary = {
  groupCount: number;
  bestGroup?: DatasetGroupByResult;
  worstGroup?: DatasetGroupByResult;
  gap?: number;
  dispersion?: number;
  label: string;
};
