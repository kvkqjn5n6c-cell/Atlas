import { isPrismaMode } from "@/lib/config/data-mode";
import { KpiDirection as PrismaKpiDirection } from "@prisma/client";
import { inferKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { deleteLocalKpiConfiguration, getLocalKpiConfigurations, saveLocalKpiConfiguration } from "@/lib/local/local-kpi-store";
import type { KpiDirection, LocalKpiConfiguration } from "@/types/local-kpi";

let lastFallbackUsed = false;

export function wasLocalKpiFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

function toPrismaDirection(direction?: KpiDirection) {
  return inferKpiDirection({ direction }) === "lower_is_better"
    ? PrismaKpiDirection.LOWER_IS_BETTER
    : PrismaKpiDirection.HIGHER_IS_BETTER;
}

function fromPrismaDirection(direction?: string): KpiDirection {
  return direction === "LOWER_IS_BETTER" ? "lower_is_better" : "higher_is_better";
}

type LocalKpiRecord = {
  id: string;
  organizationId: string;
  importId: string | null;
  sourceFileName: string;
  name: string;
  category: string;
  calculationType: string;
  direction: string;
  primaryField: string;
  secondaryField: string | null;
  sourceColumn: string | null;
  secondarySourceColumn: string | null;
  fieldType: string | null;
  customFieldLabel: string | null;
  displayFieldLabel: string | null;
  filterField: string | null;
  filterValue: string | null;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  frequency: string;
  owner: string;
  expectedImpact: string;
  testResult: unknown;
  thresholdChanges: unknown;
  createdAt: Date;
};

function toLocalKpi(record: LocalKpiRecord): LocalKpiConfiguration {
  return {
    id: record.id,
    name: record.name,
    organizationId: record.organizationId,
    importId: record.importId ?? undefined,
    sourceFileName: record.sourceFileName,
    importCreatedAt: record.createdAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    category: record.category as LocalKpiConfiguration["category"],
    calculationType: record.calculationType as LocalKpiConfiguration["calculationType"],
    direction: fromPrismaDirection(record.direction),
    primaryField: record.primaryField as LocalKpiConfiguration["primaryField"],
    secondaryField: record.secondaryField ? record.secondaryField as LocalKpiConfiguration["secondaryField"] : undefined,
    filterField: record.filterField ? record.filterField as LocalKpiConfiguration["filterField"] : undefined,
    filterValue: record.filterValue ?? undefined,
    sourceColumn: record.sourceColumn ?? undefined,
    secondarySourceColumn: record.secondarySourceColumn ?? undefined,
    fieldType: record.fieldType ? record.fieldType as LocalKpiConfiguration["fieldType"] : undefined,
    customFieldLabel: record.customFieldLabel ?? undefined,
    displayFieldLabel: record.displayFieldLabel ?? undefined,
    targetValue: record.targetValue,
    warningThreshold: record.warningThreshold,
    criticalThreshold: record.criticalThreshold,
    frequency: record.frequency as LocalKpiConfiguration["frequency"],
    owner: record.owner,
    expectedImpact: record.expectedImpact,
    testResult: record.testResult as LocalKpiConfiguration["testResult"],
    thresholdChanges: Array.isArray(record.thresholdChanges)
      ? record.thresholdChanges as LocalKpiConfiguration["thresholdChanges"]
      : undefined,
    persisted: false
  };
}

function toPrismaData(kpi: LocalKpiConfiguration) {
  return {
    id: kpi.id,
    organizationId: kpi.organizationId,
    importId: kpi.importId,
    sourceFileName: kpi.sourceFileName,
    name: kpi.name,
    category: kpi.category,
    calculationType: kpi.calculationType,
    direction: toPrismaDirection(kpi.direction),
    primaryField: kpi.primaryField,
    secondaryField: kpi.secondaryField,
    sourceColumn: kpi.sourceColumn,
    secondarySourceColumn: kpi.secondarySourceColumn,
    fieldType: kpi.fieldType,
    customFieldLabel: kpi.customFieldLabel,
    displayFieldLabel: kpi.displayFieldLabel,
    filterField: kpi.filterField,
    filterValue: kpi.filterValue,
    targetValue: kpi.targetValue,
    warningThreshold: kpi.warningThreshold,
    criticalThreshold: kpi.criticalThreshold,
    frequency: kpi.frequency,
    owner: kpi.owner,
    expectedImpact: kpi.expectedImpact,
    testResult: kpi.testResult ?? undefined,
    thresholdChanges: kpi.thresholdChanges ?? undefined,
    persistedSource: "prisma"
  };
}

export async function getLocalKpisByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalKpiConfigurations().filter((kpi) => kpi.organizationId === organizationId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.localKpiConfiguration.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" }
    });
    return records.map(toLocalKpi);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalKpisByOrganization failed, falling back to localStorage.", error);
    return getLocalKpiConfigurations().filter((kpi) => kpi.organizationId === organizationId);
  }
}

export async function upsertLocalKpi(kpi: LocalKpiConfiguration) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    saveLocalKpiConfiguration(kpi);
    return kpi;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.localKpiConfiguration.upsert({
      where: { id: kpi.id },
      create: toPrismaData(kpi),
      update: toPrismaData(kpi)
    });
    return toLocalKpi(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertLocalKpi failed, falling back to localStorage.", error);
    saveLocalKpiConfiguration(kpi);
    return kpi;
  }
}

export async function deleteLocalKpi(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteLocalKpiConfiguration(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.localKpiConfiguration.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteLocalKpi failed, falling back to localStorage.", error);
    deleteLocalKpiConfiguration(id);
  }
}
