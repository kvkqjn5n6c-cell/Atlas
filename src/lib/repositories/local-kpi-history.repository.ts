import { isPrismaMode } from "@/lib/config/data-mode";
import { KpiDirection as PrismaKpiDirection } from "@prisma/client";
import { inferKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import {
  deleteLocalKpiHistoryByKpiId,
  deleteLocalKpiHistoryPointById as deleteLocalHistoryPointFromStore,
  getLocalKpiHistory,
  getLocalKpiHistoryByKpiId as getLocalHistoryByKpiFromStore,
  saveLocalKpiHistoryPoint
} from "@/lib/local/local-kpi-history-store";
import type { KpiDirection } from "@/types/local-kpi";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";

let lastFallbackUsed = false;

export function wasLocalKpiHistoryFallbackUsed() {
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

type LocalKpiHistoryRecord = {
  id: string;
  kpiId: string;
  importId: string | null;
  calculatedAt: Date;
  value: number;
  status: string;
  direction: string;
  targetValue: number | null;
  warningThreshold: number | null;
  criticalThreshold: number | null;
  sourceFileName: string | null;
  trend: string | null;
  variation: number | null;
};

function toLocalHistoryPoint(record: LocalKpiHistoryRecord): LocalKpiHistoryPoint {
  return {
    id: record.id,
    kpiId: record.kpiId,
    importId: record.importId ?? undefined,
    calculatedAt: record.calculatedAt.toISOString(),
    value: record.value,
    status: record.status as LocalKpiHistoryPoint["status"],
    direction: fromPrismaDirection(record.direction),
    targetValue: record.targetValue ?? undefined,
    warningThreshold: record.warningThreshold ?? undefined,
    criticalThreshold: record.criticalThreshold ?? undefined,
    sourceFileName: record.sourceFileName ?? undefined,
    trend: record.trend ? record.trend as LocalKpiHistoryPoint["trend"] : undefined,
    variation: record.variation ?? undefined,
    persisted: false
  };
}

function toPrismaData(point: LocalKpiHistoryPoint, organizationId: string) {
  return {
    id: point.id,
    organizationId,
    kpiId: point.kpiId,
    importId: point.importId,
    calculatedAt: new Date(point.calculatedAt),
    value: point.value,
    status: point.status,
    direction: toPrismaDirection(point.direction),
    targetValue: point.targetValue,
    warningThreshold: point.warningThreshold,
    criticalThreshold: point.criticalThreshold,
    sourceFileName: point.sourceFileName,
    trend: point.trend,
    variation: point.variation,
    persistedSource: "prisma"
  };
}

export async function getLocalKpiHistoryByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalKpiHistory();

  try {
    const prisma = await getPrisma();
    const records = await prisma.localKpiHistoryPoint.findMany({
      where: { organizationId },
      orderBy: { calculatedAt: "desc" }
    });
    return records.map(toLocalHistoryPoint);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalKpiHistoryByOrganization failed, falling back to localStorage.", error);
    return getLocalKpiHistory();
  }
}

export async function getLocalKpiHistoryPointById(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalKpiHistory().find((point) => point.id === id) ?? null;

  try {
    const prisma = await getPrisma();
    const record = await prisma.localKpiHistoryPoint.findUnique({ where: { id } });
    return record ? toLocalHistoryPoint(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalKpiHistoryPointById failed, falling back to localStorage.", error);
    return getLocalKpiHistory().find((point) => point.id === id) ?? null;
  }
}

export async function getLocalKpiHistoryByKpi(kpiId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalHistoryByKpiFromStore(kpiId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.localKpiHistoryPoint.findMany({
      where: { kpiId },
      orderBy: { calculatedAt: "desc" }
    });
    return records.map(toLocalHistoryPoint);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalKpiHistoryByKpi failed, falling back to localStorage.", error);
    return getLocalHistoryByKpiFromStore(kpiId);
  }
}

export const getLocalKpiHistoryByKpiId = getLocalKpiHistoryByKpi;

export async function createLocalKpiHistoryPoint(point: LocalKpiHistoryPoint, organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    saveLocalKpiHistoryPoint(point);
    return point;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.localKpiHistoryPoint.upsert({
      where: { id: point.id },
      create: toPrismaData(point, organizationId),
      update: toPrismaData(point, organizationId)
    });
    return toLocalHistoryPoint(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] createLocalKpiHistoryPoint failed, falling back to localStorage.", error);
    saveLocalKpiHistoryPoint(point);
    return point;
  }
}

export const updateLocalKpiHistoryPoint = createLocalKpiHistoryPoint;

export async function deleteLocalKpiHistoryPointById(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteLocalHistoryPointFromStore(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.localKpiHistoryPoint.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteLocalKpiHistoryPointById failed, falling back to localStorage.", error);
    deleteLocalHistoryPointFromStore(id);
  }
}

export async function deleteLocalKpiHistoryByKpi(kpiId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteLocalKpiHistoryByKpiId(kpiId);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.localKpiHistoryPoint.deleteMany({ where: { kpiId } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteLocalKpiHistoryByKpi failed, falling back to localStorage.", error);
    deleteLocalKpiHistoryByKpiId(kpiId);
  }
}
