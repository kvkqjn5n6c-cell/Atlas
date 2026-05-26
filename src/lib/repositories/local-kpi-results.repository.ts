import { isPrismaMode } from "@/lib/config/data-mode";
import { KpiDirection as PrismaKpiDirection } from "@prisma/client";
import { inferKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { deleteLocalKpiResult, getLocalKpiResults, saveLocalKpiResult } from "@/lib/local/local-kpi-results-store";
import type { KpiDirection } from "@/types/local-kpi";
import type { LocalKpiResult } from "@/types/local-kpi-results";

let lastFallbackUsed = false;

export function wasLocalKpiResultsFallbackUsed() {
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

type LocalKpiResultRecord = {
  id: string;
  kpiId: string;
  importId: string | null;
  name: string;
  displayFieldLabel: string | null;
  calculationType: string;
  direction: string;
  value: number;
  targetValue: number | null;
  warningThreshold: number | null;
  criticalThreshold: number | null;
  status: string;
  trend: string | null;
  variation: number | null;
  calculatedAt: Date;
  sourceFileName: string;
};

function toLocalKpiResult(record: LocalKpiResultRecord): LocalKpiResult {
  return {
    id: record.id,
    kpiId: record.kpiId,
    importId: record.importId ?? undefined,
    name: record.name,
    displayFieldLabel: record.displayFieldLabel ?? undefined,
    calculationType: record.calculationType as LocalKpiResult["calculationType"],
    direction: fromPrismaDirection(record.direction),
    value: record.value,
    targetValue: record.targetValue ?? undefined,
    warningThreshold: record.warningThreshold ?? undefined,
    criticalThreshold: record.criticalThreshold ?? undefined,
    status: record.status as LocalKpiResult["status"],
    trend: record.trend ? record.trend as LocalKpiResult["trend"] : undefined,
    variation: record.variation ?? undefined,
    calculatedAt: record.calculatedAt.toISOString(),
    sourceFileName: record.sourceFileName,
    persisted: false
  };
}

function toPrismaData(result: LocalKpiResult, organizationId: string) {
  return {
    id: result.id,
    organizationId,
    kpiId: result.kpiId,
    importId: result.importId,
    name: result.name,
    displayFieldLabel: result.displayFieldLabel,
    calculationType: result.calculationType,
    direction: toPrismaDirection(result.direction),
    value: result.value,
    targetValue: result.targetValue,
    warningThreshold: result.warningThreshold,
    criticalThreshold: result.criticalThreshold,
    status: result.status,
    trend: result.trend,
    variation: result.variation,
    calculatedAt: new Date(result.calculatedAt),
    sourceFileName: result.sourceFileName,
    persistedSource: "prisma"
  };
}

export async function getLocalKpiResultsByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalKpiResults();

  try {
    const prisma = await getPrisma();
    const records = await prisma.localKpiResult.findMany({
      where: { organizationId },
      orderBy: { calculatedAt: "desc" }
    });
    return records.map(toLocalKpiResult);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalKpiResultsByOrganization failed, falling back to localStorage.", error);
    return getLocalKpiResults();
  }
}

export async function getLocalKpiResultsByKpiId(kpiId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalKpiResults().filter((result) => result.kpiId === kpiId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.localKpiResult.findMany({
      where: { kpiId },
      orderBy: { calculatedAt: "desc" }
    });
    return records.map(toLocalKpiResult);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalKpiResultsByKpiId failed, falling back to localStorage.", error);
    return getLocalKpiResults().filter((result) => result.kpiId === kpiId);
  }
}

export async function upsertLocalKpiResult(result: LocalKpiResult, organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    saveLocalKpiResult(result);
    return result;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.localKpiResult.upsert({
      where: { id: result.id },
      create: toPrismaData(result, organizationId),
      update: toPrismaData(result, organizationId)
    });
    return toLocalKpiResult(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertLocalKpiResult failed, falling back to localStorage.", error);
    saveLocalKpiResult(result);
    return result;
  }
}

export async function deleteLocalKpiResultById(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteLocalKpiResult(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.localKpiResult.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteLocalKpiResultById failed, falling back to localStorage.", error);
    deleteLocalKpiResult(id);
  }
}
