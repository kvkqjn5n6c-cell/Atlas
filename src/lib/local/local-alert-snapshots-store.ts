import type { LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import type { LocalAlertSnapshot } from "@/types/local-alert-snapshots";

const storageKey = "atlas:local-alert-snapshots";
const maxSnapshots = 200;

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sortSnapshots(snapshots: LocalAlertSnapshot[]) {
  return [...snapshots].sort(
    (first, second) => new Date(second.generatedAt).getTime() - new Date(first.generatedAt).getTime()
  );
}

export function buildLocalAlertSnapshot(alert: LocalKpiAlert, organizationId: string): LocalAlertSnapshot {
  const sourceType = alert.alertSource === "rule" ? "alert_rule" : "kpi_status";
  const sourceId = alert.ruleId ?? alert.kpiId;

  return {
    id: `local-alert-snapshot-${alert.id}`,
    organizationId,
    alertId: alert.id,
    sourceType,
    sourceId,
    severity: alert.severity,
    status: "open",
    title: alert.title,
    message: alert.cause,
    relatedKpiId: alert.kpiId,
    relatedRuleId: alert.ruleId,
    generatedAt: alert.calculatedAt,
    metadata: {
      value: alert.value,
      targetValue: alert.targetValue,
      warningThreshold: alert.warningThreshold,
      criticalThreshold: alert.criticalThreshold,
      sourceFileName: alert.sourceFileName,
      alertSource: alert.alertSource,
      recommendedAction: alert.recommendedAction
    },
    persisted: false
  };
}

export function buildLocalAlertSnapshots(alerts: LocalKpiAlert[], organizationId: string) {
  return alerts.map((alert) => buildLocalAlertSnapshot(alert, organizationId));
}

export function getLocalAlertSnapshots(): LocalAlertSnapshot[] {
  if (!canUseLocalStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? sortSnapshots(parsedValue as LocalAlertSnapshot[]) : [];
  } catch (error) {
    console.warn("Impossible de relire les snapshots d'alertes locales Atlas.", error);
    return [];
  }
}

export function getLocalAlertSnapshotsByOrganization(organizationId: string) {
  return getLocalAlertSnapshots().filter((snapshot) => snapshot.organizationId === organizationId);
}

export function getLocalAlertSnapshotsByKpiId(kpiId: string) {
  return getLocalAlertSnapshots().filter((snapshot) => snapshot.relatedKpiId === kpiId);
}

export function saveLocalAlertSnapshot(snapshot: LocalAlertSnapshot) {
  if (!canUseLocalStorage()) return;

  try {
    const snapshots = getLocalAlertSnapshots().filter((item) => item.id !== snapshot.id);
    window.localStorage.setItem(storageKey, JSON.stringify(sortSnapshots([snapshot, ...snapshots]).slice(0, maxSnapshots)));
  } catch (error) {
    console.warn("Impossible d'enregistrer le snapshot d'alerte locale Atlas.", error);
  }
}

export function saveLocalAlertSnapshots(snapshots: LocalAlertSnapshot[]) {
  if (!canUseLocalStorage()) return;
  snapshots.forEach(saveLocalAlertSnapshot);
}

export function deleteLocalAlertSnapshot(id: string) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(getLocalAlertSnapshots().filter((snapshot) => snapshot.id !== id)));
  } catch (error) {
    console.warn("Impossible de supprimer le snapshot d'alerte locale Atlas.", error);
  }
}

export function clearLocalAlertSnapshots() {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn("Impossible d'effacer les snapshots d'alertes locales Atlas.", error);
  }
}
