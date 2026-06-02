import type { LocalActionPlan } from "@/types/local-action-plans";

const LOCAL_ACTION_PLANS_KEY = "atlas-local-action-plans-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParsePlans(value: string | null): LocalActionPlan[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "string") : [];
  } catch (error) {
    console.warn("Atlas local action plans: lecture localStorage impossible.", error);
    return [];
  }
}

function writePlans(plans: LocalActionPlan[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(LOCAL_ACTION_PLANS_KEY, JSON.stringify(plans));
  } catch (error) {
    console.warn("Atlas local action plans: sauvegarde localStorage impossible.", error);
  }
}

export function getLocalActionPlans() {
  if (!canUseStorage()) return [];
  return safeParsePlans(window.localStorage.getItem(LOCAL_ACTION_PLANS_KEY)).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function saveLocalActionPlan(plan: LocalActionPlan) {
  const plans = getLocalActionPlans();
  const nextPlan = { ...plan, updatedAt: new Date().toISOString(), persisted: false as const };
  const nextPlans = [nextPlan, ...plans.filter((item) => item.id !== plan.id)];
  writePlans(nextPlans);
  return nextPlan;
}

export function getLocalActionPlansByRecommendationId(recommendationId: string) {
  return getLocalActionPlans().filter((plan) => plan.sourceRecommendationId === recommendationId);
}

export function updateLocalActionPlan(plan: LocalActionPlan) {
  return saveLocalActionPlan(plan);
}

export function deleteLocalActionPlan(id: string) {
  const plans = getLocalActionPlans().filter((plan) => plan.id !== id);
  writePlans(plans);
}

export function clearLocalActionPlans() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(LOCAL_ACTION_PLANS_KEY);
}
