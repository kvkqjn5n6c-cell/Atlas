import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteAtlasMemoryKnowledgeItem as deleteAtlasMemoryKnowledgeItemLocal,
  getStoredAtlasMemoryKnowledge,
  saveAtlasMemoryKnowledgeItem,
  saveAtlasMemoryKnowledgeItems
} from "@/lib/local/atlas-memory-knowledge-store";
import type { AtlasKnowledgeItem, AtlasKnowledgeType, KnowledgeStatus } from "@/types/atlas-memory-knowledge";

let lastFallbackUsed = false;

export function wasAtlasMemoryKnowledgeFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type AtlasMemoryKnowledgeRecord = {
  id: string;
  organizationId: string;
  sourceDocumentSlug: string;
  type: string;
  value: string;
  status: string;
  detectedAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  notes: string | null;
};

function toKnowledgeItem(record: AtlasMemoryKnowledgeRecord): AtlasKnowledgeItem {
  return {
    id: record.id,
    organizationId: record.organizationId,
    sourceDocument: record.sourceDocumentSlug as AtlasKnowledgeItem["sourceDocument"],
    type: record.type as AtlasKnowledgeType,
    value: record.value,
    status: record.status as KnowledgeStatus,
    detectedAt: record.detectedAt.toISOString(),
    approvedAt: record.approvedAt?.toISOString() ?? null,
    rejectedAt: record.rejectedAt?.toISOString() ?? null,
    notes: record.notes
  };
}

function toPrismaData(item: AtlasKnowledgeItem) {
  return {
    id: item.id,
    organizationId: item.organizationId,
    sourceDocumentSlug: item.sourceDocument,
    type: item.type,
    value: item.value,
    status: item.status,
    detectedAt: new Date(item.detectedAt),
    approvedAt: item.approvedAt ? new Date(item.approvedAt) : undefined,
    rejectedAt: item.rejectedAt ? new Date(item.rejectedAt) : undefined,
    notes: item.notes,
    persistedSource: "prisma",
    metadata: {
      sourceDocument: item.sourceDocument
    }
  };
}

export async function getAtlasMemoryKnowledgeByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getStoredAtlasMemoryKnowledge(organizationId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.atlasMemoryKnowledgeItem.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" }
    });
    return records.map(toKnowledgeItem);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAtlasMemoryKnowledgeByOrganization failed, falling back to localStorage.", error);
    return getStoredAtlasMemoryKnowledge(organizationId);
  }
}

export async function getAtlasMemoryKnowledgeById(id: string, organizationId?: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    const items = organizationId ? getStoredAtlasMemoryKnowledge(organizationId) : [];
    return items.find((item) => item.id === id) ?? null;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.atlasMemoryKnowledgeItem.findUnique({ where: { id } });
    return record ? toKnowledgeItem(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAtlasMemoryKnowledgeById failed, falling back to localStorage.", error);
    const items = organizationId ? getStoredAtlasMemoryKnowledge(organizationId) : [];
    return items.find((item) => item.id === id) ?? null;
  }
}

export async function getAtlasMemoryKnowledgeByStatus(organizationId: string, status: KnowledgeStatus) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getStoredAtlasMemoryKnowledge(organizationId).filter((item) => item.status === status);

  try {
    const prisma = await getPrisma();
    const records = await prisma.atlasMemoryKnowledgeItem.findMany({
      where: { organizationId, status },
      orderBy: { updatedAt: "desc" }
    });
    return records.map(toKnowledgeItem);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAtlasMemoryKnowledgeByStatus failed, falling back to localStorage.", error);
    return getStoredAtlasMemoryKnowledge(organizationId).filter((item) => item.status === status);
  }
}

export async function getAtlasMemoryKnowledgeByDocument(organizationId: string, sourceDocumentSlug: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    return getStoredAtlasMemoryKnowledge(organizationId).filter((item) => item.sourceDocument === sourceDocumentSlug);
  }

  try {
    const prisma = await getPrisma();
    const records = await prisma.atlasMemoryKnowledgeItem.findMany({
      where: { organizationId, sourceDocumentSlug },
      orderBy: { updatedAt: "desc" }
    });
    return records.map(toKnowledgeItem);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAtlasMemoryKnowledgeByDocument failed, falling back to localStorage.", error);
    return getStoredAtlasMemoryKnowledge(organizationId).filter((item) => item.sourceDocument === sourceDocumentSlug);
  }
}

export async function upsertAtlasMemoryKnowledgeItem(item: AtlasKnowledgeItem) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    saveAtlasMemoryKnowledgeItem(item.organizationId, item);
    return item;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.atlasMemoryKnowledgeItem.upsert({
      where: { id: item.id },
      create: toPrismaData(item),
      update: toPrismaData(item)
    });
    return toKnowledgeItem(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertAtlasMemoryKnowledgeItem failed, falling back to localStorage.", error);
    saveAtlasMemoryKnowledgeItem(item.organizationId, item);
    return item;
  }
}

export async function upsertAtlasMemoryKnowledgeItems(organizationId: string, items: AtlasKnowledgeItem[]) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    saveAtlasMemoryKnowledgeItems(organizationId, items);
    return items;
  }

  try {
    const prisma = await getPrisma();
    const records = [];

    for (const item of items) {
      records.push(await prisma.atlasMemoryKnowledgeItem.upsert({
        where: { id: item.id },
        create: toPrismaData(item),
        update: toPrismaData(item)
      }));
    }

    return records.map(toKnowledgeItem);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertAtlasMemoryKnowledgeItems failed, falling back to localStorage.", error);
    saveAtlasMemoryKnowledgeItems(organizationId, items);
    return items;
  }
}

export const createAtlasMemoryKnowledgeItem = upsertAtlasMemoryKnowledgeItem;
export const updateAtlasMemoryKnowledgeItem = upsertAtlasMemoryKnowledgeItem;

export async function deleteAtlasMemoryKnowledgeItem(organizationId: string, id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteAtlasMemoryKnowledgeItemLocal(organizationId, id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.atlasMemoryKnowledgeItem.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteAtlasMemoryKnowledgeItem failed, falling back to localStorage.", error);
    deleteAtlasMemoryKnowledgeItemLocal(organizationId, id);
  }
}
