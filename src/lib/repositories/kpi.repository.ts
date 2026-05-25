import { kpiConfigurationsMock } from "@/lib/mock/kpi-configurations";
import { performanceKpisMock } from "@/lib/mock/kpis";
import { isPrismaMode } from "@/lib/config/data-mode";
import type { KpiConfiguration, KPIDataQuality, KPIStatus, KPITrend, PerformanceKPI } from "@/types/atlas";

let lastFallbackUsed = false;

export function wasKpiFallbackUsed() {
  return lastFallbackUsed;
}

export function getKpiConfigurations() {
  return kpiConfigurationsMock;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export function getKpiConfigurationsByOrganizationMock(organizationId: string) {
  return kpiConfigurationsMock.filter((configuration) => configuration.organizationId === organizationId);
}

export function getKpiConfigurationById(id: string) {
  return kpiConfigurationsMock.find((configuration) => configuration.id === id);
}

export function getKpiResultsByOrganizationMock(organizationId: string) {
  return performanceKpisMock.filter((kpi) => kpi.organizationId === organizationId);
}

export function getKpiResultById(id: string) {
  return performanceKpisMock.find((kpi) => kpi.id === id);
}

function toKpiConfiguration(record: {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  dataSourceId: string;
  calculationType: string;
  primaryField: string;
  secondaryField: string | null;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  frequency: string;
  owner: string;
  expectedImpact: string;
  isActive: boolean;
}): KpiConfiguration {
  return {
    id: record.id,
    kpiId: record.id,
    organizationId: record.organizationId,
    name: record.name,
    category: record.category as KpiConfiguration["category"],
    sourceId: record.dataSourceId,
    formula: record.calculationType,
    businessDefinition: `KPI ${record.name} configure depuis Prisma.`,
    usedFields: [record.primaryField, record.secondaryField].filter(Boolean) as KpiConfiguration["usedFields"],
    calculationMethod: record.calculationType,
    target: record.targetValue,
    alertThreshold: record.warningThreshold,
    criticalThreshold: record.criticalThreshold,
    frequency:
      record.frequency === "DAILY" ? "daily" : record.frequency === "WEEKLY" ? "weekly" : "monthly",
    isActive: record.isActive,
    businessOwner: record.owner,
    expectedImpact: record.expectedImpact
  };
}

function toKpiResult(record: {
  id: string;
  organizationId: string;
  value: number;
  targetValue: number;
  gap: number;
  status: string;
  trend: string;
  dataQuality: string;
  calculatedAt: Date;
  kpiConfiguration: {
    id: string;
    name: string;
    category: string;
    dataSourceId: string;
  };
}): PerformanceKPI {
  const statusMap: Record<string, KPIStatus> = {
    HEALTHY: "healthy",
    WATCH: "watch",
    CRITICAL: "critical"
  };
  const trendMap: Record<string, KPITrend> = {
    UP: "up",
    DOWN: "down",
    STABLE: "stable"
  };
  const dataQualityMap: Record<string, KPIDataQuality> = {
    RELIABLE: "reliable",
    PARTIAL: "partial",
    OUTDATED: "outdated",
    ERROR: "error"
  };

  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.kpiConfiguration.name,
    category: record.kpiConfiguration.category as PerformanceKPI["category"],
    value: record.value,
    unit: record.kpiConfiguration.category === "revenue" || record.kpiConfiguration.category === "cash" ? "EUR" : "%",
    target: record.targetValue,
    deviation: record.gap,
    trend: trendMap[record.trend] ?? "stable",
    status: statusMap[record.status] ?? "watch",
    dataQuality: dataQualityMap[record.dataQuality] ?? "partial",
    lastUpdated: new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(record.calculatedAt),
    sourceId: record.kpiConfiguration.dataSourceId,
    insight: "Resultat KPI lu depuis Prisma en mode DATA_MODE=prisma."
  };
}

export async function getKpiConfigurationsByOrganization(organizationId: string) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) {
    return getKpiConfigurationsByOrganizationMock(organizationId);
  }

  try {
    const prisma = await getPrisma();
    const records = await prisma.kPIConfiguration.findMany({
      where: { organizationId },
      orderBy: { name: "asc" }
    });
    return records.map(toKpiConfiguration);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn(
      "[DATA_MODE=prisma] getKpiConfigurationsByOrganization failed, falling back to mocks.",
      error
    );
    return getKpiConfigurationsByOrganizationMock(organizationId);
  }
}

export async function getKpiResultsByOrganization(organizationId: string) {
  lastFallbackUsed = false;

  if (!isPrismaMode()) {
    return getKpiResultsByOrganizationMock(organizationId);
  }

  try {
    const prisma = await getPrisma();
    const records = await prisma.kPIResult.findMany({
      where: { organizationId },
      include: { kpiConfiguration: true },
      orderBy: { calculatedAt: "desc" }
    });
    return records.map(toKpiResult);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn(
      "[DATA_MODE=prisma] getKpiResultsByOrganization failed, falling back to mocks.",
      error
    );
    return getKpiResultsByOrganizationMock(organizationId);
  }
}
