import { getAtlasMemoryDocuments } from "@/lib/local/atlas-memory-store";
import { getStoredAtlasMemoryKnowledge } from "@/lib/local/atlas-memory-knowledge-store";
import { getDatasets } from "@/lib/local/atlas-datasets-store";
import { getDatasetGroupByAnalyses } from "@/lib/local/dataset-groupby-store";
import { getGroupByInsights } from "@/lib/local/dataset-groupby-insights-store";
import { getJournalEntries } from "@/lib/local/decision-journal-store";
import { getLocalActionPlans } from "@/lib/local/local-action-plans-store";
import { getLocalAlertRules } from "@/lib/local/local-alert-rules-store";
import { getLocalAlertSnapshots } from "@/lib/local/local-alert-snapshots-store";
import { getLocalKpiHistory } from "@/lib/local/local-kpi-history-store";
import { getLocalKpiResults } from "@/lib/local/local-kpi-results-store";
import { getLocalKpiConfigurations } from "@/lib/local/local-kpi-store";
import { getRecommendationFeedback } from "@/lib/local/local-recommendation-feedback-store";
import { getPreparedSqlSources } from "@/lib/local/sql-prepared-sources-store";
import { getSqlConnections } from "@/lib/local/sql-connections-store";
import type {
  LocalMigrationBundle,
  LocalMigrationDomain,
  LocalMigrationDomainBundle
} from "@/types/local-to-prisma-migration";

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

function now() {
  return new Date().toISOString();
}

function createDomain<T>(
  domain: LocalMigrationDomain,
  records: T[],
  warnings: string[] = [],
  errors: string[] = []
): LocalMigrationDomainBundle<T> {
  return {
    domain,
    count: records.length,
    records,
    warnings,
    errors
  };
}

function redactSqlConnections() {
  return getSqlConnections().map((connection) => ({
    ...connection,
    password: connection.password ? "[REDACTED]" : undefined
  }));
}

export function exportLocalDomain(domain: LocalMigrationDomain): LocalMigrationDomainBundle {
  if (domain === "local_kpis") return createDomain(domain, getLocalKpiConfigurations());
  if (domain === "local_kpi_results") return createDomain(domain, getLocalKpiResults());
  if (domain === "local_kpi_history") return createDomain(domain, getLocalKpiHistory());
  if (domain === "local_alert_rules") return createDomain(domain, getLocalAlertRules());
  if (domain === "local_alert_snapshots") return createDomain(domain, getLocalAlertSnapshots());
  if (domain === "local_action_plans") return createDomain(domain, getLocalActionPlans());
  if (domain === "recommendation_feedback") return createDomain(domain, getRecommendationFeedback());
  if (domain === "decision_journal") return createDomain(domain, getJournalEntries());
  if (domain === "atlas_memory_documents") return createDomain(domain, getAtlasMemoryDocuments(DEFAULT_ORGANIZATION_ID));
  if (domain === "atlas_memory_knowledge") return createDomain(domain, getStoredAtlasMemoryKnowledge(DEFAULT_ORGANIZATION_ID));
  if (domain === "prepared_sql_sources") return createDomain(domain, getPreparedSqlSources());
  if (domain === "atlas_datasets") return createDomain(domain, getDatasets());
  if (domain === "dataset_groupby_analyses") return createDomain(domain, getDatasetGroupByAnalyses());
  if (domain === "dataset_groupby_insights") return createDomain(domain, getGroupByInsights());
  if (domain === "sql_connections_redacted") {
    const records = redactSqlConnections();
    return createDomain(
      domain,
      records,
      records.length > 0 ? ["Connexions SQL exportees sans mot de passe. Domaine non importe en Prisma Phase 75."] : []
    );
  }

  return createDomain(domain, [], [], [`Domaine non reconnu : ${domain}.`]);
}

export function exportLocalAtlasData(): LocalMigrationBundle {
  const domains: LocalMigrationDomain[] = [
    "local_kpis",
    "local_kpi_results",
    "local_kpi_history",
    "local_alert_rules",
    "local_alert_snapshots",
    "local_action_plans",
    "recommendation_feedback",
    "decision_journal",
    "atlas_memory_documents",
    "atlas_memory_knowledge",
    "prepared_sql_sources",
    "atlas_datasets",
    "dataset_groupby_analyses",
    "dataset_groupby_insights",
    "sql_connections_redacted"
  ];

  const exportedDomains = domains.map(exportLocalDomain);

  return {
    id: `local-migration-${Date.now()}`,
    generatedAt: now(),
    source: "localStorage",
    version: "phase75-v1",
    domains: exportedDomains,
    warnings: exportedDomains.flatMap((domain) => domain.warnings),
    errors: exportedDomains.flatMap((domain) => domain.errors)
  };
}

export function summarizeLocalExport(bundle: LocalMigrationBundle) {
  const totalRecords = bundle.domains.reduce((total, domain) => total + domain.count, 0);
  const nonEmptyDomains = bundle.domains.filter((domain) => domain.count > 0).length;

  return {
    title: `Export local Atlas ${bundle.version}`,
    totalRecords,
    domainCount: bundle.domains.length,
    nonEmptyDomains,
    warnings: bundle.warnings,
    errors: bundle.errors,
    summary: `${totalRecords} enregistrement(s) localStorage detecte(s) sur ${nonEmptyDomains} domaine(s) non vide(s).`
  };
}
