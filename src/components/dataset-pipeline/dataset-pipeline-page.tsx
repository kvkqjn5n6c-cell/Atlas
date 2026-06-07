"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, GitBranch, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtlasDatasetsWorkspace } from "@/hooks/use-atlas-datasets-workspace";
import { useDatasetGroupByInsightsWorkspace } from "@/hooks/use-dataset-groupby-insights-workspace";
import { useDatasetGroupByWorkspace } from "@/hooks/use-dataset-groupby-workspace";
import type { HybridReadSource } from "@/hooks/use-decision-journal-workspace";
import { usePreparedSqlSourcesWorkspace } from "@/hooks/use-prepared-sql-sources-workspace";
import { buildDatasetPipelineView, summarizePipeline } from "@/lib/datasets/dataset-pipeline-engine";
import { generateLocalPriorities } from "@/lib/priorities/local-priorities-engine";
import { generateLocalRecommendations } from "@/lib/recommendations/local-recommendations-engine";
import { getDatasetKpis } from "@/lib/local/dataset-kpi-store";
import { getJournalEntries } from "@/lib/local/decision-journal-store";
import { getLocalActionPlans } from "@/lib/local/local-action-plans-store";
import { getSqlConnections } from "@/lib/local/sql-connections-store";
import { getSqlMappings } from "@/lib/local/sql-mappings-store";
import type { DatasetPipelineNode, DatasetPipelineNodeStatus } from "@/types/dataset-pipeline";

const organizationId = "org-atlas-demo";

const statusLabels: Record<DatasetPipelineNodeStatus, string> = {
  completed: "Terminé",
  available: "Disponible",
  missing: "Manquant",
  warning: "À vérifier"
};

const statusVariants: Record<DatasetPipelineNodeStatus, "default" | "success" | "warning" | "danger"> = {
  completed: "success",
  available: "default",
  missing: "danger",
  warning: "warning"
};

const nodeLinks: Record<DatasetPipelineNode["type"], string> = {
  sql_connection: "/sql-connections",
  sql_mapping: "/sql-mappings",
  prepared_source: "/data-sources",
  dataset: "/data-sources",
  dataset_kpi: "/datasets",
  groupby_analysis: "/datasets",
  groupby_insight: "/datasets",
  recommendation: "/pilotage",
  priority: "/priorities",
  action_plan: "/action-plans",
  decision_journal: "/decision-journal"
};

function formatDate(value?: string) {
  if (!value) return "Non disponible";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function sourceLabel(source: HybridReadSource) {
  if (source === "prisma") return "Source Prisma";
  if (source === "fallback") return "Fallback local";
  return "Source locale";
}

function PipelineNodeCard({ node, index }: { node: DatasetPipelineNode; index: number }) {
  return (
    <Card className={node.status === "missing" ? "border-slate-200 bg-slate-50" : "border-brand-100"}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Étape {index + 1}</Badge>
              <Badge variant={statusVariants[node.status]}>{statusLabels[node.status]}</Badge>
              <Badge>{node.relatedIds.length} objet(s)</Badge>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-ink">{node.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{node.description}</p>
            <p className="mt-2 text-xs text-slate-500">Dernier événement : {formatDate(node.createdAt)}</p>
            {node.warnings.length > 0 ? (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">Points à vérifier</p>
                <ul className="mt-2 space-y-1">
                  {node.warnings.slice(0, 3).map((warning, warningIndex) => (
                    <li key={`${node.id}-warning-${warningIndex}`} className="text-xs leading-5 text-amber-800">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <Link
            href={nodeLinks[node.type]}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ouvrir
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function DatasetPipelinePage() {
  const [mounted, setMounted] = useState(false);
  const [, setRefreshKey] = useState(0);
  const {
    data: preparedSources,
    source: preparedSourcesSource,
    reload: reloadPreparedSources
  } = usePreparedSqlSourcesWorkspace(organizationId);
  const {
    data: datasets,
    source: datasetsSource,
    reload: reloadDatasets
  } = useAtlasDatasetsWorkspace();
  const {
    data: groupByAnalyses,
    source: groupBySource,
    reload: reloadGroupBy
  } = useDatasetGroupByWorkspace();
  const {
    data: groupByInsights,
    source: groupByInsightsSource,
    reload: reloadGroupByInsights
  } = useDatasetGroupByInsightsWorkspace();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const view = (() => {
    if (!mounted) {
      return buildDatasetPipelineView({});
    }

    const actionPlans = getLocalActionPlans();
    const recommendations = generateLocalRecommendations({
      organizationId,
      kpiResults: [],
      datasetGroupByInsights: groupByInsights
    });
    const priorities = generateLocalPriorities({
      organizationId,
      recommendations,
      actionPlans,
      datasetGroupByInsights: groupByInsights
    });

    return buildDatasetPipelineView({
      sqlConnections: getSqlConnections(),
      sqlMappings: getSqlMappings(),
      preparedSources,
      datasets,
      datasetKpis: getDatasetKpis(),
      groupByAnalyses,
      groupByInsights,
      recommendations,
      priorities,
      actionPlans,
      decisionJournalEntries: getJournalEntries()
    });
  })();

  const summary = summarizePipeline(view);
  const completedCount = view.nodes.filter((node) => node.status === "completed" || node.status === "warning").length;

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Dataset Atlas</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Chargement du pipeline local.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Pipeline Dataset</Badge>
              <Badge>{sourceLabel(preparedSourcesSource)}</Badge>
              <Badge>Datasets {sourceLabel(datasetsSource)}</Badge>
              <Badge>GroupBy {sourceLabel(groupBySource)}</Badge>
              <Badge>Insights {sourceLabel(groupByInsightsSource)}</Badge>
              <Badge>Sans IA</Badge>
              <Badge>{completedCount}/{view.nodes.length} étape(s)</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Pipeline Dataset Atlas</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Visualisez la chaîne complète qui transforme une source SQL en décision pilotable : mapping, source préparée, Dataset, KPI, Group By, insight, recommandation, plan et journal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRefreshKey((value) => value + 1);
              void reloadPreparedSources();
              void reloadDatasets();
              void reloadGroupBy();
              void reloadGroupByInsights();
            }}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Actualiser
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-brand-100">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={view.completionScore >= 80 ? "success" : view.completionScore >= 40 ? "warning" : "danger"}>
                {view.completionScore}% complété
              </Badge>
              <Badge>{view.missingSteps.length} étape(s) à compléter</Badge>
            </div>
            <p className="mt-4 text-lg font-semibold leading-7 text-ink">{summary}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Prochaine étape recommandée : {view.nextRecommendedStep ?? "La chaîne Dataset est complète."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <GitBranch className="h-4 w-4 text-brand-700" aria-hidden="true" />
              <CardTitle>Flux</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {view.edges.slice(0, 6).map((edge) => (
              <div key={`${edge.from}-${edge.to}`} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="rounded-md bg-slate-100 px-2 py-1">{edge.from}</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
                <span className="rounded-md bg-slate-100 px-2 py-1">{edge.to}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {view.nodes.map((node, index) => (
          <PipelineNodeCard key={node.id} node={node} index={index} />
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Network className="h-4 w-4 text-brand-700" aria-hidden="true" />
              <p className="text-sm font-semibold text-ink">Lecture de démonstration</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cette vue aide à expliquer où en est le passage de la donnée brute à l&apos;action pilotable.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/data-sources"
              className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sources
            </Link>
            <Link
              href="/datasets"
              className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Datasets
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
