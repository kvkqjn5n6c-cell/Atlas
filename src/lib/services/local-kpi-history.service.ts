import { isPrismaMode } from "@/lib/config/data-mode";
import {
  createLocalKpiHistoryPoint,
  deleteLocalKpiHistoryByKpi,
  getLocalKpiHistoryByOrganization,
  wasLocalKpiHistoryFallbackUsed
} from "@/lib/repositories/local-kpi-history.repository";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";

function currentSource() {
  if (wasLocalKpiHistoryFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getLocalKpiHistoryData(organizationId: string) {
  const data = await getLocalKpiHistoryByOrganization(organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function saveLocalKpiHistoryPointData(point: LocalKpiHistoryPoint, organizationId: string) {
  const data = await createLocalKpiHistoryPoint(point, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function deleteLocalKpiHistoryData(kpiId: string) {
  await deleteLocalKpiHistoryByKpi(kpiId);
  return {
    success: true,
    source: currentSource()
  };
}
