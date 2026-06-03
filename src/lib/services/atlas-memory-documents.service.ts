import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteAtlasMemoryDocument,
  deleteAtlasMemoryDocumentBySlug,
  getAtlasMemoryDocumentById,
  getAtlasMemoryDocumentBySlug,
  getAtlasMemoryDocumentsByOrganization,
  upsertAtlasMemoryDocument,
  wasAtlasMemoryDocumentsFallbackUsed
} from "@/lib/repositories/atlas-memory-documents.repository";
import type { AtlasMemoryDocument, AtlasMemoryDocumentKey } from "@/types/atlas-memory";

function currentSource() {
  if (wasAtlasMemoryDocumentsFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getAtlasMemoryDocumentsData(organizationId: string) {
  const data = await getAtlasMemoryDocumentsByOrganization(organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function getAtlasMemoryDocumentByIdData(id: string, organizationId?: string) {
  const data = await getAtlasMemoryDocumentById(id, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function getAtlasMemoryDocumentBySlugData(organizationId: string, slug: AtlasMemoryDocumentKey) {
  const data = await getAtlasMemoryDocumentBySlug(organizationId, slug);
  return {
    data,
    source: currentSource()
  };
}

export async function saveAtlasMemoryDocumentData(document: AtlasMemoryDocument) {
  const data = await upsertAtlasMemoryDocument(document);
  return {
    data,
    source: currentSource()
  };
}

export const createAtlasMemoryDocumentData = saveAtlasMemoryDocumentData;
export const updateAtlasMemoryDocumentData = saveAtlasMemoryDocumentData;

export async function resetAtlasMemoryDocumentData(organizationId: string, slug: AtlasMemoryDocumentKey) {
  await deleteAtlasMemoryDocumentBySlug(organizationId, slug);
  return {
    success: true,
    source: currentSource()
  };
}

export async function deleteAtlasMemoryDocumentData(id: string, organizationId?: string) {
  await deleteAtlasMemoryDocument(id, organizationId);
  return {
    success: true,
    source: currentSource()
  };
}
