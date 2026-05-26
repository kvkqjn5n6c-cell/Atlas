import { MAX_LOCAL_IMPORT_STORAGE_BYTES, MAX_LOCAL_STORAGE_ROWS } from "@/lib/config/import-limits";
import type { LocalValidatedImport } from "@/types/data-import";

const workspaceStorageKey = "atlas:local-import-workspace";
const legacyLastImportKey = "atlas:last-local-import";

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
    updatedAt: importResult.updatedAt ?? importResult.createdAt,
    previewRows: importResult.previewRows.slice(0, MAX_LOCAL_STORAGE_ROWS),
    linkedLocalKpiIds: importResult.linkedLocalKpiIds ?? [],
    linkedLocalKpiNames: importResult.linkedLocalKpiNames ?? [],
    dictionaryUsages: importResult.dictionaryUsages ?? []
  };
}

function sortImports(imports: LocalValidatedImport[]) {
  return [...imports].sort(
    (first, second) =>
      new Date(second.updatedAt ?? second.createdAt).getTime() -
      new Date(first.updatedAt ?? first.createdAt).getTime()
  );
}

function parseImports(rawValue: string | null): LocalValidatedImport[] {
  if (!rawValue) return [];

  try {
    const parsedValue = JSON.parse(rawValue);
    if (Array.isArray(parsedValue)) return parsedValue.map(trimImportForStorage);
    if (parsedValue?.id) return [trimImportForStorage(parsedValue as LocalValidatedImport)];
    return [];
  } catch (error) {
    console.warn("Impossible de relire les imports locaux Atlas.", error);
    return [];
  }
}

function saveWorkspace(imports: LocalValidatedImport[]): LocalImportStoreResult {
  if (!canUseLocalStorage()) {
    return {
      success: false,
      message: "Stockage local indisponible dans ce contexte."
    };
  }

  const payload = sortImports(imports.map(trimImportForStorage));
  const serializedPayload = JSON.stringify(payload);

  if (serializedPayload.length > MAX_LOCAL_IMPORT_STORAGE_BYTES) {
    return {
      success: false,
      message:
        "Workspace d'import trop volumineux pour le stockage navigateur. Supprimez un ancien import local avant d'en ajouter un nouveau."
    };
  }

  try {
    window.localStorage.setItem(workspaceStorageKey, serializedPayload);
    window.localStorage.removeItem(legacyLastImportKey);
    return {
      success: true,
      message: "Import local ajouté au workspace."
    };
  } catch (error) {
    console.warn("Impossible d'enregistrer le workspace d'import local Atlas.", error);
    return {
      success: false,
      message:
        "Stockage local plein ou indisponible. Supprimez des imports locaux ou réduisez l'aperçu avant de réessayer."
    };
  }
}

export function getLocalImports() {
  if (!canUseLocalStorage()) return [];

  const workspaceImports = parseImports(window.localStorage.getItem(workspaceStorageKey));
  if (workspaceImports.length > 0) return sortImports(workspaceImports);

  const legacyImport = parseImports(window.localStorage.getItem(legacyLastImportKey));
  if (legacyImport.length > 0) {
    saveWorkspace(legacyImport);
    return sortImports(legacyImport);
  }

  return [];
}

export function getLocalImportById(id: string) {
  return getLocalImports().find((importData) => importData.id === id) ?? null;
}

export function saveLocalImport(importData: LocalValidatedImport): LocalImportStoreResult {
  const imports = getLocalImports();
  const nextImport = trimImportForStorage({
    ...importData,
    updatedAt: importData.updatedAt ?? new Date().toISOString()
  });

  return saveWorkspace([nextImport, ...imports.filter((item) => item.id !== nextImport.id)]);
}

export function updateLocalImport(importData: LocalValidatedImport): LocalImportStoreResult {
  const imports = getLocalImports();
  const nextImport = trimImportForStorage({
    ...importData,
    updatedAt: new Date().toISOString()
  });

  return saveWorkspace(imports.map((item) => (item.id === nextImport.id ? nextImport : item)));
}

export function deleteLocalImport(id: string) {
  saveWorkspace(getLocalImports().filter((importData) => importData.id !== id));
}

export function clearLocalImports() {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(workspaceStorageKey);
    window.localStorage.removeItem(legacyLastImportKey);
  } catch (error) {
    console.warn("Impossible d'effacer les imports locaux Atlas.", error);
  }
}

export function saveLastLocalImport(importResult: LocalValidatedImport): LocalImportStoreResult {
  return saveLocalImport(importResult);
}

export function getLastLocalImport(): LocalValidatedImport | null {
  return getLocalImports()[0] ?? null;
}

export function clearLastLocalImport() {
  const lastImport = getLastLocalImport();
  if (!lastImport) return;
  deleteLocalImport(lastImport.id);
}
