import { MAX_LOCAL_IMPORT_STORAGE_BYTES, MAX_LOCAL_STORAGE_ROWS } from "@/lib/config/import-limits";
import type { LocalValidatedImport } from "@/types/data-import";

const storageKey = "atlas:last-local-import";

export type LocalImportStoreResult = {
  success: boolean;
  message: string;
};

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function trimImportForStorage(importResult: LocalValidatedImport): LocalValidatedImport {
  return {
    ...importResult,
    previewRows: importResult.previewRows.slice(0, MAX_LOCAL_STORAGE_ROWS)
  };
}

export function saveLastLocalImport(importResult: LocalValidatedImport): LocalImportStoreResult {
  if (!canUseLocalStorage()) {
    return {
      success: false,
      message: "Stockage local indisponible dans ce contexte."
    };
  }

  const storagePayload = trimImportForStorage(importResult);
  const serializedPayload = JSON.stringify(storagePayload);

  if (serializedPayload.length > MAX_LOCAL_IMPORT_STORAGE_BYTES) {
    return {
      success: false,
      message:
        "Import local trop volumineux pour le stockage navigateur. Atlas conserve uniquement l'analyse affichée, sans supervision persistée."
    };
  }

  try {
    window.localStorage.setItem(storageKey, serializedPayload);
    return {
      success: true,
      message: "Import local prêt pour supervision."
    };
  } catch (error) {
    console.warn("Impossible d'enregistrer l'import local Atlas.", error);
    return {
      success: false,
      message:
        "Stockage local plein ou indisponible. Effacez l'import local précédent ou réduisez l'aperçu avant de réessayer."
    };
  }
}

export function getLastLocalImport(): LocalValidatedImport | null {
  if (!canUseLocalStorage()) return null;

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return null;
    const parsedValue = JSON.parse(rawValue) as LocalValidatedImport;

    return {
      ...parsedValue,
      previewRows: parsedValue.previewRows.slice(0, MAX_LOCAL_STORAGE_ROWS)
    };
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
