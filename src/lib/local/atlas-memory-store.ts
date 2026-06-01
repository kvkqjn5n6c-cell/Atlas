import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";
import type { AtlasMemoryDocument, AtlasMemoryDocumentKey } from "@/types/atlas-memory";

const storageKey = "atlas:memory";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAllDocuments(): AtlasMemoryDocument[] {
  if (!canUseLocalStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? (parsedValue as AtlasMemoryDocument[]) : [];
  } catch (error) {
    console.warn("Impossible de relire Atlas Memory local.", error);
    return [];
  }
}

function writeAllDocuments(documents: AtlasMemoryDocument[]) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(documents));
  } catch (error) {
    console.warn("Impossible d'enregistrer Atlas Memory local.", error);
  }
}

export function getAtlasMemoryDocuments(organizationId: string) {
  const localDocuments = readAllDocuments().filter((document) => document.organizationId === organizationId);
  if (localDocuments.length > 0) return localDocuments;
  return getAtlasMemoryMockByOrganization(organizationId);
}

export function saveAtlasMemoryDocument(document: AtlasMemoryDocument) {
  const documents = readAllDocuments().filter((item) => item.id !== document.id);
  writeAllDocuments([
    {
      ...document,
      updatedAt: new Date().toISOString(),
      source: "local",
      persisted: false
    },
    ...documents
  ]);
}

export function resetAtlasMemoryDocument(organizationId: string, key: AtlasMemoryDocumentKey) {
  const mockDocument = getAtlasMemoryMockByOrganization(organizationId).find((document) => document.key === key);
  if (!mockDocument) return null;

  const documents = readAllDocuments().filter(
    (document) => !(document.organizationId === organizationId && document.key === key)
  );
  writeAllDocuments(documents);
  return mockDocument;
}

export function resetAtlasMemoryOrganization(organizationId: string) {
  writeAllDocuments(readAllDocuments().filter((document) => document.organizationId !== organizationId));
}
