import type { AtlasDatasetField } from "@/lib/datasets/atlas-dataset-types";
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
  createdAt: string;
  persisted: false;
};

export type DatasetKpiPreview = {
  value: number;
  rowCount: number;
  sourceField?: AtlasDatasetField;
  secondarySourceField?: AtlasDatasetField;
  warnings: string[];
};

export type DatasetKpiValidationResult = {
  valid: boolean;
  warnings: string[];
  errors: string[];
};
