import { reportsMock } from "@/lib/mock/reports";

export function getReports() {
  return reportsMock;
}

export function getReportsByOrganization(organizationId: string) {
  return reportsMock.filter((report) => report.organizationId === organizationId);
}

export function getReportById(id: string) {
  return reportsMock.find((report) => report.id === id);
}

// TODO Phase 7: lire Report via Prisma par organisation et periode.
