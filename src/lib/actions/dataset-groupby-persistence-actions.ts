"use server";

import {
  deleteDatasetGroupByAnalysesByDatasetData,
  deleteDatasetGroupByAnalysisData,
  saveDatasetGroupByAnalysisData
} from "@/lib/services/dataset-groupby.service";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";

export async function saveDatasetGroupByAnalysisAction(input: {
  analysis: DatasetGroupByAnalysis;
  organizationId?: string;
}) {
  const result = await saveDatasetGroupByAnalysisData(input.analysis, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data,
    warnings: result.warnings
  };
}

export async function deleteDatasetGroupByAnalysisAction(id: string) {
  const result = await deleteDatasetGroupByAnalysisData(id);
  return {
    success: true,
    source: result.source,
    warnings: result.warnings
  };
}

export async function deleteDatasetGroupByAnalysesByDatasetAction(datasetId: string) {
  const result = await deleteDatasetGroupByAnalysesByDatasetData(datasetId);
  return {
    success: true,
    source: result.source,
    warnings: result.warnings
  };
}
