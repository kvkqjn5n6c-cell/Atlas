import { calculatePerformanceScore } from "@/lib/business/performance";
import { getDataMode, isPrismaMode } from "@/lib/config/data-mode";
import { activePeriod } from "@/lib/context/scope-defaults";
import { getActionPlansByOrganization } from "@/lib/repositories/action-plans.repository";
import { getAlertsByOrganization } from "@/lib/repositories/alerts.repository";
import {
  getDataSourcesByOrganization,
  getImportJobsByOrganization,
  wasDataSourcesFallbackUsed
} from "@/lib/repositories/data-sources.repository";
import { getKpiResultsByOrganization, wasKpiFallbackUsed } from "@/lib/repositories/kpi.repository";
import { getOrganizationById, getOrganizations, wasOrganizationsFallbackUsed } from "@/lib/repositories/organizations.repository";
import type { ActionPlanItem, Alert, DataImportJob, DataSource, Organization, PerformanceKPI } from "@/types/atlas";
import type { ServiceResult } from "@/types/service-results";

export type OrganizationSummary = {
  organization: Organization;
  score: number;
  sourcesCount: number;
  alertsCount: number;
  hasCriticalAlert: boolean;
};

export type OrganizationsData = {
  organizations: OrganizationSummary[];
};

export type OrganizationDetailData = {
  organization: Organization;
  sources: DataSource[];
  imports: DataImportJob[];
  kpis: PerformanceKPI[];
  alerts: Alert[];
  actions: ActionPlanItem[];
  score: number;
  activePeriod: string;
};

function warning() {
  return isPrismaMode() ? "Fallback mock automatique si Prisma n'est pas disponible." : undefined;
}

export async function getOrganizationsData(): Promise<ServiceResult<OrganizationsData>> {
  const organizations = await getOrganizations();
  const summaries = await Promise.all(
    organizations.map(async (organization) => {
      const [kpis, alerts, sources] = await Promise.all([
        getKpiResultsByOrganization(organization.id),
        Promise.resolve(getAlertsByOrganization(organization.id)),
        getDataSourcesByOrganization(organization.id)
      ]);

      return {
        organization,
        score: calculatePerformanceScore(kpis, alerts),
        sourcesCount: sources.length,
        alertsCount: alerts.length,
        hasCriticalAlert: alerts.some((alert) => alert.severity === "critical")
      };
    })
  );

  return {
    success: true,
    data: { organizations: summaries },
    sourceMode: getDataMode(),
    fallbackUsed: wasOrganizationsFallbackUsed() || wasDataSourcesFallbackUsed() || wasKpiFallbackUsed(),
    warning: warning()
  };
}

export async function getOrganizationDetailData(
  id: string
): Promise<ServiceResult<OrganizationDetailData | null>> {
  const organization = await getOrganizationById(id);

  if (!organization) {
    return {
      success: false,
      data: null,
      sourceMode: getDataMode(),
      fallbackUsed: false,
      warning: "Organisation introuvable."
    };
  }

  const [sources, kpis] = await Promise.all([
    getDataSourcesByOrganization(organization.id),
    getKpiResultsByOrganization(organization.id)
  ]);
  const imports = getImportJobsByOrganization(organization.id);
  const alerts = getAlertsByOrganization(organization.id);
  const actions = getActionPlansByOrganization(organization.id);

  return {
    success: true,
    data: {
      organization,
      sources,
      imports,
      kpis,
      alerts,
      actions,
      score: calculatePerformanceScore(kpis, alerts),
      activePeriod
    },
    sourceMode: getDataMode(),
    fallbackUsed: wasOrganizationsFallbackUsed() || wasDataSourcesFallbackUsed() || wasKpiFallbackUsed(),
    warning: warning()
  };
}
