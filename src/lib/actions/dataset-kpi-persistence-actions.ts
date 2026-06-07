"use server";

import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
import {
  deleteDatasetKpiDefinitionData,
  deleteDatasetKpiDefinitionsByDatasetData,
  getDatasetKpiDefinitionsData,
  saveDatasetKpiDefinitionData
} from "@/lib/services/dataset-kpi.service";

export async function getDatasetKpiWorkspaceAction() {
  return getDatasetKpiDefinitionsData();
}

export async function saveDatasetKpiDefinitionAction(input: {
  definition: DatasetKpiDefinition;
  organizationId?: string;
}) {
  const result = await saveDatasetKpiDefinitionData(input.definition, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data,
    warnings: result.warnings
  };
}

export async function deleteDatasetKpiDefinitionAction(id: string) {
  const result = await deleteDatasetKpiDefinitionData(id);
  return {
    success: true,
    source: result.source,
    warnings: result.warnings
  };
}

export async function deleteDatasetKpiDefinitionsByDatasetAction(datasetId: string) {
  const result = await deleteDatasetKpiDefinitionsByDatasetData(datasetId);
  return {
    success: true,
    source: result.source,
    warnings: result.warnings
  };
}
