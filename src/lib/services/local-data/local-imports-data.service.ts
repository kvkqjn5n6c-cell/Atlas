import {
  deleteLocalImport,
  getLocalImportById,
  getLocalImports,
  updateLocalImport
} from "@/lib/local/local-import-store";
import type { LocalValidatedImport } from "@/types/data-import";
import type { LocalDataResult } from "@/types/local-data-result";

export type LocalImportsWorkspaceData = {
  imports: LocalValidatedImport[];
  activeImport: LocalValidatedImport | null;
};

export function getEmptyLocalImportsWorkspaceData(): LocalDataResult<LocalImportsWorkspaceData> {
  return {
    data: {
      imports: [],
      activeImport: null
    },
    source: "localStorage",
    fallbackUsed: false,
    warnings: [],
    lastUpdated: ""
  };
}

export function getLocalImportsWorkspaceData(activeImportId?: string | null): LocalDataResult<LocalImportsWorkspaceData> {
  const imports = getLocalImports();
  const activeImport = activeImportId
    ? imports.find((item) => item.id === activeImportId) ?? imports[0] ?? null
    : imports[0] ?? null;

  return {
    data: {
      imports,
      activeImport
    },
    source: "localStorage",
    fallbackUsed: false,
    warnings: [],
    lastUpdated: new Date().toISOString()
  };
}

export function getLocalImportWorkspaceItem(id: string) {
  return getLocalImportById(id);
}

export function updateLocalImportWorkspace(importData: LocalValidatedImport) {
  return updateLocalImport(importData);
}

export function deleteLocalImportWorkspace(id: string) {
  deleteLocalImport(id);
}
