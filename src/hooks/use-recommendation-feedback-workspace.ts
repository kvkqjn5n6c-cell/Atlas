"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getHybridReadModeAction,
  getRecommendationFeedbackReadAction
} from "@/lib/actions/hybrid-read-actions";
import { getRecommendationFeedback } from "@/lib/local/local-recommendation-feedback-store";
import type { HybridReadSource } from "@/hooks/use-decision-journal-workspace";
import type { LocalRecommendationFeedback } from "@/types/local-recommendation-feedback";

type WorkspaceState = {
  data: LocalRecommendationFeedback[];
  source: HybridReadSource;
  isLoading: boolean;
  warnings: string[];
};

const DEFAULT_ORGANIZATION_ID = "org-atlas-demo";

export function useRecommendationFeedbackWorkspace(organizationId = DEFAULT_ORGANIZATION_ID) {
  const [state, setState] = useState<WorkspaceState>({
    data: [],
    source: "local",
    isLoading: false,
    warnings: []
  });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, warnings: [] }));

    const localData = getRecommendationFeedback();
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

      const result = await getRecommendationFeedbackReadAction(organizationId);
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
