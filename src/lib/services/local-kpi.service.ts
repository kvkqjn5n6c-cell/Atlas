import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteLocalKpi,
  getLocalKpisByOrganization,
  upsertLocalKpi,
  wasLocalKpiFallbackUsed
} from "@/lib/repositories/local-kpi.repository";
import type { LocalKpiConfiguration } from "@/types/local-kpi";

function currentSource() {
  if (wasLocalKpiFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getLocalKpiConfigurationsData(organizationId: string) {
  const data = await getLocalKpisByOrganization(organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function saveLocalKpiConfigurationData(kpi: LocalKpiConfiguration) {
  const data = await upsertLocalKpi(kpi);
  return {
    data,
    source: currentSource()
  };
}

export async function deleteLocalKpiConfigurationData(id: string) {
  await deleteLocalKpi(id);
  return {
    success: true,
    source: currentSource()
  };
}
