"use client";

import { useCallback, useEffect, useState } from "react";
import { getHybridReadModeAction } from "@/lib/actions/hybrid-read-actions";
import { getPreparedSqlSourcesWorkspaceAction } from "@/lib/actions/prepared-source-persistence-actions";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import { getPreparedSqlSources } from "@/lib/local/sql-prepared-sources-store";
import type { HybridReadSource } from "@/hooks/use-decision-journal-workspace";

type WorkspaceState = {
  data: PreparedSqlSourceBundle[];
  source: HybridReadSource;
  isLoading: boolean;
  warnings: string[];
};

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

export function usePreparedSqlSourcesWorkspace(organizationId = DEFAULT_ORGANIZATION_ID) {
  const [state, setState] = useState<WorkspaceState>({
    data: [],
    source: "local",
    isLoading: false,
    warnings: []
  });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, warnings: [] }));

    const localData = getPreparedSqlSources();
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

      const result = await getPreparedSqlSourcesWorkspaceAction(organizationId);
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
  }, [organizationId]);

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
