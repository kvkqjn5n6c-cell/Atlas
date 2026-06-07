"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDecisionDomainReadModeAction,
  getLocalActionPlansReadAction
} from "@/lib/actions/hybrid-read-actions";
import { getLocalActionPlans } from "@/lib/local/local-action-plans-store";
import type { LocalActionPlan } from "@/types/local-action-plans";
import type { HybridReadSource } from "@/hooks/use-decision-journal-workspace";

type WorkspaceState = {
  data: LocalActionPlan[];
  source: HybridReadSource;
  isLoading: boolean;
  warnings: string[];
};

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

export function useLocalActionPlansWorkspace(organizationId = DEFAULT_ORGANIZATION_ID) {
  const [state, setState] = useState<WorkspaceState>({
    data: [],
    source: "local",
    isLoading: false,
    warnings: []
  });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, warnings: [] }));

    const localData = getLocalActionPlans();
    setState({
      data: localData,
      source: "local",
      isLoading: true,
      warnings: []
    });

    try {
      const mode = await getDecisionDomainReadModeAction();
      if (!mode.prismaPreferred) {
        setState({
          data: localData,
          source: "local",
          isLoading: false,
          warnings: []
        });
        return;
      }

      const result = await getLocalActionPlansReadAction(organizationId);
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
