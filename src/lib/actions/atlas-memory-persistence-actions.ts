"use server";

import {
  resetAtlasMemoryDocumentData,
  saveAtlasMemoryDocumentData
} from "@/lib/services/atlas-memory-documents.service";
import {
  saveAtlasMemoryKnowledgeItemData,
  saveAtlasMemoryKnowledgeItemsData
} from "@/lib/services/atlas-memory-knowledge.service";
import type { AtlasMemoryDocument, AtlasMemoryDocumentKey } from "@/types/atlas-memory";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";

export async function saveAtlasMemoryDocumentAction(document: AtlasMemoryDocument) {
  const result = await saveAtlasMemoryDocumentData(document);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function resetAtlasMemoryDocumentAction(input: {
  organizationId: string;
  key: AtlasMemoryDocumentKey;
}) {
  const result = await resetAtlasMemoryDocumentData(input.organizationId, input.key);
  return {
    success: true,
    source: result.source
  };
}

export async function saveAtlasMemoryKnowledgeItemAction(item: AtlasKnowledgeItem) {
  const result = await saveAtlasMemoryKnowledgeItemData(item);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function saveAtlasMemoryKnowledgeItemsAction(input: {
  organizationId: string;
  items: AtlasKnowledgeItem[];
}) {
  const result = await saveAtlasMemoryKnowledgeItemsData(input.organizationId, input.items);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}
