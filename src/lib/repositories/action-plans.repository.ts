import { actionPlansMock } from "@/lib/mock/action-plans";

export function getActionPlans() {
  return actionPlansMock;
}

export function getActionPlansByOrganization(organizationId: string) {
  return actionPlansMock.filter((actionPlan) => actionPlan.organizationId === organizationId);
}

export function getActionPlanById(id: string) {
  return actionPlansMock.find((actionPlan) => actionPlan.id === id);
}

// TODO Phase 7: lire ActionPlan via Prisma en conservant les liens Alert/KPI.
