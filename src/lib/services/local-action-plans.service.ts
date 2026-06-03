import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteLocalActionPlan,
  getLocalActionPlansByOrganization,
  getLocalActionPlansByRecommendationId,
  upsertLocalActionPlan,
  wasLocalActionPlansFallbackUsed
} from "@/lib/repositories/local-action-plans.repository";
import type { LocalActionPlan } from "@/types/local-action-plans";

function currentSource() {
  if (wasLocalActionPlansFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getLocalActionPlansData(organizationId: string) {
  const data = await getLocalActionPlansByOrganization(organizationId);
  return { data, source: currentSource() };
}

export async function getLocalActionPlansByRecommendationData(recommendationId: string, organizationId?: string) {
  const data = await getLocalActionPlansByRecommendationId(recommendationId, organizationId);
  return { data, source: currentSource() };
}

export async function saveLocalActionPlanData(plan: LocalActionPlan) {
  const data = await upsertLocalActionPlan(plan);
  return { data, source: currentSource() };
}

export async function updateLocalActionPlanData(plan: LocalActionPlan) {
  const data = await upsertLocalActionPlan({ ...plan, updatedAt: new Date().toISOString() });
  return { data, source: currentSource() };
}

export async function deleteLocalActionPlanData(id: string) {
  await deleteLocalActionPlan(id);
  return { success: true, source: currentSource() };
}
