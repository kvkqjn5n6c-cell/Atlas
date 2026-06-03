import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteLocalAlertSnapshot as deleteLocalAlertSnapshotLocal,
  getLocalAlertSnapshotsByKpiId as getLocalAlertSnapshotsByKpiIdLocal,
  getLocalAlertSnapshotsByOrganization as getLocalAlertSnapshotsByOrganizationLocal,
  saveLocalAlertSnapshot
} from "@/lib/local/local-alert-snapshots-store";
import type { LocalAlertSnapshot } from "@/types/local-alert-snapshots";

let lastFallbackUsed = false;

export function wasLocalAlertSnapshotsFallbackUsed() {
  return lastFallbackUsed;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type LocalAlertSnapshotRecord = {
  id: string;
  organizationId: string;
  alertId: string;
  sourceType: string;
  sourceId: string;
  severity: string;
  status: string;
  title: string;
  message: string;
  relatedKpiId: string | null;
  relatedRuleId: string | null;
  generatedAt: Date;
  metadata: unknown;
};

function toLocalAlertSnapshot(record: LocalAlertSnapshotRecord): LocalAlertSnapshot {
  return {
    id: record.id,
    organizationId: record.organizationId,
    alertId: record.alertId,
    sourceType: record.sourceType === "alert_rule" ? "alert_rule" : "kpi_status",
    sourceId: record.sourceId,
    severity: record.severity === "critical" ? "critical" : "warning",
    status: record.status === "resolved" || record.status === "ignored" ? record.status : "open",
    title: record.title,
    message: record.message,
    relatedKpiId: record.relatedKpiId ?? undefined,
    relatedRuleId: record.relatedRuleId ?? undefined,
    generatedAt: record.generatedAt.toISOString(),
    metadata: typeof record.metadata === "object" && record.metadata !== null
      ? record.metadata as LocalAlertSnapshot["metadata"]
      : undefined,
    persisted: false
  };
}

function toPrismaData(snapshot: LocalAlertSnapshot) {
  return {
    id: snapshot.id,
    organizationId: snapshot.organizationId,
    alertId: snapshot.alertId,
    sourceType: snapshot.sourceType,
    sourceId: snapshot.sourceId,
    severity: snapshot.severity,
    status: snapshot.status,
    title: snapshot.title,
    message: snapshot.message,
    relatedKpiId: snapshot.relatedKpiId,
    relatedRuleId: snapshot.relatedRuleId,
    generatedAt: new Date(snapshot.generatedAt),
    persistedSource: "prisma",
    metadata: snapshot.metadata ?? undefined
  };
}

export async function getLocalAlertSnapshotsByOrganization(organizationId: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalAlertSnapshotsByOrganizationLocal(organizationId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.localAlertSnapshot.findMany({
      where: { organizationId },
      orderBy: { generatedAt: "desc" }
    });
    return records.map(toLocalAlertSnapshot);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalAlertSnapshotsByOrganization failed, falling back to localStorage.", error);
    return getLocalAlertSnapshotsByOrganizationLocal(organizationId);
  }
}

export async function getLocalAlertSnapshotById(id: string, organizationId?: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    const snapshots = organizationId ? getLocalAlertSnapshotsByOrganizationLocal(organizationId) : [];
    return snapshots.find((snapshot) => snapshot.id === id) ?? null;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.localAlertSnapshot.findUnique({ where: { id } });
    return record ? toLocalAlertSnapshot(record) : null;
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalAlertSnapshotById failed, falling back to localStorage.", error);
    const snapshots = organizationId ? getLocalAlertSnapshotsByOrganizationLocal(organizationId) : [];
    return snapshots.find((snapshot) => snapshot.id === id) ?? null;
  }
}

export async function getLocalAlertSnapshotsByKpiId(kpiId: string, organizationId?: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) return getLocalAlertSnapshotsByKpiIdLocal(kpiId);

  try {
    const prisma = await getPrisma();
    const records = await prisma.localAlertSnapshot.findMany({
      where: {
        relatedKpiId: kpiId,
        ...(organizationId ? { organizationId } : {})
      },
      orderBy: { generatedAt: "desc" }
    });
    return records.map(toLocalAlertSnapshot);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] getLocalAlertSnapshotsByKpiId failed, falling back to localStorage.", error);
    return getLocalAlertSnapshotsByKpiIdLocal(kpiId);
  }
}

export async function upsertLocalAlertSnapshot(snapshot: LocalAlertSnapshot) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    saveLocalAlertSnapshot(snapshot);
    return snapshot;
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.localAlertSnapshot.upsert({
      where: { id: snapshot.id },
      create: toPrismaData(snapshot),
      update: toPrismaData(snapshot)
    });
    return toLocalAlertSnapshot(record);
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] upsertLocalAlertSnapshot failed, falling back to localStorage.", error);
    saveLocalAlertSnapshot(snapshot);
    return snapshot;
  }
}

export const createLocalAlertSnapshot = upsertLocalAlertSnapshot;
export const updateLocalAlertSnapshot = upsertLocalAlertSnapshot;

export async function deleteLocalAlertSnapshot(id: string) {
  lastFallbackUsed = false;
  if (!isPrismaMode()) {
    deleteLocalAlertSnapshotLocal(id);
    return;
  }

  try {
    const prisma = await getPrisma();
    await prisma.localAlertSnapshot.delete({ where: { id } });
  } catch (error) {
    lastFallbackUsed = true;
    console.warn("[DATA_MODE=prisma] deleteLocalAlertSnapshot failed, falling back to localStorage.", error);
    deleteLocalAlertSnapshotLocal(id);
  }
}
