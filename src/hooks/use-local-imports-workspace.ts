"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteLocalImportWorkspace,
  getEmptyLocalImportsWorkspaceData,
  getLocalImportsWorkspaceData,
  updateLocalImportWorkspace,
  type LocalImportsWorkspaceData
} from "@/lib/services/local-data/local-imports-data.service";
import type { LocalValidatedImport } from "@/types/data-import";
import type { LocalDataResult } from "@/types/local-data-result";

export function useLocalImportsWorkspace(initialActiveImportId?: string | null) {
  const [activeImportId, setActiveImportId] = useState<string | null>(initialActiveImportId ?? null);
  const [result, setResult] = useState<LocalDataResult<LocalImportsWorkspaceData>>(() =>
    getEmptyLocalImportsWorkspaceData()
  );

  const refresh = useCallback((preferredId?: string | null) => {
    setResult((current) => {
      const nextId = preferredId ?? activeImportId ?? current.data.activeImport?.id ?? null;
      const nextResult = getLocalImportsWorkspaceData(nextId);
      setActiveImportId(nextResult.data.activeImport?.id ?? null);
      return nextResult;
    });
  }, [activeImportId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => refresh(activeImportId), 0);
    return () => window.clearTimeout(timeoutId);
  }, [activeImportId, refresh]);

  const openImport = useCallback((id: string) => {
    setActiveImportId(id);
    setResult(getLocalImportsWorkspaceData(id));
  }, []);

  const updateImport = useCallback((importData: LocalValidatedImport) => {
    updateLocalImportWorkspace(importData);
    refresh(importData.id);
  }, [refresh]);

  const deleteImport = useCallback((id: string) => {
    deleteLocalImportWorkspace(id);
    refresh(id === activeImportId ? null : activeImportId);
  }, [activeImportId, refresh]);

  return useMemo(() => ({
    ...result,
    activeImportId,
    setActiveImportId: openImport,
    refresh,
    updateImport,
    deleteImport
  }), [activeImportId, deleteImport, openImport, refresh, result, updateImport]);
}
