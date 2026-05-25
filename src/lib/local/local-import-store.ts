import type { LocalValidatedImport } from "@/types/data-import";

const storageKey = "atlas:last-local-import";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveLastLocalImport(importResult: LocalValidatedImport) {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(importResult));
  } catch (error) {
    console.warn("Impossible d'enregistrer l'import local Atlas.", error);
  }
}

export function getLastLocalImport(): LocalValidatedImport | null {
  if (!canUseLocalStorage()) return null;

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return null;
    return JSON.parse(rawValue) as LocalValidatedImport;
  } catch (error) {
    console.warn("Impossible de relire l'import local Atlas.", error);
    return null;
  }
}

export function clearLastLocalImport() {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn("Impossible d'effacer l'import local Atlas.", error);
  }
}
