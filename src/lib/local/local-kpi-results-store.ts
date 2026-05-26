import type { LocalKpiResult } from "@/types/local-kpi-results";
import { inferKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";

const storageKey = "atlas:local-kpi-results";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sortResults(results: LocalKpiResult[]) {
  return [...results].sort(
    (first, second) => new Date(second.calculatedAt).getTime() - new Date(first.calculatedAt).getTime()
  );
}

function normalizeResult(result: LocalKpiResult): LocalKpiResult {
  return {
    ...result,
    direction: inferKpiDirection(result)
  };
}

export function getLocalKpiResults(): LocalKpiResult[] {
  if (!canUseLocalStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? sortResults((parsedValue as LocalKpiResult[]).map(normalizeResult)) : [];
  } catch (error) {
    console.warn("Impossible de relire les résultats KPI locaux Atlas.", error);
    return [];
  }
}

export function getLocalKpiResultsByImport(importId: string) {
  return getLocalKpiResults().filter((result) => result.importId === importId);
}

export function saveLocalKpiResult(result: LocalKpiResult) {
  if (!canUseLocalStorage()) return;

  try {
    const results = getLocalKpiResults().filter((item) => item.kpiId !== result.kpiId);
    window.localStorage.setItem(storageKey, JSON.stringify(sortResults([normalizeResult(result), ...results])));
  } catch (error) {
    console.warn("Impossible d'enregistrer le résultat KPI local Atlas.", error);
  }
}

export function deleteLocalKpiResult(id: string) {
  if (!canUseLocalStorage()) return;

  try {
    const results = getLocalKpiResults().filter((item) => item.id !== id && item.kpiId !== id);
    window.localStorage.setItem(storageKey, JSON.stringify(results));
  } catch (error) {
    console.warn("Impossible de supprimer le résultat KPI local Atlas.", error);
  }
}

export function clearLocalKpiResults() {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn("Impossible d'effacer les résultats KPI locaux Atlas.", error);
  }
}
