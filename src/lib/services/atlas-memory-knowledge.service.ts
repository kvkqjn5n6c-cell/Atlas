import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteAtlasMemoryKnowledgeItem,
  getAtlasMemoryKnowledgeByDocument,
  getAtlasMemoryKnowledgeById,
  getAtlasMemoryKnowledgeByOrganization,
  getAtlasMemoryKnowledgeByStatus,
  upsertAtlasMemoryKnowledgeItem,
  upsertAtlasMemoryKnowledgeItems,
  wasAtlasMemoryKnowledgeFallbackUsed
} from "@/lib/repositories/atlas-memory-knowledge.repository";
import type { AtlasKnowledgeItem, KnowledgeStatus } from "@/types/atlas-memory-knowledge";

function currentSource() {
  if (wasAtlasMemoryKnowledgeFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getAtlasMemoryKnowledgeData(organizationId: string) {
  const data = await getAtlasMemoryKnowledgeByOrganization(organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function getAtlasMemoryKnowledgeByIdData(id: string, organizationId?: string) {
  const data = await getAtlasMemoryKnowledgeById(id, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function getAtlasMemoryKnowledgeByStatusData(organizationId: string, status: KnowledgeStatus) {
  const data = await getAtlasMemoryKnowledgeByStatus(organizationId, status);
  return {
    data,
    source: currentSource()
  };
}

export async function getAtlasMemoryKnowledgeByDocumentData(organizationId: string, sourceDocumentSlug: string) {
  const data = await getAtlasMemoryKnowledgeByDocument(organizationId, sourceDocumentSlug);
  return {
    data,
    source: currentSource()
  };
}

export async function saveAtlasMemoryKnowledgeItemData(item: AtlasKnowledgeItem) {
  const data = await upsertAtlasMemoryKnowledgeItem(item);
  return {
    data,
    source: currentSource()
  };
}

export async function saveAtlasMemoryKnowledgeItemsData(organizationId: string, items: AtlasKnowledgeItem[]) {
  const data = await upsertAtlasMemoryKnowledgeItems(organizationId, items);
  return {
    data,
    source: currentSource()
  };
}

export const createAtlasMemoryKnowledgeItemData = saveAtlasMemoryKnowledgeItemData;
export const updateAtlasMemoryKnowledgeItemData = saveAtlasMemoryKnowledgeItemData;

export async function deleteAtlasMemoryKnowledgeItemData(organizationId: string, id: string) {
  await deleteAtlasMemoryKnowledgeItem(organizationId, id);
  return {
    success: true,
    source: currentSource()
  };
}
