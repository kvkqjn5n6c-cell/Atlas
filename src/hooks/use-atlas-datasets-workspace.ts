"use client";

import { useCallback, useEffect, useState } from "react";
import { getAtlasDatasetsWorkspaceAction } from "@/lib/actions/dataset-persistence-actions";
import { getHybridReadModeAction } from "@/lib/actions/hybrid-read-actions";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import { getDatasets } from "@/lib/local/atlas-datasets-store";
import type { HybridReadSource } from "@/hooks/use-decision-journal-workspace";

type WorkspaceState = {
  data: AtlasDataset[];
  source: HybridReadSource;
  isLoading: boolean;
  warnings: string[];
};

export function useAtlasDatasetsWorkspace() {
  const [state, setState] = useState<WorkspaceState>({
    data: [],
    source: "local",
    isLoading: false,
    warnings: []
  });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, warnings: [] }));

    const localData = getDatasets();
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

      const result = await getAtlasDatasetsWorkspaceAction();
      if (result.source === "prisma") {
        setState({
          data: result.data,
          source: "prisma",
          isLoading: false,
          warnings: []
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
