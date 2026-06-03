import type { AtlasKnowledgeItem, KnowledgeStatus } from "@/types/atlas-memory-knowledge";

const storagePrefix = "atlas-memory-knowledge-v1";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function storageKey(organizationId: string) {
  return `${storagePrefix}:${organizationId}`;
}

function now() {
  return new Date().toISOString();
}

function readStoredKnowledge(organizationId: string): AtlasKnowledgeItem[] {
  if (!canUseLocalStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey(organizationId));
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeStoredKnowledge(organizationId: string, items: AtlasKnowledgeItem[]) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(storageKey(organizationId), JSON.stringify(items));
  } catch {
    // Le stockage local reste best effort : l'interface garde les connaissances détectées.
  }
}

function mergeKnowledgeItem(detectedItem: AtlasKnowledgeItem, storedItem?: AtlasKnowledgeItem): AtlasKnowledgeItem {
  if (!storedItem) return detectedItem;

  return {
    ...detectedItem,
    status: storedItem.status,
    approvedAt: storedItem.approvedAt ?? null,
    rejectedAt: storedItem.rejectedAt ?? null,
    notes: storedItem.notes ?? null
  };
}

export function getAtlasMemoryKnowledge(
  organizationId: string,
  detectedItems: AtlasKnowledgeItem[]
): AtlasKnowledgeItem[] {
  const storedItems = readStoredKnowledge(organizationId);
  const storedById = new Map(storedItems.map((item) => [item.id, item]));
  const detectedIds = new Set(detectedItems.map((item) => item.id));
  const mergedItems = detectedItems.map((item) => mergeKnowledgeItem(item, storedById.get(item.id)));
  const archivedStoredItems = storedItems.filter((item) => !detectedIds.has(item.id));

  return [...mergedItems, ...archivedStoredItems];
}

export function saveAtlasMemoryKnowledgeItems(organizationId: string, items: AtlasKnowledgeItem[]) {
  writeStoredKnowledge(organizationId, items);
}

export function saveAtlasMemoryKnowledgeItem(organizationId: string, item: AtlasKnowledgeItem) {
  const items = readStoredKnowledge(organizationId).filter((storedItem) => storedItem.id !== item.id);
  writeStoredKnowledge(organizationId, [item, ...items]);
}

export function getStoredAtlasMemoryKnowledge(organizationId: string) {
  return readStoredKnowledge(organizationId);
}

export function deleteAtlasMemoryKnowledgeItem(organizationId: string, id: string) {
  writeStoredKnowledge(organizationId, readStoredKnowledge(organizationId).filter((item) => item.id !== id));
}

function updateKnowledgeStatus(
  organizationId: string,
  detectedItems: AtlasKnowledgeItem[],
  id: string,
  status: KnowledgeStatus
) {
  const items = getAtlasMemoryKnowledge(organizationId, detectedItems);
  const nextItems = items.map((item) => {
    if (item.id !== id) return item;

    return {
      ...item,
      status,
      approvedAt: status === "approved" ? now() : null,
      rejectedAt: status === "rejected" ? now() : null
    };
  });

  writeStoredKnowledge(organizationId, nextItems);
  return nextItems;
}

export function approveAtlasKnowledgeItem(
  organizationId: string,
  detectedItems: AtlasKnowledgeItem[],
  id: string
) {
  return updateKnowledgeStatus(organizationId, detectedItems, id, "approved");
}

export function rejectAtlasKnowledgeItem(
  organizationId: string,
  detectedItems: AtlasKnowledgeItem[],
  id: string
) {
  return updateKnowledgeStatus(organizationId, detectedItems, id, "rejected");
}

export function resetAtlasKnowledgeItem(
  organizationId: string,
  detectedItems: AtlasKnowledgeItem[],
  id: string
) {
  const items = getAtlasMemoryKnowledge(organizationId, detectedItems);
  const nextItems = items.map((item) => {
    if (item.id !== id) return item;

    return {
      ...item,
      status: "detected" as const,
      approvedAt: null,
      rejectedAt: null,
      notes: null
    };
  });

  writeStoredKnowledge(organizationId, nextItems);
  return nextItems;
}

export function clearAtlasMemoryKnowledge(organizationId: string) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(storageKey(organizationId));
  } catch {
    // Best effort local cleanup.
  }
}
