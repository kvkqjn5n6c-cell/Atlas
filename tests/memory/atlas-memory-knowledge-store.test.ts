import { afterEach, describe, expect, it, vi } from "vitest";
import {
  approveAtlasKnowledgeItem,
  getAtlasMemoryKnowledge,
  rejectAtlasKnowledgeItem,
  resetAtlasKnowledgeItem
} from "@/lib/local/atlas-memory-knowledge-store";
import { extractAtlasKnowledgeItems } from "@/lib/memory/atlas-memory-engine";
import { getAtlasMemoryMockByOrganization } from "@/lib/mock/atlas-memory";

function installLocalStorageMock() {
  const values = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key)
    }
  });
}

const organizationId = "org-atlas-demo";
const detectedItems = extractAtlasKnowledgeItems(getAtlasMemoryMockByOrganization(organizationId), organizationId);

describe("atlas memory knowledge store", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retourne les connaissances detectees par defaut", () => {
    installLocalStorageMock();

    const items = getAtlasMemoryKnowledge(organizationId, detectedItems);

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.status === "detected")).toBe(true);
  });

  it("persiste une validation locale", () => {
    installLocalStorageMock();
    const itemId = detectedItems[0].id;

    approveAtlasKnowledgeItem(organizationId, detectedItems, itemId);
    const items = getAtlasMemoryKnowledge(organizationId, detectedItems);

    expect(items.find((item) => item.id === itemId)?.status).toBe("approved");
    expect(items.find((item) => item.id === itemId)?.approvedAt).toBeTruthy();
  });

  it("persiste un rejet local", () => {
    installLocalStorageMock();
    const itemId = detectedItems[0].id;

    rejectAtlasKnowledgeItem(organizationId, detectedItems, itemId);
    const items = getAtlasMemoryKnowledge(organizationId, detectedItems);

    expect(items.find((item) => item.id === itemId)?.status).toBe("rejected");
    expect(items.find((item) => item.id === itemId)?.rejectedAt).toBeTruthy();
  });

  it("reinitialise une connaissance vers detectee", () => {
    installLocalStorageMock();
    const itemId = detectedItems[0].id;

    approveAtlasKnowledgeItem(organizationId, detectedItems, itemId);
    resetAtlasKnowledgeItem(organizationId, detectedItems, itemId);
    const items = getAtlasMemoryKnowledge(organizationId, detectedItems);

    expect(items.find((item) => item.id === itemId)?.status).toBe("detected");
  });
});
