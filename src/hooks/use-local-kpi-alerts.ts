"use client";

import { useCallback, useEffect, useState } from "react";
import { saveLocalAlertSnapshotsAction } from "@/lib/actions/local-alert-snapshots-actions";
import { activeOrganizationId } from "@/lib/context/scope-defaults";
import { buildLocalAlertSnapshots, saveLocalAlertSnapshots } from "@/lib/local/local-alert-snapshots-store";
import {
  getEmptyLocalAlertsData,
  getLocalAlertsData,
  type LocalAlertsData
} from "@/lib/services/local-data/local-alerts-data.service";
import type { LocalDataResult } from "@/types/local-data-result";

export function useLocalKpiAlerts() {
  const [result, setResult] = useState<LocalDataResult<LocalAlertsData>>(() => getEmptyLocalAlertsData());

  const refresh = useCallback(() => {
    const nextResult = getLocalAlertsData();
    const snapshots = buildLocalAlertSnapshots(nextResult.data.alerts, activeOrganizationId);
    saveLocalAlertSnapshots(snapshots);
    if (snapshots.length > 0) void saveLocalAlertSnapshotsAction(snapshots);
    setResult(nextResult);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return {
    ...result,
    refresh
  };
}
