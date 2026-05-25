import { alertsMock } from "@/lib/mock/alerts";

export function getAlerts() {
  return alertsMock;
}

export function getAlertsByOrganization(organizationId: string) {
  return alertsMock.filter((alert) => alert.organizationId === organizationId);
}

export function getAlertById(id: string) {
  return alertsMock.find((alert) => alert.id === id);
}

// TODO Phase 7: lire Alert via Prisma avec filtres organizationId/status.
