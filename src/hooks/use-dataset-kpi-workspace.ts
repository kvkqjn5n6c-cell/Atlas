"use client";

import { useCallback, useEffect, useState } from "react";
import { getHybridReadModeAction } from "@/lib/actions/hybrid-read-actions";
import { getDatasetKpiWorkspaceAction } from "@/lib/actions/dataset-kpi-persistence-actions";
import type { DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
import { getDatasetKpis } from "@/lib/local/dataset-kpi-store";
import type { HybridReadSource } from "@/hooks/use-decision-journal-workspace";

type WorkspaceState = {
  data: DatasetKpiDefinition[];
  source: HybridReadSource;
  isLoading: boolean;
  warnings: string[];
};

export function useDatasetKpiWorkspace() {
  const [state, setState] = useState<WorkspaceState>({
    data: [],
    source: "local",
    isLoading: false,
    warnings: []
  });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, warnings: [] }));

    const localData = getDatasetKpis();
    setState({
      data: localData,
      source: "local",
      isLoading: true,
      warnings: []
    });

    try {
      const mode = await getHybridReadModeAction();
      if (!mode.prismaEnabled) {
        setState({ data: localData, source: "local", isLoading: false, warnings: [] });
        return;
      }

      const result = await getDatasetKpiWorkspaceAction();
      if (result.source === "prisma") {
        setState({ data: result.data, source: "prisma", isLoading: false, warnings: result.warnings });
        return;
      }

      setState({
        data: localData,
        source: "fallback",
        isLoading: false,
        warnings: ["Lecture Prisma indisponible, fallback local."]
      });
    } catch {
      setState({
        data: localData,
        source: "fallback",
        isLoading: false,
        warnings: ["Lecture hybride indisponible, fallback local."]
      });
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [reload]);

  return {
    ...state,
    reload
  };
}
