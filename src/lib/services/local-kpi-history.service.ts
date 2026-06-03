import { isPrismaMode } from "@/lib/config/data-mode";
import {
  createLocalKpiHistoryPoint,
  deleteLocalKpiHistoryByKpi,
  deleteLocalKpiHistoryPointById,
  getLocalKpiHistoryByKpi,
  getLocalKpiHistoryPointById,
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

export async function getLocalKpiHistoryPointByIdData(id: string) {
  const data = await getLocalKpiHistoryPointById(id);
  return {
    data,
    source: currentSource()
  };
}

export async function getLocalKpiHistoryByKpiData(kpiId: string) {
  const data = await getLocalKpiHistoryByKpi(kpiId);
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

export const createLocalKpiHistoryPointData = saveLocalKpiHistoryPointData;
export const updateLocalKpiHistoryPointData = saveLocalKpiHistoryPointData;

export async function deleteLocalKpiHistoryPointData(id: string) {
  await deleteLocalKpiHistoryPointById(id);
  return {
    success: true,
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
