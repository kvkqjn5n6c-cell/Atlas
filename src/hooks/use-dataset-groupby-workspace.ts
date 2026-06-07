"use client";

import { useCallback, useEffect, useState } from "react";
import { getDatasetGroupByWorkspaceAction } from "@/lib/actions/dataset-groupby-persistence-actions";
import { getHybridReadModeAction } from "@/lib/actions/hybrid-read-actions";
import type { DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";
import { getDatasetGroupByAnalyses } from "@/lib/local/dataset-groupby-store";
import type { HybridReadSource } from "@/hooks/use-decision-journal-workspace";

type WorkspaceState = {
  data: DatasetGroupByAnalysis[];
  source: HybridReadSource;
  isLoading: boolean;
  warnings: string[];
};

export function useDatasetGroupByWorkspace() {
  const [state, setState] = useState<WorkspaceState>({
    data: [],
    source: "local",
    isLoading: false,
    warnings: []
  });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, warnings: [] }));

    const localData = getDatasetGroupByAnalyses();
    setState({
      data: localData,
      source: "local",
      isLoading: true,
      warnings: []
    });

    try {
      const mode = await getHybridReadModeAction();
      if (!mode.prismaEnabled) {
        setState({
          data: localData,
          source: "local",
          isLoading: false,
          warnings: []
        });
        return;
      }

      const result = await getDatasetGroupByWorkspaceAction();
      if (result.source === "prisma") {
        setState({
          data: result.data,
          source: "prisma",
          isLoading: false,
          warnings: result.warnings
        });
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
