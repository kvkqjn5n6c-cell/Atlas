import type {
  CoherenceAuditComparableRecord,
  CoherenceAuditDifference,
  CoherenceAuditDomain,
  CoherenceAuditDomainName,
  CoherenceAuditReport,
  CoherenceAuditStatus,
  CoherenceAuditSummary
} from "@/types/coherence-audit-types";

export const coherenceAuditDomainLabels: Record<CoherenceAuditDomainName, string> = {
  local_action_plans: "Plans d'action",
  recommendation_feedback: "Feedback recommandations",
  decision_journal: "Journal decisionnel",
  atlas_memory_documents: "Atlas Memory documents",
  atlas_memory_knowledge: "Atlas Memory connaissances",
  prepared_sql_sources: "Prepared SQL Sources",
  atlas_datasets: "Atlas Datasets",
  dataset_filter_sets: "Dataset Filters",
  dataset_kpi_definitions: "Dataset KPI",
  dataset_groupby_analyses: "GroupBy Analyses",
  dataset_groupby_insights: "GroupBy Insights"
};

function uniqueRecords(records: CoherenceAuditComparableRecord[]) {
  const seen = new Set<string>();

  return records.filter((record) => {
    if (!record.id || seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  });
}

function indexById(records: CoherenceAuditComparableRecord[]) {
  return new Map(uniqueRecords(records).map((record) => [record.id, record]));
}

function domainStatus(input: {
  localCount: number;
  prismaCount: number;
  localOnlyIds: string[];
  prismaOnlyIds: string[];
  contentMismatches: CoherenceAuditDifference[];
}): CoherenceAuditStatus {
  if (input.localCount > 0 && input.prismaCount === 0) return "LOCAL_ONLY";
  if (input.localCount === 0 && input.prismaCount > 0) return "PRISMA_ONLY";
  if (input.localCount !== input.prismaCount) return "COUNT_MISMATCH";
  if (input.localOnlyIds.length > 0 || input.prismaOnlyIds.length > 0) return "COUNT_MISMATCH";
  if (input.contentMismatches.length > 0) return "CONTENT_MISMATCH";
  return "MATCH";
}

export function auditDomain(input: {
  domain: CoherenceAuditDomainName;
  localRecords: CoherenceAuditComparableRecord[];
  prismaRecords: CoherenceAuditComparableRecord[];
}): CoherenceAuditDomain {
  const localById = indexById(input.localRecords);
  const prismaById = indexById(input.prismaRecords);
  const localOnlyIds = [...localById.keys()].filter((id) => !prismaById.has(id)).sort();
  const prismaOnlyIds = [...prismaById.keys()].filter((id) => !localById.has(id)).sort();
  const contentMismatches: CoherenceAuditDifference[] = [...localById.entries()]
    .filter(([id, localRecord]) => {
      const prismaRecord = prismaById.get(id);
      return Boolean(localRecord.fingerprint && prismaRecord?.fingerprint && localRecord.fingerprint !== prismaRecord.fingerprint);
    })
    .map(([id]) => ({
      status: "CONTENT_MISMATCH" as const,
      id,
      message: `Objet ${id} present des deux cotes avec une empreinte differente.`
    }));

  const differences: CoherenceAuditDifference[] = [
    ...localOnlyIds.map((id) => ({
      status: "LOCAL_ONLY" as const,
      id,
      message: `Objet ${id} present uniquement dans localStorage.`
    })),
    ...prismaOnlyIds.map((id) => ({
      status: "PRISMA_ONLY" as const,
      id,
      message: `Objet ${id} present uniquement dans Prisma.`
    })),
    ...contentMismatches
  ];

  const localCount = localById.size;
  const prismaCount = prismaById.size;
  const status = domainStatus({
    localCount,
    prismaCount,
    localOnlyIds,
    prismaOnlyIds,
    contentMismatches
  });

  if (status === "COUNT_MISMATCH") {
    differences.unshift({
      status,
      message: `Compteurs differents : ${localCount} localStorage vs ${prismaCount} Prisma.`
    });
  }

  return {
    domain: input.domain,
    label: coherenceAuditDomainLabels[input.domain],
    status,
    localCount,
    prismaCount,
    localOnlyIds,
    prismaOnlyIds,
    differences
  };
}

export function buildCoherenceSummary(domains: CoherenceAuditDomain[]): CoherenceAuditSummary {
  const matchingDomains = domains.filter((domain) => domain.status === "MATCH").length;
  const totalDomains = domains.length;
  const differenceDomains = totalDomains - matchingDomains;

  return {
    totalDomains,
    matchingDomains,
    differenceDomains,
    localOnly: domains.filter((domain) => domain.status === "LOCAL_ONLY").length,
    prismaOnly: domains.filter((domain) => domain.status === "PRISMA_ONLY").length,
    countMismatches: domains.filter((domain) => domain.status === "COUNT_MISMATCH").length,
    contentMismatches: domains.filter((domain) => domain.status === "CONTENT_MISMATCH").length,
    score: totalDomains === 0 ? 100 : Math.round((matchingDomains / totalDomains) * 100)
  };
}

export function auditAllDomains(input: Array<{
  domain: CoherenceAuditDomainName;
  localRecords: CoherenceAuditComparableRecord[];
  prismaRecords: CoherenceAuditComparableRecord[];
}>): CoherenceAuditReport {
  const domains = input.map(auditDomain);

  return {
    id: `coherence-audit-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    summary: buildCoherenceSummary(domains),
    domains,
    warnings: [],
    errors: []
  };
}
