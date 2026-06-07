"use server";

import {
  deleteDatasetGroupByInsightData,
  deleteDatasetGroupByInsightsByAnalysisData,
  deleteDatasetGroupByInsightsByDatasetData,
  getDatasetGroupByInsightsData,
  saveDatasetGroupByInsightData,
  saveDatasetGroupByInsightsData
} from "@/lib/services/dataset-groupby-insights.service";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";

export async function getDatasetGroupByInsightsWorkspaceAction() {
  return getDatasetGroupByInsightsData();
}

export async function saveDatasetGroupByInsightAction(input: {
  insight: DatasetGroupByInsight;
  organizationId?: string;
}) {
  const result = await saveDatasetGroupByInsightData(input.insight, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data,
    warnings: result.warnings
  };
}

export async function saveDatasetGroupByInsightsAction(input: {
  insights: DatasetGroupByInsight[];
  organizationId?: string;
}) {
  const result = await saveDatasetGroupByInsightsData(input.insights, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data,
    warnings: result.warnings
  };
}

export async function deleteDatasetGroupByInsightAction(id: string) {
  const result = await deleteDatasetGroupByInsightData(id);
  return {
    success: true,
    source: result.source,
    warnings: result.warnings
  };
}

export async function deleteDatasetGroupByInsightsByDatasetAction(datasetId: string) {
  const result = await deleteDatasetGroupByInsightsByDatasetData(datasetId);
  return {
    success: true,
    source: result.source,
    warnings: result.warnings
  };
}

export async function deleteDatasetGroupByInsightsByAnalysisAction(groupByAnalysisId: string) {
  const result = await deleteDatasetGroupByInsightsByAnalysisData(groupByAnalysisId);
  return {
    success: true,
    source: result.source,
    warnings: result.warnings
  };
}
