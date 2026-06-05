import type { AtlasDatasetField } from "@/lib/datasets/atlas-dataset-types";
import type { DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";
import type { KPIConfigurationDraft } from "@/types/atlas";

export type DatasetKpiAggregation = "count" | "sum" | "average" | "ratio";

export type DatasetKpiDefinition = {
  id: string;
  datasetId: string;
  name: string;
  description: string;
  type: KPIConfigurationDraft["calculationType"];
  field: string;
  secondaryField?: string;
  aggregation: DatasetKpiAggregation;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  filterSet?: DatasetFilterSet;
  filteredRowCount?: number;
  createdAt: string;
  persisted: false;
};

export type DatasetKpiPreview = {
  value: number;
  rowCount: number;
  totalRowCount: number;
  filteredRowCount: number;
  sourceField?: AtlasDatasetField;
  secondarySourceField?: AtlasDatasetField;
  filterSet?: DatasetFilterSet;
  warnings: string[];
};

export type DatasetKpiValidationResult = {
  valid: boolean;
  warnings: string[];
  errors: string[];
};
