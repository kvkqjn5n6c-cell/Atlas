import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteDecisionJournalEntry,
  getDecisionJournalEntriesByOrganization,
  getDecisionJournalEntriesByType,
  upsertDecisionJournalEntry,
  wasDecisionJournalFallbackUsed
} from "@/lib/repositories/decision-journal.repository";
import type { DecisionJournalEntry, DecisionJournalEntryType } from "@/types/decision-journal";

function currentSource() {
  if (wasDecisionJournalFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getDecisionJournalData(organizationId: string) {
  const data = await getDecisionJournalEntriesByOrganization(organizationId);
  return { data, source: currentSource() };
}

export async function getDecisionJournalByTypeData(type: DecisionJournalEntryType, organizationId?: string) {
  const data = await getDecisionJournalEntriesByType(type, organizationId);
  return { data, source: currentSource() };
}

export async function saveDecisionJournalEntryData(entry: DecisionJournalEntry, organizationId: string) {
  const data = await upsertDecisionJournalEntry(entry, organizationId);
  return { data, source: currentSource() };
}

export async function deleteDecisionJournalEntryData(id: string) {
  await deleteDecisionJournalEntry(id);
  return { success: true, source: currentSource() };
}
