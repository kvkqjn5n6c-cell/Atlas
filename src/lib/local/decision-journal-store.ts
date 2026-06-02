import type { DecisionJournalEntry, DecisionJournalEntryType } from "@/types/decision-journal";

const DECISION_JOURNAL_KEY = "atlas-decision-journal-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseEntries(value: string | null): DecisionJournalEntry[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.id === "string" && typeof item.createdAt === "string")
      : [];
  } catch (error) {
    console.warn("Atlas decision journal: lecture localStorage impossible.", error);
    return [];
  }
}

function writeEntries(entries: DecisionJournalEntry[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(DECISION_JOURNAL_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Atlas decision journal: sauvegarde localStorage impossible.", error);
  }
}

function sortEntries(entries: DecisionJournalEntry[]) {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getJournalEntries() {
  if (!canUseStorage()) return [];
  return sortEntries(safeParseEntries(window.localStorage.getItem(DECISION_JOURNAL_KEY)));
}

export function addJournalEntry(entry: DecisionJournalEntry) {
  const entries = getJournalEntries();
  const existing = entries.find((item) => item.id === entry.id);
  const nextEntry: DecisionJournalEntry = {
    ...entry,
    createdAt: existing?.createdAt ?? entry.createdAt,
    relatedKpiIds: entry.relatedKpiIds ?? [],
    relatedRecommendationIds: entry.relatedRecommendationIds ?? [],
    relatedActionPlanIds: entry.relatedActionPlanIds ?? [],
    relatedMemoryReferences: entry.relatedMemoryReferences ?? [],
    metadata: entry.metadata ?? {}
  };

  const nextEntries = sortEntries([nextEntry, ...entries.filter((item) => item.id !== entry.id)]);
  writeEntries(nextEntries);
  return nextEntry;
}

export function getJournalEntriesByType(type: DecisionJournalEntryType) {
  return getJournalEntries().filter((entry) => entry.type === type);
}

export function deleteJournalEntry(id: string) {
  writeEntries(getJournalEntries().filter((entry) => entry.id !== id));
}

export function clearJournal() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DECISION_JOURNAL_KEY);
}
