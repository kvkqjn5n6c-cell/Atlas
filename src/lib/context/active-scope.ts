import {
  getActionPlansByOrganization as getActionPlansByOrganizationRepository
} from "@/lib/repositories/action-plans.repository";
import { getAlertsByOrganization as getAlertsByOrganizationRepository } from "@/lib/repositories/alerts.repository";
import {
  getDataSourcesByOrganizationMock,
  getImportJobsByOrganization
} from "@/lib/repositories/data-sources.repository";
import { getKpiResultsByOrganizationMock } from "@/lib/repositories/kpi.repository";
import {
  getOrganizationByIdMock as getOrganizationByIdRepository
} from "@/lib/repositories/organizations.repository";
import { getReportsByOrganization as getReportsByOrganizationRepository } from "@/lib/repositories/reports.repository";
import { getUserById } from "@/lib/repositories/users.repository";
import { activeUser } from "@/lib/mock/users";
import { getDataSourcesData } from "@/lib/services/data-sources.service";
import { getOrganizationDetailData } from "@/lib/services/organizations.service";
export { activeOrganizationId, activePeriod, activeUserId } from "@/lib/context/scope-defaults";
import { activeOrganizationId, activePeriod, activeUserId } from "@/lib/context/scope-defaults";

export function getActiveOrganization() {
  return getOrganizationByIdRepository(activeUser.activeOrganizationId);
}

export function getActiveUser() {
  return getUserById(activeUserId);
}

export function getOrganizationById(organizationId: string) {
  return getOrganizationByIdRepository(organizationId);
}

export function getDataSourcesByOrganization(organizationId = activeOrganizationId) {
  return getDataSourcesByOrganizationMock(organizationId);
}

export function getImportsByOrganization(organizationId = activeOrganizationId) {
  return getImportJobsByOrganization(organizationId);
}

export function getKpisByOrganization(organizationId = activeOrganizationId) {
  return getKpiResultsByOrganizationMock(organizationId);
}

export function getAlertsByOrganization(organizationId = activeOrganizationId) {
  return getAlertsByOrganizationRepository(organizationId);
}

export function getActionPlansByOrganization(organizationId = activeOrganizationId) {
  return getActionPlansByOrganizationRepository(organizationId);
}

export function getReportsByOrganization(organizationId = activeOrganizationId) {
  return getReportsByOrganizationRepository(organizationId);
}

export function getScopedPilotageData(organizationId = activeOrganizationId) {
  return {
    organization: getOrganizationById(organizationId),
    period: activePeriod,
    dataSources: getDataSourcesByOrganization(organizationId),
    importJobs: getImportsByOrganization(organizationId),
    kpiResults: getKpisByOrganization(organizationId),
    alerts: getAlertsByOrganization(organizationId),
    actionPlans: getActionPlansByOrganization(organizationId),
    reports: getReportsByOrganization(organizationId)
  };
}

export async function getScopedPilotageDataAsync(organizationId = activeOrganizationId) {
  const [organizationResult, dataSourcesResult] = await Promise.all([
    getOrganizationDetailData(organizationId),
    getDataSourcesData()
  ]);

  return {
    organization: organizationResult.data?.organization,
    period: activePeriod,
    dataSources: organizationResult.data?.sources ?? dataSourcesResult.data.sources,
    importJobs: organizationResult.data?.imports ?? [],
    kpiResults: organizationResult.data?.kpis ?? [],
    alerts: organizationResult.data?.alerts ?? [],
    actionPlans: organizationResult.data?.actions ?? [],
    reports: getReportsByOrganization(organizationId),
    sourceMode: organizationResult.sourceMode,
    fallbackUsed: organizationResult.fallbackUsed || dataSourcesResult.fallbackUsed
  };
}
