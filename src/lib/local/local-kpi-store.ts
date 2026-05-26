import type { LocalKpiConfiguration } from "@/types/local-kpi";
import { inferKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";

const storageKey = "atlas:local-kpi-configurations";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getLocalKpiConfigurations(): LocalKpiConfiguration[] {
  if (!canUseLocalStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue)
      ? (parsedValue as LocalKpiConfiguration[]).map((kpi) => ({ ...kpi, direction: inferKpiDirection(kpi) }))
      : [];
  } catch (error) {
    console.warn("Impossible de relire les KPI locaux Atlas.", error);
    return [];
  }
}

export function saveLocalKpiConfiguration(kpi: LocalKpiConfiguration) {
  if (!canUseLocalStorage()) return;

  try {
    const existingKpis = getLocalKpiConfigurations().filter((item) => item.id !== kpi.id);
    window.localStorage.setItem(storageKey, JSON.stringify([{ ...kpi, direction: inferKpiDirection(kpi) }, ...existingKpis]));
  } catch (error) {
    console.warn("Impossible d'enregistrer le KPI local Atlas.", error);
  }
}

export function deleteLocalKpiConfiguration(id: string) {
  if (!canUseLocalStorage()) return;

  try {
    const remainingKpis = getLocalKpiConfigurations().filter((item) => item.id !== id);
    window.localStorage.setItem(storageKey, JSON.stringify(remainingKpis));
  } catch (error) {
    console.warn("Impossible de supprimer le KPI local Atlas.", error);
  }
}

export function clearLocalKpiConfigurations() {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn("Impossible d'effacer les KPI locaux Atlas.", error);
  }
}
