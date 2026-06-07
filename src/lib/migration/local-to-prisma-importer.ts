import { isPrismaMode } from "@/lib/config/data-mode";
import { saveAtlasDatasetData } from "@/lib/services/atlas-datasets.service";
import { saveAtlasMemoryDocumentData } from "@/lib/services/atlas-memory-documents.service";
import { saveAtlasMemoryKnowledgeItemData } from "@/lib/services/atlas-memory-knowledge.service";
import { saveDatasetGroupByAnalysisData } from "@/lib/services/dataset-groupby.service";
import { saveDatasetGroupByInsightsData } from "@/lib/services/dataset-groupby-insights.service";
import { saveDecisionJournalEntryData } from "@/lib/services/decision-journal.service";
import { saveLocalActionPlanData } from "@/lib/services/local-action-plans.service";
import { saveLocalAlertRuleData } from "@/lib/services/local-alert-rules.service";
import { saveLocalAlertSnapshotData } from "@/lib/services/local-alert-snapshots.service";
import { saveLocalKpiConfigurationData } from "@/lib/services/local-kpi.service";
import { saveLocalKpiHistoryPointData } from "@/lib/services/local-kpi-history.service";
import { saveLocalKpiResultData } from "@/lib/services/local-kpi-results.service";
import { savePreparedSqlSourceData } from "@/lib/services/prepared-sql-sources.service";
import { saveRecommendationFeedbackData } from "@/lib/services/recommendation-feedback.service";
import { validateLocalMigrationBundle } from "@/lib/migration/local-migration-validator";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import type { AtlasMemoryDocument } from "@/types/atlas-memory";
import type { AtlasKnowledgeItem } from "@/types/atlas-memory-knowledge";
import type { DecisionJournalEntry } from "@/types/decision-journal";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { LocalAlertRule } from "@/types/local-alert-rules";
import type { LocalAlertSnapshot } from "@/types/local-alert-snapshots";
import type { LocalKpiConfiguration } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";
import type { LocalKpiResult } from "@/types/local-kpi-results";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";
import type {
  LocalMigrationBundle,
  LocalMigrationDomainBundle,
  LocalMigrationImportResult,
  LocalMigrationReport
} from "@/types/local-to-prisma-migration";

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

function now() {
  return new Date().toISOString();
}

function skippedResult(domain: LocalMigrationDomainBundle, warning: string): LocalMigrationImportResult {
  return {
    domain: domain.domain,
    attempted: 0,
    imported: 0,
    skipped: domain.count,
    failed: 0,
    source: "not_supported",
    warnings: [warning],
    errors: []
  };
}

function organizationForRecord(record: unknown, fallback = DEFAULT_ORGANIZATION_ID) {
  if (typeof record !== "object" || record === null) return fallback;
  const value = (record as { organizationId?: unknown }).organizationId;
  return typeof value === "string" && value.trim() ? value : fallback;
}

function kpiOrganizationMap(bundle: LocalMigrationBundle) {
  const map = new Map<string, string>();
  const kpis = bundle.domains.find((domain) => domain.domain === "local_kpis")?.records ?? [];

  kpis.forEach((record) => {
    if (typeof record !== "object" || record === null) return;
    const id = (record as { id?: unknown }).id;
    const organizationId = (record as { organizationId?: unknown }).organizationId;
    if (typeof id === "string" && typeof organizationId === "string") map.set(id, organizationId);
  });

  return map;
}

