export type CoherenceAuditDomainName =
  | "local_action_plans"
  | "recommendation_feedback"
  | "decision_journal"
  | "atlas_memory_documents"
  | "atlas_memory_knowledge"
  | "prepared_sql_sources"
  | "atlas_datasets"
  | "dataset_filter_sets"
  | "dataset_kpi_definitions"
  | "dataset_groupby_analyses"
  | "dataset_groupby_insights";

export type CoherenceAuditStatus =
  | "MATCH"
  | "LOCAL_ONLY"
  | "PRISMA_ONLY"
  | "COUNT_MISMATCH"
  | "CONTENT_MISMATCH";

export type CoherenceAuditComparableRecord = {
  id: string;
  fingerprint?: string;
};

export type CoherenceAuditSnapshotDomain = {
  domain: CoherenceAuditDomainName;
  records: CoherenceAuditComparableRecord[];
};

export type CoherenceAuditDifference = {
  status: CoherenceAuditStatus;
  id?: string;
  message: string;
};

export type CoherenceAuditDomain = {
  domain: CoherenceAuditDomainName;
  label: string;
  status: CoherenceAuditStatus;
  localCount: number;
  prismaCount: number;
  localOnlyIds: string[];
  prismaOnlyIds: string[];
  differences: CoherenceAuditDifference[];
};

export type CoherenceAuditSummary = {
  totalDomains: number;
  matchingDomains: number;
  differenceDomains: number;
  localOnly: number;
  prismaOnly: number;
  countMismatches: number;
  contentMismatches: number;
  score: number;
};

export type CoherenceAuditReport = {
  id: string;
  generatedAt: string;
  summary: CoherenceAuditSummary;
  domains: CoherenceAuditDomain[];
  warnings: string[];
  errors: string[];
};
