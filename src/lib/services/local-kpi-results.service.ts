import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteLocalKpiResultById,
  deleteLocalKpiResultsByKpiId,
  getLocalKpiResultById,
  getLocalKpiResultsByOrganization,
  getLocalKpiResultsByKpiId,
  upsertLocalKpiResult,
  wasLocalKpiResultsFallbackUsed
} from "@/lib/repositories/local-kpi-results.repository";
import type { LocalKpiResult } from "@/types/local-kpi-results";

function currentSource() {
  if (wasLocalKpiResultsFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getLocalKpiResultsData(organizationId: string) {
  const data = await getLocalKpiResultsByOrganization(organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function getLocalKpiResultByIdData(id: string) {
  const data = await getLocalKpiResultById(id);
  return {
    data,
    source: currentSource()
  };
}

export async function getLocalKpiResultsByKpiData(kpiId: string) {
  const data = await getLocalKpiResultsByKpiId(kpiId);
  return {
    data,
    source: currentSource()
  };
}

export async function saveLocalKpiResultData(result: LocalKpiResult, organizationId: string) {
  const data = await upsertLocalKpiResult(result, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export const createLocalKpiResultData = saveLocalKpiResultData;
export const updateLocalKpiResultData = saveLocalKpiResultData;

export async function deleteLocalKpiResultData(id: string) {
  await deleteLocalKpiResultById(id);
  return {
    success: true,
    source: currentSource()
  };
}

export async function deleteLocalKpiResultsByKpiData(kpiId: string) {
  await deleteLocalKpiResultsByKpiId(kpiId);
  return {
    success: true,
    source: currentSource()
  };
}