async function importRecord(
  domain: LocalMigrationDomainBundle,
  record: unknown,
  bundle: LocalMigrationBundle
) {
  const kpiOrganizations = kpiOrganizationMap(bundle);

  if (domain.domain === "local_kpis") return saveLocalKpiConfigurationData(record as LocalKpiConfiguration);
  if (domain.domain === "local_kpi_results") {
    const result = record as LocalKpiResult;
    return saveLocalKpiResultData(result, kpiOrganizations.get(result.kpiId) ?? DEFAULT_ORGANIZATION_ID);
  }
  if (domain.domain === "local_kpi_history") {
    const point = record as LocalKpiHistoryPoint;
    return saveLocalKpiHistoryPointData(point, kpiOrganizations.get(point.kpiId) ?? DEFAULT_ORGANIZATION_ID);
  }
  if (domain.domain === "local_alert_rules") {
    const rule = record as LocalAlertRule;
    return saveLocalAlertRuleData(rule, rule.organizationId ?? DEFAULT_ORGANIZATION_ID);
  }
  if (domain.domain === "local_alert_snapshots") return saveLocalAlertSnapshotData(record as LocalAlertSnapshot);
  if (domain.domain === "local_action_plans") return saveLocalActionPlanData(record as LocalActionPlan);
  if (domain.domain === "recommendation_feedback") {
    const feedback = record as LocalRecommendationFeedback;
    return saveRecommendationFeedbackData(feedback, organizationForRecord(record));
  }
  if (domain.domain === "decision_journal") {
    return saveDecisionJournalEntryData(record as DecisionJournalEntry, organizationForRecord(record));
  }
  if (domain.domain === "atlas_memory_documents") return saveAtlasMemoryDocumentData(record as AtlasMemoryDocument);
  if (domain.domain === "atlas_memory_knowledge") return saveAtlasMemoryKnowledgeItemData(record as AtlasKnowledgeItem);
  if (domain.domain === "prepared_sql_sources") return savePreparedSqlSourceData(record as PreparedSqlSourceBundle);
  if (domain.domain === "atlas_datasets") return saveAtlasDatasetData(record as AtlasDataset, organizationForRecord(record));
  if (domain.domain === "dataset_groupby_analyses") {
    return saveDatasetGroupByAnalysisData(record as DatasetGroupByAnalysis, organizationForRecord(record));
  }
  if (domain.domain === "dataset_groupby_insights") {
    return saveDatasetGroupByInsightsData([record as DatasetGroupByInsight], organizationForRecord(record));
  }

  return null;
}

export async function importDomainToPrisma(
  domain: LocalMigrationDomainBundle,
  bundle?: LocalMigrationBundle
): Promise<LocalMigrationImportResult> {
  if (domain.domain === "sql_connections_redacted") {
    return skippedResult(domain, "Connexions SQL redacted : import Prisma non supporte en Phase 75.");
  }

  if (!bundle) {
    return {
      domain: domain.domain,
      attempted: 0,
      imported: 0,
      skipped: domain.count,
      failed: 0,
      source: "not_supported",
      warnings: ["Bundle complet requis pour importer ce domaine."],
      errors: []
    };
  }

  if (!isPrismaMode()) {
    return skippedResult(domain, "Import desactive : DATA_MODE doit etre prisma.");
  }

  let imported = 0;
  let failed = 0;
  const warnings: string[] = [];
  const errors: string[] = [];
  let source: LocalMigrationImportResult["source"] = "prisma";

  for (const record of domain.records) {
    try {
      const result = await importRecord(domain, record, bundle);

      if (!result) {
        warnings.push(`Domaine ignore : ${domain.domain}.`);
        continue;
      }

      if (result.source === "prisma") {
        imported += 1;
      } else {
        failed += 1;
        source = result.source;
        warnings.push(`Fallback utilise pour ${domain.domain}.`);
      }
    } catch (error) {
      failed += 1;
      source = "fallback";
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    domain: domain.domain,
    attempted: domain.count,
    imported,
    skipped: 0,
    failed,
    source,
    warnings: [...new Set([...domain.warnings, ...warnings])],
    errors: [...domain.errors, ...errors]
  };
}

export async function importLocalBundleToPrisma(bundle: LocalMigrationBundle): Promise<LocalMigrationReport> {
  const startedAt = now();
  const validation = validateLocalMigrationBundle(bundle);

  if (!isPrismaMode()) {
    const domainResults = bundle.domains.map((domain) => skippedResult(domain, "Import desactive : DATA_MODE doit etre prisma."));
    const finishedAt = now();

    return {
      id: `migration-report-${Date.now()}`,
      startedAt,
      finishedAt,
      mode: "best_effort",
      success: false,
      validation,
      domainResults,
      warnings: ["Aucun import Prisma execute : DATA_MODE n'est pas prisma."],
      errors: []
    };
  }

  const domainResults: LocalMigrationImportResult[] = [];

  for (const domain of bundle.domains) {
    domainResults.push(await importDomainToPrisma(domain, bundle));
  }

  const finishedAt = now();
  const errors = domainResults.flatMap((domain) => domain.errors);
  const warnings = domainResults.flatMap((domain) => domain.warnings);

  return {
    id: `migration-report-${Date.now()}`,
    startedAt,
    finishedAt,
    mode: "best_effort",
    success: validation.valid && errors.length === 0,
    validation,
    domainResults,
    warnings: [...new Set(warnings)],
    errors
  };
}
