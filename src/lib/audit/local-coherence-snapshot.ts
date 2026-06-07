"use client";

import { getStoredAtlasMemoryKnowledge } from "@/lib/local/atlas-memory-knowledge-store";
import { getDatasets } from "@/lib/local/atlas-datasets-store";
import { getDatasetFilterSets } from "@/lib/local/dataset-filters-store";
import { getDatasetGroupByAnalyses } from "@/lib/local/dataset-groupby-store";
import { getGroupByInsights } from "@/lib/local/dataset-groupby-insights-store";
import { getDatasetKpis } from "@/lib/local/dataset-kpi-store";
import { getJournalEntries } from "@/lib/local/decision-journal-store";
import { getLocalActionPlans } from "@/lib/local/local-action-plans-store";
import { getRecommendationFeedback } from "@/lib/local/local-recommendation-feedback-store";
import { getPreparedSqlSources } from "@/lib/local/sql-prepared-sources-store";
import type {
  CoherenceAuditComparableRecord,
  CoherenceAuditDomainName,
  CoherenceAuditSnapshotDomain
} from "@/types/coherence-audit-types";

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";
const ATLAS_MEMORY_STORAGE_KEY = "atlas:memory";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function comparable(id: string | undefined): CoherenceAuditComparableRecord | null {
  return id ? { id } : null;
}

function compact(records: Array<CoherenceAuditComparableRecord | null>) {
  return records.filter((record): record is CoherenceAuditComparableRecord => Boolean(record));
}

function domain(domain: CoherenceAuditDomainName, records: Array<CoherenceAuditComparableRecord | null>): CoherenceAuditSnapshotDomain {
  return {
    domain,
    records: compact(records)
  };
}

function readStoredAtlasMemoryDocuments() {
  if (!canUseLocalStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(ATLAS_MEMORY_STORAGE_KEY);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.organizationId === DEFAULT_ORGANIZATION_ID) : [];
  } catch {
    return [];
  }
}

export function buildLocalCoherenceSnapshot(): CoherenceAuditSnapshotDomain[] {
  return [
    domain("local_action_plans", getLocalActionPlans().map((item) => comparable(item.id))),
    domain("recommendation_feedback", getRecommendationFeedback().map((item) => comparable(item.id))),
    domain("decision_journal", getJournalEntries().map((item) => comparable(item.id))),
    domain("atlas_memory_documents", readStoredAtlasMemoryDocuments().map((item) => comparable(item.id))),
    domain("atlas_memory_knowledge", getStoredAtlasMemoryKnowledge(DEFAULT_ORGANIZATION_ID).map((item) => comparable(item.id))),
    domain("prepared_sql_sources", getPreparedSqlSources().map((item) => comparable(item.source.id))),
    domain("atlas_datasets", getDatasets().map((item) => comparable(item.id))),
    domain("dataset_filter_sets", getDatasetFilterSets().map((item) => comparable(item.id))),
    domain("dataset_kpi_definitions", getDatasetKpis().map((item) => comparable(item.id))),
    domain("dataset_groupby_analyses", getDatasetGroupByAnalyses().map((item) => comparable(item.id))),
    domain("dataset_groupby_insights", getGroupByInsights().map((item) => comparable(item.id)))
  ];
}
