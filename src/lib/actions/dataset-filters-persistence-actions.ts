"use server";

import type { DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";
import {
  deleteDatasetFilterSetData,
  deleteDatasetFilterSetsByDatasetData,
  getDatasetFilterSetsData,
  saveDatasetFilterSetData
} from "@/lib/services/dataset-filters.service";

export async function getDatasetFiltersWorkspaceAction() {
  return getDatasetFilterSetsData();
}

export async function saveDatasetFilterSetAction(input: {
  filterSet: DatasetFilterSet;
  organizationId?: string;
}) {
  const result = await saveDatasetFilterSetData(input.filterSet, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data,
    warnings: result.warnings
  };
}

export async function deleteDatasetFilterSetAction(id: string) {
  const result = await deleteDatasetFilterSetData(id);
  return {
    success: true,
    source: result.source,
    warnings: result.warnings
  };
}

export async function deleteDatasetFilterSetsByDatasetAction(datasetId: string) {
  const result = await deleteDatasetFilterSetsByDatasetData(datasetId);
  return {
    success: true,
    source: result.source,
    warnings: result.warnings
  };
}
