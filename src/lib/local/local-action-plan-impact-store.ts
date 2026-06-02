import type { LocalActionPlanImpact } from "@/types/local-action-plan-impact";

const LOCAL_ACTION_PLAN_IMPACTS_KEY = "atlas-local-action-plan-impacts-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParseImpacts(value: string | null): LocalActionPlanImpact[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "string") : [];
  } catch (error) {
    console.warn("Atlas local action plan impacts: lecture localStorage impossible.", error);
    return [];
  }
}

function writeImpacts(impacts: LocalActionPlanImpact[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(LOCAL_ACTION_PLAN_IMPACTS_KEY, JSON.stringify(impacts));
  } catch (error) {
    console.warn("Atlas local action plan impacts: sauvegarde localStorage impossible.", error);
  }
}

export function getLocalActionPlanImpacts() {
  if (!canUseStorage()) return [];
  return safeParseImpacts(window.localStorage.getItem(LOCAL_ACTION_PLAN_IMPACTS_KEY)).sort((a, b) =>
    b.measuredAt.localeCompare(a.measuredAt)
  );
}

export function saveLocalActionPlanImpact(impact: LocalActionPlanImpact) {
  const impacts = getLocalActionPlanImpacts();
  const nextImpact = { ...impact, measuredAt: new Date().toISOString(), persisted: false as const };
  writeImpacts([nextImpact, ...impacts.filter((item) => item.id !== impact.id)]);
  return nextImpact;
}

export function getLocalActionPlanImpactsByPlanId(actionPlanId: string) {
  return getLocalActionPlanImpacts().filter((impact) => impact.actionPlanId === actionPlanId);
}

export function deleteLocalActionPlanImpactsByPlanId(actionPlanId: string) {
  writeImpacts(getLocalActionPlanImpacts().filter((impact) => impact.actionPlanId !== actionPlanId));
}

export function clearLocalActionPlanImpacts() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(LOCAL_ACTION_PLAN_IMPACTS_KEY);
}
