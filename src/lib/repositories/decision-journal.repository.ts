import { isDecisionDomainPrismaPreferred, isPrismaMode } from "@/lib/config/data-mode";
import {
  addJournalEntry,
  deleteJournalEntry as deleteJournalEntryLocal,
  getJournalEntries,
  getJournalEntriesByType as getJournalEntriesByTypeLocal
} from "@/lib/local/decision-journal-store";
import type { DecisionJournalEntry, DecisionJournalEntryType } from "@/types/decision-journal";

let lastFallbackUsed = false;

export function wasDecisionJournalFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type DecisionJournalRecord = {
  id: string;
  type: string;
  title: string;
  description: string;
  sourceType: string;
  sourceId: string;
  priority: string | null;
  status: string | null;
  confidenceScore: number | null;
  relatedKpiIds: string[];
  relatedRecommendationIds: string[];
  relatedActionPlanIds: string[];
  relatedMemoryReferences: unknown;
  metadata: unknown;
  createdAt: Date;
};

function toLocalJournalEntry(record: DecisionJournalRecord): DecisionJournalEntry {
  return {
    id: record.id,
    createdAt: record.createdAt.toISOString(),
    type: record.type as DecisionJournalEntry["type"],
    title: record.title,
    description: record.description,
    sourceType: record.sourceType as DecisionJournalEntry["sourceType"],
    sourceId: record.sourceId,
    priority: record.priority ?? undefined,
    status: record.status ?? undefined,
    confidenceScore: record.confidenceScore ?? undefined,
    relatedKpiIds: record.relatedKpiIds,
    relatedRecommendationIds: record.relatedRecommendationIds,
    relatedActionPlanIds: record.relatedActionPlanIds,
    relatedMemoryReferences: Array.isArray(record.relatedMemoryReferences)
      ? record.relatedMemoryReferences as DecisionJournalEntry["relatedMemoryReferences"]
      : [],
    metadata: record.metadata && typeof record.metadata === "object"
      ? record.metadata as DecisionJournalEntry["metadata"]
      : {}
  };
}

function toPrismaData(entry: DecisionJournalEntry, organizationId: string) {
  return {
    id: entry.id,
    organizationId,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    sourceType: entry.sourceType,
    sourceId: entry.sourceId,
    priority: entry.priority,
    status: entry.status,
    confidenceScore: entry.confidenceScore,
    relatedKpiIds: entry.relatedKpiIds,
    relatedRecommendationIds: entry.relatedRecommendationIds,
    relatedActionPlanIds: entry.relatedActionPlanIds,
    relatedMemoryReferences: entry.relatedMemoryReferences,
    metadata: entry.metadata,
    createdAt: new Date(entry.createdAt),
    persistedSource: "prisma"
  };
}

export async function getDecisionJournalEntriesByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isDecisionDomainPrismaPreferred()) return getJournalEntries();

  try {
    const prisma = await getPrisma();
    const records = await prisma.decisionJournalEntry.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" }
    });
    return records.map(toLocalJournalEntry);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDecisionJournalEntriesByOrganization failed, falling back to localStorage.", error);
    return getJournalEntries();
  }
}

export async function getDecisionJournalEntriesByType(type: DecisionJournalEntryType, organizationId?: string) {
  lastFallbackUsed = false;
  if (!isDecisionDomainPrismaPreferred()) return getJournalEntriesByTypeLocal(type);

  try {
    const prisma = await getPrisma();
    const records = await prisma.decisionJournalEntry.findMany({
      where: {
        type,
        ...(organizationId ? { organizationId } : {})
      },
      orderBy: { createdAt: "desc" }
    });
    return records.map(toLocalJournalEntry);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getDecisionJournalEntriesByType failed, falling back to localStorage.", error);
    return getJournalEntriesByTypeLocal(type);
  }
}

export async function upsertDecisionJournalEntry(entry: DecisionJournalEntry, organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return addJournalEntry(entry);

  try {
    const prisma = await getPrisma();
    const record = await prisma.decisionJournalEntry.upsert({
      where: { id: entry.id },
      create: toPrismaData(entry, organizationId),
      update: toPrismaData(entry, organizationId)
    });
    return toLocalJournalEntry(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertDecisionJournalEntry failed, falling back to localStorage.", error);
    return addJournalEntry(entry);
  }
}

export async function deleteDecisionJournalEntry(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteJournalEntryLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.decisionJournalEntry.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteDecisionJournalEntry failed, falling back to localStorage.", error);
    deleteJournalEntryLocal(id);
  }
}
