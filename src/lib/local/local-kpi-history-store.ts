import { MAX_KPI_HISTORY_POINTS } from "@/lib/config/import-limits";
import type { LocalKpiHistoryPoint } from "@/types/local-kpi-history";

const storageKey = "atlas:local-kpi-history";
const duplicateWindowMs = 10_000;

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sortHistory(points: LocalKpiHistoryPoint[]) {
  return [...points].sort(
    (first, second) => new Date(second.calculatedAt).getTime() - new Date(first.calculatedAt).getTime()
  );
}

function limitHistory(points: LocalKpiHistoryPoint[]) {
  const byKpi = new Map<string, LocalKpiHistoryPoint[]>();

  for (const point of sortHistory(points)) {
    const current = byKpi.get(point.kpiId) ?? [];
    if (current.length < MAX_KPI_HISTORY_POINTS) current.push(point);
    byKpi.set(point.kpiId, current);
  }

  return Array.from(byKpi.values()).flat();
}

export function getLocalKpiHistory(): LocalKpiHistoryPoint[] {
  if (!canUseLocalStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? sortHistory(parsedValue as LocalKpiHistoryPoint[]) : [];
  } catch (error) {
    console.warn("Impossible de relire l'historique KPI local Atlas.", error);
    return [];
  }
}

export function getLocalKpiHistoryByKpiId(kpiId: string) {
  return getLocalKpiHistory().filter((point) => point.kpiId === kpiId);
}

export function saveLocalKpiHistoryPoint(point: LocalKpiHistoryPoint) {
  if (!canUseLocalStorage()) return;

  try {
    const history = getLocalKpiHistory();
    const latestForKpi = history.find((item) => item.kpiId === point.kpiId);
    const isDuplicate =
      latestForKpi &&
      latestForKpi.value === point.value &&
      latestForKpi.status === point.status &&
      Math.abs(new Date(point.calculatedAt).getTime() - new Date(latestForKpi.calculatedAt).getTime()) < duplicateWindowMs;

    if (isDuplicate) return;

    window.localStorage.setItem(storageKey, JSON.stringify(limitHistory([point, ...history])));
  } catch (error) {
    console.warn("Impossible d'enregistrer l'historique KPI local Atlas.", error);
  }
}

export function deleteLocalKpiHistoryByKpiId(kpiId: string) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(getLocalKpiHistory().filter((point) => point.kpiId !== kpiId)));
  } catch (error) {
    console.warn("Impossible de supprimer l'historique KPI local Atlas.", error);
  }
}

export function clearLocalKpiHistory() {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn("Impossible d'effacer l'historique KPI local Atlas.", error);
  }
}
