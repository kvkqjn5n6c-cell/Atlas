"use server";

import {
  deleteLocalAlertSnapshotData,
  saveLocalAlertSnapshotData,
  saveLocalAlertSnapshotsData
} from "@/lib/services/local-alert-snapshots.service";
import type { LocalAlertSnapshot } from "@/types/local-alert-snapshots";

export async function saveLocalAlertSnapshotAction(snapshot: LocalAlertSnapshot) {
  const result = await saveLocalAlertSnapshotData(snapshot);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function saveLocalAlertSnapshotsAction(snapshots: LocalAlertSnapshot[]) {
  const result = await saveLocalAlertSnapshotsData(snapshots);
  return {
    success: true,
    source: result.source,
    data: result.data
  };
}

export async function deleteLocalAlertSnapshotAction(id: string) {
  const result = await deleteLocalAlertSnapshotData(id);
  return {
    success: true,
    source: result.source
  };
}
