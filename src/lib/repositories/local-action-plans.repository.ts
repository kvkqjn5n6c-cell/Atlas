import { isDecisionDomainPrismaPreferred, isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteLocalActionPlan as deleteLocalActionPlanLocal,
  getLocalActionPlans,
  getLocalActionPlansByRecommendationId as getLocalActionPlansByRecommendationIdLocal,
  saveLocalActionPlan
} from "@/lib/local/local-action-plans-store";
import type { LocalActionPlan } from "@/types/local-action-plans";

let lastFallbackUsed = false;

export function wasLocalActionPlansFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type LocalActionPlanRecord = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  sourceRecommendationId: string | null;
  sourceAlertId: string | null;
  relatedKpiIds: string[];
  relatedInsightIds: string[];
  priority: string;
  status: string;
  owner: string;
  dueDate: string | null;
  expectedImpact: string;
  actions: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function toLocalActionPlan(record: LocalActionPlanRecord): LocalActionPlan {
  return {
    id: record.id,
    organizationId: record.organizationId,
    title: record.title,
    description: record.description,
    sourceRecommendationId: record.sourceRecommendationId ?? undefined,
    sourceAlertId: record.sourceAlertId ?? undefined,
    relatedKpiIds: record.relatedKpiIds,
    relatedInsightIds: record.relatedInsightIds,
    priority: record.priority as LocalActionPlan["priority"],
    status: record.status as LocalActionPlan["status"],
    owner: record.owner,
    dueDate: record.dueDate ?? undefined,
    expectedImpact: record.expectedImpact,
    actions: Array.isArray(record.actions) ? record.actions as LocalActionPlan["actions"] : [],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    persisted: false
  };
}

function toPrismaData(plan: LocalActionPlan) {
  return {
    id: plan.id,
    organizationId: plan.organizationId,
    title: plan.title,
    description: plan.description,
    sourceRecommendationId: plan.sourceRecommendationId,
    sourceAlertId: plan.sourceAlertId,
    relatedKpiIds: plan.relatedKpiIds,
    relatedInsightIds: plan.relatedInsightIds,
    priority: plan.priority,
    status: plan.status,
    owner: plan.owner,
    dueDate: plan.dueDate,
    expectedImpact: plan.expectedImpact,
    actions: plan.actions,
    persistedSource: "prisma"
  };
}

function localPlansByOrganization(organizationId: string) {
  return getLocalActionPlans().filter((plan) => plan.organizationId === organizationId);
}

export async function getLocalActionPlansByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isDecisionDomainPrismaPreferred()) return localPlansByOrganization(organizationId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.localActionPlan.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" }
    });
    return records.map(toLocalActionPlan);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalActionPlansByOrganization failed, falling back to localStorage.", error);
    return localPlansByOrganization(organizationId);
  }
}

export async function getLocalActionPlansByRecommendationId(recommendationId: string, organizationId?: string) {
  lastFallbackUsed = false;
  if (!isDecisionDomainPrismaPreferred()) {
    return getLocalActionPlansByRecommendationIdLocal(recommendationId)
      .filter((plan) => !organizationId || plan.organizationId === organizationId);
  }

  try {
    const prisma = await getPrisma();
    const records = await prisma.localActionPlan.findMany({
      where: {
        sourceRecommendationId: recommendationId,
        ...(organizationId ? { organizationId } : {})
      },
      orderBy: { updatedAt: "desc" }
    });
    return records.map(toLocalActionPlan);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalActionPlansByRecommendationId failed, falling back to localStorage.", error);
    return getLocalActionPlansByRecommendationIdLocal(recommendationId)
      .filter((plan) => !organizationId || plan.organizationId === organizationId);
  }
}

export async function upsertLocalActionPlan(plan: LocalActionPlan) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return saveLocalActionPlan(plan);

  try {
    const prisma = await getPrisma();
    const record = await prisma.localActionPlan.upsert({
      where: { id: plan.id },
      create: toPrismaData(plan),
      update: toPrismaData(plan)
    });
    return toLocalActionPlan(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertLocalActionPlan failed, falling back to localStorage.", error);
    return saveLocalActionPlan(plan);
  }
}

export async function deleteLocalActionPlan(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteLocalActionPlanLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.localActionPlan.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteLocalActionPlan failed, falling back to localStorage.", error);
    deleteLocalActionPlanLocal(id);
  }
}
