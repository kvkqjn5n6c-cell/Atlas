"use server";

import {
  deleteAtlasDatasetData,
  saveAtlasDatasetData
} from "@/lib/services/atlas-datasets.service";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";

export async function saveAtlasDatasetAction(input: {
  dataset: AtlasDataset;
  organizationId?: string;
}) {
  const result = await saveAtlasDatasetData(input.dataset, input.organizationId);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function deleteAtlasDatasetAction(id: string) {
  const result = await deleteAtlasDatasetData(id);
  return {
    success: true,
    source: result.source
  };
}
