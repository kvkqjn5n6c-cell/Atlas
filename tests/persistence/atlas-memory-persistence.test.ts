import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAtlasMemoryDocuments } from "@/lib/local/atlas-memory-store";
import { getStoredAtlasMemoryKnowledge } from "@/lib/local/atlas-memory-knowledge-store";
import {
  resetAtlasMemoryDocumentData,
  saveAtlasMemoryDocumentData
} from "@/lib/services/atlas-memory-documents.service";
import {
  getAtlasMemoryKnowledgeByStatusData,
  saveAtlasMemoryKnowledgeItemData
} from "@/lib/services/atlas-memory-knowledge.service";
import type { AtlasMemoryDocument } from "@/types/atlas-memory";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";

const prismaMock = vi.hoisted(() => ({
  atlasMemoryDocument: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  },
  atlasMemoryKnowledgeItem: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => store.clear())
  };
}

const organizationId = "org-atlas-demo";
const now = "2026-06-01T10:00:00.000Z";

function memoryDocument(overrides: Partial<AtlasMemoryDocument> = {}): AtlasMemoryDocument {
  return {
    id: "memory-doc-strategie",
    organizationId,
    key: "strategie.md",
    title: "Stratégie",
    description: "Objectifs stratégiques de Nova Services Maintenance.",
    content: "Objectif : Réduire la sous-traitance",
    updatedAt: now,
    source: "local",
    persisted: false,
    ...overrides
  };
}

function knowledgeItem(overrides: Partial<AtlasKnowledgeItem> = {}): AtlasKnowledgeItem {
  return {
    id: "knowledge-cost-objective",
    organizationId,
    type: "objective",
    sourceDocument: "strategie.md",
    value: "Réduire la sous-traitance",
    status: "detected",
    detectedAt: now,
    approvedAt: null,
    rejectedAt: null,
    notes: null,
    ...overrides
  };
}

function prismaDocumentRecord(document: AtlasMemoryDocument) {
  return {
    id: document.id,
    organizationId: document.organizationId,
    slug: document.key,
    title: document.title,
    description: document.description,
    content: document.content,
    category: document.key.replace(".md", ""),
    status: "active",
    version: "1",
    createdAt: new Date(document.updatedAt),
    updatedAt: new Date(document.updatedAt)
  };
}

function prismaKnowledgeRecord(item: AtlasKnowledgeItem) {
  return {
    id: item.id,
    organizationId: item.organizationId,
    sourceDocumentId: null,
    sourceDocumentSlug: item.sourceDocument,
    type: item.type,
    value: item.value,
    status: item.status,
    detectedAt: new Date(item.detectedAt),
    approvedAt: item.approvedAt ? new Date(item.approvedAt) : null,
    rejectedAt: item.rejectedAt ? new Date(item.rejectedAt) : null,
    notes: item.notes ?? null,
    createdAt: new Date(item.detectedAt),
    updatedAt: new Date(item.detectedAt)
  };
}

beforeEach(() => {
  process.env.DATA_MODE = "local";
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: createLocalStorageMock() });
});

describe("atlas memory persistence v1", () => {
  it("sauvegarde un document en mode local", async () => {
    const result = await saveAtlasMemoryDocumentData(memoryDocument());

    expect(result.source).toBe("local");
    expect(getAtlasMemoryDocuments(organizationId).find((document) => document.key === "strategie.md")?.content)
      .toContain("Réduire la sous-traitance");
  });

  it("upsert un document en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.atlasMemoryDocument.upsert.mockResolvedValueOnce(prismaDocumentRecord(memoryDocument()));

    const result = await saveAtlasMemoryDocumentData(memoryDocument());

    expect(result.source).toBe("prisma");
    expect(prismaMock.atlasMemoryDocument.upsert).toHaveBeenCalledOnce();
    expect(result.data.key).toBe("strategie.md");
  });

  it("retombe en local si Prisma echoue pour un document", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.atlasMemoryDocument.upsert.mockRejectedValueOnce(new Error("DB unavailable"));

    const result = await saveAtlasMemoryDocumentData(memoryDocument());

    expect(result.source).toBe("fallback");
    expect(getAtlasMemoryDocuments(organizationId).find((document) => document.key === "strategie.md")?.source).toBe("local");
  });

  it("reinitialise un document localement", async () => {
    await saveAtlasMemoryDocumentData(memoryDocument({ content: "Objectif : Version locale" }));

    const result = await resetAtlasMemoryDocumentData(organizationId, "strategie.md");

    expect(result.source).toBe("local");
    expect(getAtlasMemoryDocuments(organizationId).find((document) => document.key === "strategie.md")?.source).toBe("mock");
  });

  it("sauvegarde une connaissance validee en local", async () => {
    const item = knowledgeItem({ status: "approved", approvedAt: now });

    const result = await saveAtlasMemoryKnowledgeItemData(item);

    expect(result.source).toBe("local");
    expect(getStoredAtlasMemoryKnowledge(organizationId)[0].status).toBe("approved");
  });

  it("sauvegarde une connaissance rejetee en fallback local", async () => {
    process.env.DATA_MODE = "prisma";
    prismaMock.atlasMemoryKnowledgeItem.upsert.mockRejectedValueOnce(new Error("DB unavailable"));
    const item = knowledgeItem({ status: "rejected", rejectedAt: now });

    const result = await saveAtlasMemoryKnowledgeItemData(item);

    expect(result.source).toBe("fallback");
    expect(getStoredAtlasMemoryKnowledge(organizationId)[0].status).toBe("rejected");
  });

  it("liste les connaissances approuvees en mode prisma simule", async () => {
    process.env.DATA_MODE = "prisma";
    const approved = knowledgeItem({ status: "approved", approvedAt: now });
    prismaMock.atlasMemoryKnowledgeItem.findMany.mockResolvedValueOnce([prismaKnowledgeRecord(approved)]);

    const result = await getAtlasMemoryKnowledgeByStatusData(organizationId, "approved");

    expect(result.source).toBe("prisma");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].status).toBe("approved");
  });
});
