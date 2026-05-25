import { getDataMode, isPrismaMode } from "@/lib/config/data-mode";
import {
  getKpiConfigurationsByOrganization,
  getKpiResultsByOrganization,
  wasKpiFallbackUsed
} from "@/lib/repositories/kpi.repository";
import type { KpiConfiguration, PerformanceKPI } from "@/types/atlas";
import type { ServiceResult } from "@/types/service-results";

export type OrganizationKpiData = {
  configurations: KpiConfiguration[];
  results: PerformanceKPI[];
};

export async function getOrganizationKpiData(
  organizationId: string
): Promise<ServiceResult<OrganizationKpiData>> {
  const [configurations, results] = await Promise.all([
    getKpiConfigurationsByOrganization(organizationId),
    getKpiResultsByOrganization(organizationId)
  ]);

  return {
    success: true,
    data: { configurations, results },
    sourceMode: getDataMode(),
    fallbackUsed: wasKpiFallbackUsed(),
    warning: isPrismaMode() ? "Les repositories KPI basculent automatiquement en mock si Prisma echoue." : undefined
  };
}
