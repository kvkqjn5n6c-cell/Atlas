import { isPrismaMode } from "@/lib/config/data-mode";
import {
  getAtlasMemoryDocuments,
  resetAtlasMemoryDocument,
  resetAtlasMemoryOrganization,
  saveAtlasMemoryDocument
} from "@/lib/local/atlas-memory-store";
import type { AtlasMemoryDocument, AtlasMemoryDocumentKey } from "@/types/atlas-memory";

let lastFallbackUsed = false;

export function wasAtlasMemoryDocumentsFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type AtlasMemoryDocumentRecord = {
  id: string;
  organizationId: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  updatedAt: Date;
};

function keyFromSlug(slug: string): AtlasMemoryDocumentKey {
  return slug as AtlasMemoryDocumentKey;
}

function categoryFromKey(key: AtlasMemoryDocumentKey) {
  return key.replace(".md", "");
}

function toLocalDocument(record: AtlasMemoryDocumentRecord): AtlasMemoryDocument {
  return {
    id: record.id,
    organizationId: record.organizationId,
    key: keyFromSlug(record.slug),
    title: record.title,
    description: record.description ?? "",
    content: record.content,
    updatedAt: record.updatedAt.toISOString(),
    source: "local",
    persisted: false
  };
}

function toPrismaData(document: AtlasMemoryDocument) {
  return {
    id: document.id,
    organizationId: document.organizationId,
    slug: document.key,
    title: document.title,
    description: document.description,
    content: document.content,
    category: categoryFromKey(document.key),
    status: "active",
    version: "1",
    persistedSource: "prisma",
    metadata: {
      source: document.source,
      updatedAt: document.updatedAt
    }
  };
}

export async function getAtlasMemoryDocumentsByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getAtlasMemoryDocuments(organizationId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.atlasMemoryDocument.findMany({
      where: { organizationId },
      orderBy: { slug: "asc" }
    });
    return records.length > 0 ? records.map(toLocalDocument) : getAtlasMemoryDocuments(organizationId);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAtlasMemoryDocumentsByOrganization failed, falling back to localStorage.", error);
    return getAtlasMemoryDocuments(organizationId);
  }
}

export async function getAtlasMemoryDocumentById(id: string, organizationId?: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    const documents = organizationId ? getAtlasMemoryDocuments(organizationId) : [];
    return documents.find((document) => document.id === id) ?? null;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.atlasMemoryDocument.findUnique({ where: { id } });
    return record ? toLocalDocument(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAtlasMemoryDocumentById failed, falling back to localStorage.", error);
    const documents = organizationId ? getAtlasMemoryDocuments(organizationId) : [];
    return documents.find((document) => document.id === id) ?? null;
  }
}

export async function getAtlasMemoryDocumentBySlug(organizationId: string, slug: AtlasMemoryDocumentKey) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getAtlasMemoryDocuments(organizationId).find((document) => document.key === slug) ?? null;

  try {
    const prisma = await getPrisma();
    const record = await prisma.atlasMemoryDocument.findUnique({
      where: { organizationId_slug: { organizationId, slug } }
    });
    return record ? toLocalDocument(record) : getAtlasMemoryDocuments(organizationId).find((document) => document.key === slug) ?? null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getAtlasMemoryDocumentBySlug failed, falling back to localStorage.", error);
    return getAtlasMemoryDocuments(organizationId).find((document) => document.key === slug) ?? null;
  }
}

export async function upsertAtlasMemoryDocument(document: AtlasMemoryDocument) {
  lastFallbackUsed = false;
  const nextDocument = { ...document, updatedAt: new Date().toISOString(), source: "local" as const, persisted: false as const };

  if (!isPrismaMode()) {
    saveAtlasMemoryDocument(nextDocument);
    return nextDocument;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.atlasMemoryDocument.upsert({
      where: { organizationId_slug: { organizationId: nextDocument.organizationId, slug: nextDocument.key } },
      create: toPrismaData(nextDocument),
      update: toPrismaData(nextDocument)
    });
    return toLocalDocument(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertAtlasMemoryDocument failed, falling back to localStorage.", error);
    saveAtlasMemoryDocument(nextDocument);
    return nextDocument;
  }
}

export const createAtlasMemoryDocument = upsertAtlasMemoryDocument;
export const updateAtlasMemoryDocument = upsertAtlasMemoryDocument;

export async function deleteAtlasMemoryDocumentBySlug(organizationId: string, slug: AtlasMemoryDocumentKey) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    resetAtlasMemoryDocument(organizationId, slug);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.atlasMemoryDocument.delete({ where: { organizationId_slug: { organizationId, slug } } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteAtlasMemoryDocumentBySlug failed, falling back to localStorage.", error);
    resetAtlasMemoryDocument(organizationId, slug);
  }
}

export async function deleteAtlasMemoryDocument(id: string, organizationId?: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return;

  try {
    const prisma = await getPrisma();
    await prisma.atlasMemoryDocument.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteAtlasMemoryDocument failed.", error);
    if (organizationId) resetAtlasMemoryOrganization(organizationId);
  }
}
