import { auditAllDomains } from "@/lib/audit/coherence-audit-engine";
import { prisma } from "@/lib/prisma";
import type {
  CoherenceAuditComparableRecord,
  CoherenceAuditDomainName,
  CoherenceAuditSnapshotDomain
} from "@/types/coherence-audit-types";

function records(items: Array<{ id: string }>): CoherenceAuditComparableRecord[] {
  return items.map((item) => ({ id: item.id }));
}

function localRecordsByDomain(localSnapshot: CoherenceAuditSnapshotDomain[]) {
  return new Map(localSnapshot.map((domain) => [domain.domain, domain.records]));
}

async function readPrismaDomain(domain: CoherenceAuditDomainName): Promise<CoherenceAuditComparableRecord[]> {
  if (domain === "local_action_plans") return records(await prisma.localActionPlan.findMany({ select: { id: true } }));
  if (domain === "recommendation_feedback") return records(await prisma.localRecommendationFeedback.findMany({ select: { id: true } }));
  if (domain === "decision_journal") return records(await prisma.decisionJournalEntry.findMany({ select: { id: true } }));
  if (domain === "atlas_memory_documents") return records(await prisma.atlasMemoryDocument.findMany({ select: { id: true } }));
  if (domain === "atlas_memory_knowledge") return records(await prisma.atlasMemoryKnowledgeItem.findMany({ select: { id: true } }));
  if (domain === "prepared_sql_sources") return records(await prisma.preparedSqlSource.findMany({ select: { id: true } }));
  if (domain === "atlas_datasets") return records(await prisma.atlasDataset.findMany({ select: { id: true } }));
  if (domain === "dataset_filter_sets") return records(await prisma.datasetFilterSet.findMany({ select: { id: true } }));
  if (domain === "dataset_kpi_definitions") return records(await prisma.datasetKpiDefinition.findMany({ select: { id: true } }));
  if (domain === "dataset_groupby_analyses") return records(await prisma.datasetGroupByAnalysis.findMany({ select: { id: true } }));
  return records(await prisma.datasetGroupByInsight.findMany({ select: { id: true } }));
}

export async function runCoherenceAudit(localSnapshot: CoherenceAuditSnapshotDomain[]) {
  const localByDomain = localRecordsByDomain(localSnapshot);
  const domains = localSnapshot.map((domain) => domain.domain);
  const prismaSnapshot = await Promise.all(
    domains.map(async (domain) => ({
      domain,
      prismaRecords: await readPrismaDomain(domain)
    }))
  );

  return auditAllDomains(
    prismaSnapshot.map((domain) => ({
      domain: domain.domain,
      localRecords: localByDomain.get(domain.domain) ?? [],
      prismaRecords: domain.prismaRecords
    }))
  );
}
