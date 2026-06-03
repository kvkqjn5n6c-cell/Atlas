import { isPrismaMode } from "@/lib/config/data-mode";
import {
  deleteLocalAlertSnapshot,
  getLocalAlertSnapshotById,
  getLocalAlertSnapshotsByKpiId,
  getLocalAlertSnapshotsByOrganization,
  upsertLocalAlertSnapshot,
  wasLocalAlertSnapshotsFallbackUsed
} from "@/lib/repositories/local-alert-snapshots.repository";
import type { LocalAlertSnapshot } from "@/types/local-alert-snapshots";

function currentSource() {
  if (wasLocalAlertSnapshotsFallbackUsed()) return "fallback" as const;
  return isPrismaMode() ? "prisma" as const : "local" as const;
}

export async function getLocalAlertSnapshotsData(organizationId: string) {
  const data = await getLocalAlertSnapshotsByOrganization(organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function getLocalAlertSnapshotByIdData(id: string, organizationId?: string) {
  const data = await getLocalAlertSnapshotById(id, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function getLocalAlertSnapshotsByKpiData(kpiId: string, organizationId?: string) {
  const data = await getLocalAlertSnapshotsByKpiId(kpiId, organizationId);
  return {
    data,
    source: currentSource()
  };
}

export async function saveLocalAlertSnapshotData(snapshot: LocalAlertSnapshot) {
  const data = await upsertLocalAlertSnapshot(snapshot);
  return {
    data,
    source: currentSource()
  };
}

export const createLocalAlertSnapshotData = saveLocalAlertSnapshotData;
export const updateLocalAlertSnapshotData = saveLocalAlertSnapshotData;

export async function saveLocalAlertSnapshotsData(snapshots: LocalAlertSnapshot[]) {
  const results = [];

  for (const snapshot of snapshots) {
    results.push(await saveLocalAlertSnapshotData(snapshot));
  }

  return {
    data: results.map((result) => result.data),
    source: results.some((result) => result.source === "fallback") ? "fallback" as const : currentSource()
  };
}

export async function deleteLocalAlertSnapshotData(id: string) {
  await deleteLocalAlertSnapshot(id);
  return {
    success: true,
    source: currentSource()
  };
}
