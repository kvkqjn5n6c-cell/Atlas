export type LocalMigrationDomain =
  | "local_kpis"
  | "local_kpi_results"
  | "local_kpi_history"
  | "local_alert_rules"
  | "local_alert_snapshots"
  | "local_action_plans"
  | "recommendation_feedback"
  | "decision_journal"
  | "atlas_memory_documents"
  | "atlas_memory_knowledge"
  | "prepared_sql_sources"
  | "atlas_datasets"
  | "dataset_groupby_analyses"
  | "dataset_groupby_insights"
  | "sql_connections_redacted";

export type LocalMigrationDomainBundle<T = unknown> = {
  domain: LocalMigrationDomain;
  count: number;
  records: T[];
  warnings: string[];
  errors: string[];
};

export type LocalMigrationBundle = {
  id: string;
  generatedAt: string;
  source: "localStorage";
  version: "phase75-v1";
  domains: LocalMigrationDomainBundle[];
  warnings: string[];
  errors: string[];
};

export type LocalMigrationValidationResult = {
  valid: boolean;
  generatedAt: string;
  domainResults: Array<{
    domain: LocalMigrationDomain;
    valid: boolean;
    count: number;
    warnings: string[];
    errors: string[];
  }>;
  warnings: string[];
  errors: string[];
};

export type LocalMigrationImportResult = {
  domain: LocalMigrationDomain;
  attempted: number;
  imported: number;
  skipped: number;
  failed: number;
  source: "local" | "prisma" | "fallback" | "not_supported";
  warnings: string[];
  errors: string[];
};

export type LocalMigrationReport = {
  id: string;
  startedAt: string;
  finishedAt: string;
  mode: "best_effort";
  success: boolean;
  validation?: LocalMigrationValidationResult;
  domainResults: LocalMigrationImportResult[];
  warnings: string[];
  errors: string[];
};
