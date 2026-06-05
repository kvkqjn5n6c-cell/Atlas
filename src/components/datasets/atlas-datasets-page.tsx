"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TableProperties } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDatasetStatistics, summarizeDataset, validateDataset } from "@/lib/datasets/atlas-dataset-engine";
import { applyDatasetFilters, summarizeDatasetFilters, validateDatasetFilters } from "@/lib/datasets/dataset-filter-engine";
import type { DatasetFilter, DatasetFilterOperator, DatasetFilterSet } from "@/lib/datasets/dataset-filter-types";
import { groupDataset, summarizeGroupBy, supportedGroupFields, validateGroupBy } from "@/lib/datasets/dataset-groupby-engine";
import { generateGroupByInsights } from "@/lib/datasets/dataset-groupby-insight-engine";
import type { DatasetGroupByInsight } from "@/lib/datasets/dataset-groupby-insight-types";
import type { DatasetGroupByAggregation, DatasetGroupByAnalysis } from "@/lib/datasets/dataset-groupby-types";
import { convertToLocalKpi, createDatasetKpi, previewDatasetKpi, validateDatasetKpi } from "@/lib/datasets/dataset-kpi-engine";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import type { DatasetKpiAggregation, DatasetKpiDefinition } from "@/lib/datasets/dataset-kpi-types";
import { getDatasets } from "@/lib/local/atlas-datasets-store";
import { getDatasetFilterSetsByDatasetId, saveDatasetFilterSet } from "@/lib/local/dataset-filters-store";
import { getDatasetGroupByAnalysesByDatasetId, saveDatasetGroupByAnalysis } from "@/lib/local/dataset-groupby-store";
import { getGroupByInsightsByAnalysisId, saveGroupByInsights } from "@/lib/local/dataset-groupby-insights-store";
import { saveDatasetKpi } from "@/lib/local/dataset-kpi-store";
import { saveLocalKpiHistoryPoint } from "@/lib/local/local-kpi-history-store";
import { saveLocalKpiResult } from "@/lib/local/local-kpi-results-store";
import { saveLocalKpiConfiguration } from "@/lib/local/local-kpi-store";

function scoreVariant(score: number) {
  if (score >= 80) return "success";
  if (score >= 55) return "warning";
  return "danger";
}

function insightVariant(severity: DatasetGroupByInsight["severity"]) {
  if (severity === "critical") return "danger";
  if (severity === "watch") return "warning";
  return "success";
}

function valueToText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

const aggregationLabels: Record<DatasetKpiAggregation, string> = {
  count: "COUNT - Nombre de lignes",
  sum: "SUM - Somme",
  average: "AVERAGE - Moyenne",
  ratio: "RATIO - Ratio"
};

const groupByAggregationLabels: Record<DatasetGroupByAggregation, string> = {
  count: "COUNT",
  sum: "SUM",
  average: "AVERAGE"
};

const operatorLabels: Record<DatasetFilterOperator, string> = {
  EQUALS: "egal a",
  NOT_EQUALS: "different de",
  CONTAINS: "contient",
  STARTS_WITH: "commence par",
  ENDS_WITH: "termine par",
  GREATER_THAN: "superieur a",
  LESS_THAN: "inferieur a",
  IS_EMPTY: "est vide",
  IS_NOT_EMPTY: "n'est pas vide"
};

function defaultKpiName(dataset: AtlasDataset, aggregation: DatasetKpiAggregation, fieldKey?: string) {
  const field = dataset.fields.find((item) => item.key === fieldKey);
  const label = field?.label ?? "lignes";

  if (aggregation === "count") return `Nombre ${dataset.displayName.replace("Dataset Atlas - ", "")}`;
  if (aggregation === "sum") return `Somme ${label}`;
  if (aggregation === "average") return `Moyenne ${label}`;
  return `Ratio ${label}`;
}

export function AtlasDatasetsPage() {
  const [mounted, setMounted] = useState(false);
  const [datasets, setDatasets] = useState<AtlasDataset[]>([]);
  const [filterSets, setFilterSets] = useState<Record<string, DatasetFilterSet>>({});
  const [groupByDrafts, setGroupByDrafts] = useState<Record<string, {
    aggregation: DatasetGroupByAggregation;
    field: string;
    groupedByField: string;
  }>>({});
  const [groupByAnalyses, setGroupByAnalyses] = useState<Record<string, DatasetGroupByAnalysis[]>>({});
  const [groupByInsights, setGroupByInsights] = useState<Record<string, DatasetGroupByInsight[]>>({});
  const [drafts, setDrafts] = useState<Record<string, {
    name: string;
    aggregation: DatasetKpiAggregation;
    field: string;
    secondaryField: string;
  }>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDatasets(getDatasets());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function defaultFilter(dataset: AtlasDataset, index: number): DatasetFilter {
    return {
      id: `dataset-filter-${dataset.id}-${index}`,
      field: dataset.fields[0]?.key ?? "",
      operator: "CONTAINS",
      value: ""
    };
  }

  function getFilterSet(dataset: AtlasDataset): DatasetFilterSet {
    const saved = getDatasetFilterSetsByDatasetId(dataset.id)[0];

    return filterSets[dataset.id] ?? saved ?? {
      id: `dataset-filter-set-${dataset.id}`,
      datasetId: dataset.id,
      name: "Filtre temporaire",
      filters: [],
      createdAt: new Date().toISOString()
    };
  }

  function updateFilterSet(dataset: AtlasDataset, nextFilterSet: DatasetFilterSet) {
    setFilterSets((items) => ({ ...items, [dataset.id]: nextFilterSet }));
    setMessage("");
  }

  function addFilter(dataset: AtlasDataset) {
    const current = getFilterSet(dataset);
    updateFilterSet(dataset, {
      ...current,
      filters: [...current.filters, defaultFilter(dataset, current.filters.length + 1)]
    });
  }

  function updateFilter(dataset: AtlasDataset, filterId: string, patch: Partial<DatasetFilter>) {
    const current = getFilterSet(dataset);
    updateFilterSet(dataset, {
      ...current,
      filters: current.filters.map((filter) => filter.id === filterId ? { ...filter, ...patch } : filter)
    });
  }

  function removeFilter(dataset: AtlasDataset, filterId: string) {
    const current = getFilterSet(dataset);
    updateFilterSet(dataset, {
      ...current,
      filters: current.filters.filter((filter) => filter.id !== filterId)
    });
  }

  function saveFilters(dataset: AtlasDataset) {
    const current = getFilterSet(dataset);
    const validation = validateDatasetFilters(dataset, current);

    if (!validation.valid) {
      setMessage(validation.errors.join(" "));
      return;
    }

    saveDatasetFilterSet(current);
    setMessage(`Jeu de filtres "${current.name}" sauvegarde localement.`);
  }

  function getDraft(dataset: AtlasDataset) {
    const firstNumericField = dataset.fields.find((field) => field.atlasType === "number") ?? dataset.fields[0];

    return drafts[dataset.id] ?? {
      name: defaultKpiName(dataset, "count", firstNumericField?.key),
      aggregation: "count" as DatasetKpiAggregation,
      field: firstNumericField?.key ?? "",
      secondaryField: dataset.fields.find((field) => field.atlasType === "number" && field.key !== firstNumericField?.key)?.key ?? ""
    };
  }

  function getGroupByDraft(dataset: AtlasDataset) {
    const groupField = supportedGroupFields(dataset)[0] ?? dataset.fields[0];
    const metricField = dataset.fields.find((field) => field.atlasType === "number") ?? dataset.fields[0];

    return groupByDrafts[dataset.id] ?? {
      aggregation: "count" as DatasetGroupByAggregation,
      field: metricField?.key ?? "",
      groupedByField: groupField?.key ?? ""
    };
  }

  function updateGroupByDraft(dataset: AtlasDataset, patch: Partial<ReturnType<typeof getGroupByDraft>>) {
    setGroupByDrafts((items) => ({ ...items, [dataset.id]: { ...getGroupByDraft(dataset), ...patch } }));
    setMessage("");
  }

  function savedAnalyses(dataset: AtlasDataset) {
    return groupByAnalyses[dataset.id] ?? getDatasetGroupByAnalysesByDatasetId(dataset.id);
  }

  function runGroupBy(dataset: AtlasDataset, filteredDataset: AtlasDataset) {
    const draft = getGroupByDraft(dataset);
    const analysis = groupDataset({
      dataset: filteredDataset,
      aggregation: draft.aggregation,
      field: draft.aggregation === "count" ? undefined : draft.field,
      groupedByField: draft.groupedByField
    });
    const validation = validateGroupBy({
      dataset: filteredDataset,
      aggregation: draft.aggregation,
      field: draft.aggregation === "count" ? undefined : draft.field,
      groupedByField: draft.groupedByField
    });

    if (!validation.valid) {
      setMessage(validation.errors.join(" "));
      return;
    }

    const saved = saveDatasetGroupByAnalysis({
      ...analysis,
      datasetId: dataset.id
    });
    const insights = saveGroupByInsights(generateGroupByInsights(saved));
    setGroupByAnalyses((items) => ({
      ...items,
      [dataset.id]: [saved, ...savedAnalyses(dataset).filter((item) => item.id !== saved.id)]
    }));
    setGroupByInsights((items) => ({
      ...items,
      [saved.id]: insights
    }));
    setMessage(`Analyse comparative ${saved.groupedBy.label} sauvegardee localement avec ${insights.length} insight(s).`);
  }

  function updateDraft(dataset: AtlasDataset, patch: Partial<ReturnType<typeof getDraft>>) {
    const current = getDraft(dataset);
    const next = { ...current, ...patch };
    const normalizedNext = patch.aggregation && !patch.name
      ? { ...next, name: defaultKpiName(dataset, patch.aggregation, next.field) }
      : next;
    setDrafts((items) => ({ ...items, [dataset.id]: normalizedNext }));
    setMessage("");
  }

  function buildDefinition(dataset: AtlasDataset): DatasetKpiDefinition {
    const draft = getDraft(dataset);
    const filterSet = getFilterSet(dataset);

    return createDatasetKpi({
      dataset,
      name: draft.name,
      aggregation: draft.aggregation,
      field: draft.aggregation === "count" ? undefined : draft.field,
      secondaryField: draft.aggregation === "ratio" ? draft.secondaryField : undefined,
      description: `KPI genere depuis ${dataset.displayName}`,
      filterSet: filterSet.filters.length > 0 ? filterSet : undefined
    });
  }

  function generateKpi(dataset: AtlasDataset) {
    const definition = buildDefinition(dataset);
    const validation = validateDatasetKpi(dataset, definition);

    if (!validation.valid) {
      setMessage(validation.errors.join(" "));
      return;
    }

    const filterSet = getFilterSet(dataset).filters.length > 0 ? getFilterSet(dataset) : undefined;
    const { kpi, result, historyPoint } = convertToLocalKpi({ dataset, definition, filterSet });
    saveDatasetKpi(definition);
    saveLocalKpiConfiguration(kpi);
    saveLocalKpiResult(result);
    saveLocalKpiHistoryPoint(historyPoint);
    setMessage(`${kpi.name} genere comme KPI local Atlas. Il apparaitra dans KPI Configuration et Pilotage.`);
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Datasets Atlas</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Chargement des datasets locaux.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Datasets Atlas</Badge>
              <Badge>Temporaire</Badge>
              <Badge>Preview SQL uniquement</Badge>
              <Badge>LocalStorage</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Donnees SQL normalisees pour Atlas
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Les datasets Atlas convertissent une source SQL preparee en records normalises par champs Atlas. Cette page ne cree aucun KPI et ne lit jamais toute la table SQL.
            </p>
          </div>
          <Link
            href="/data-sources"
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Retour sources de donnees
          </Link>
        </div>
      </section>

      {datasets.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Aucun dataset</Badge>
              <Badge>Pipeline futur</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Aucune donnee locale suffisante. Preparez une source SQL depuis Mapping SQL, puis generez un Dataset Atlas depuis Sources de donnees.
            </p>
            <Link
              href="/data-sources"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Ouvrir sources de donnees
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {message ? <p className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">{message}</p> : null}
          {datasets.map((dataset) => {
            const validation = validateDataset(dataset);
            const statistics = getDatasetStatistics(dataset);
            const summary = summarizeDataset(dataset);
            const filterSet = getFilterSet(dataset);
            const filtered = applyDatasetFilters(dataset, filterSet);
            const filterValidation = validateDatasetFilters(dataset, filterSet);
            const filterSummary = summarizeDatasetFilters(dataset, filtered.dataset, filterSet);
            const groupByDraft = getGroupByDraft(dataset);
            const groupByValidation = validateGroupBy({
              dataset: filtered.dataset,
              aggregation: groupByDraft.aggregation,
              field: groupByDraft.aggregation === "count" ? undefined : groupByDraft.field,
              groupedByField: groupByDraft.groupedByField
            });
            const currentGroupByAnalysis = groupByValidation.valid
              ? groupDataset({
                  dataset: filtered.dataset,
                  aggregation: groupByDraft.aggregation,
                  field: groupByDraft.aggregation === "count" ? undefined : groupByDraft.field,
                  groupedByField: groupByDraft.groupedByField
                })
              : undefined;
            const currentGroupBySummary = currentGroupByAnalysis ? summarizeGroupBy(currentGroupByAnalysis) : undefined;
            const currentGroupByInsights = currentGroupByAnalysis ? generateGroupByInsights(currentGroupByAnalysis) : [];
            const previousAnalyses = savedAnalyses(dataset);
            const draft = getDraft(dataset);
            const definition = buildDefinition(dataset);
            const kpiPreview = previewDatasetKpi(dataset, definition, filterSet.filters.length > 0 ? filterSet : undefined);
            const kpiValidation = validateDatasetKpi(dataset, definition, filterSet.filters.length > 0 ? filterSet : undefined);
            const numericFields = dataset.fields.filter((field) => field.atlasType === "number");

            return (
              <Card key={dataset.id} className="border-brand-100">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{dataset.displayName}</CardTitle>
                    <Badge variant={scoreVariant(dataset.qualityScore)}>Score {dataset.qualityScore}/100</Badge>
                    <Badge>{dataset.rowCount} ligne(s)</Badge>
                    <Badge>{dataset.fields.length} champ(s)</Badge>
                    <Badge variant={validation.valid ? "success" : "danger"}>
                      {validation.valid ? "Exploitable localement" : "Incomplet"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 lg:grid-cols-4">
                    <div className="rounded-md border border-line bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completude</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{statistics.completeness}%</p>
                    </div>
                    <div className="rounded-md border border-line bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Valeurs manquantes</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{statistics.missingValues}</p>
                    </div>
                    <div className="rounded-md border border-line bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Champs mappes</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{statistics.mappedFields}</p>
                    </div>
                    <div className="rounded-md border border-line bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Generation</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{new Date(dataset.createdAt).toLocaleString("fr-FR")}</p>
                    </div>
                  </div>

                  <div className="rounded-md border border-line bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-ink">Resume dirigeant</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{summary.executiveSummary}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{summary.technicalSummary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dataset.fields.map((field) => (
                      <Badge key={`${dataset.id}-${field.key}-${field.sourceColumn}`}>
                        {field.label} - {field.atlasType}
                      </Badge>
                    ))}
                  </div>

                  <div className="rounded-lg border border-line bg-white p-4">
                    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="brand">Filtres Dataset</Badge>
                          <Badge>{filterSummary.filteredRows}/{filterSummary.totalRows} ligne(s)</Badge>
                          <Badge>{filterSummary.percentage}% conserve</Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {filterSummary.label} Les KPI crees depuis ce dataset utiliseront ce sous-ensemble tant que ces filtres sont actifs.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => addFilter(dataset)}>Ajouter filtre</Button>
                        <Button onClick={() => saveFilters(dataset)} disabled={!filterValidation.valid}>Sauvegarder filtres</Button>
                      </div>
                    </div>

                    {filterSet.filters.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {filterSet.filters.map((filter) => {
                          const selectedField = dataset.fields.find((field) => field.key === filter.field);
                          const valueDisabled = filter.operator === "IS_EMPTY" || filter.operator === "IS_NOT_EMPTY";

                          return (
                            <div key={filter.id} className="grid gap-3 rounded-md border border-line bg-slate-50 p-3 lg:grid-cols-[1fr_180px_1fr_120px]">
                              <label className="space-y-1 text-sm">
                                <span className="font-medium text-slate-700">Champ</span>
                                <select
                                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                                  value={filter.field}
                                  onChange={(event) => updateFilter(dataset, filter.id, { field: event.target.value })}
                                >
                                  {dataset.fields.map((field) => (
                                    <option key={`${dataset.id}-filter-field-${field.key}-${field.sourceColumn}`} value={field.key}>
                                      {field.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="space-y-1 text-sm">
                                <span className="font-medium text-slate-700">Operateur</span>
                                <select
                                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                                  value={filter.operator}
                                  onChange={(event) => updateFilter(dataset, filter.id, { operator: event.target.value as DatasetFilterOperator })}
                                >
                                  {Object.entries(operatorLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
                              </label>
                              <label className="space-y-1 text-sm">
                                <span className="font-medium text-slate-700">Valeur</span>
                                <input
                                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300 disabled:bg-slate-100"
                                  value={filter.value ?? ""}
                                  disabled={valueDisabled}
                                  placeholder={selectedField?.atlasType === "number" ? "Ex. 1000" : "Valeur"}
                                  onChange={(event) => updateFilter(dataset, filter.id, { value: event.target.value })}
                                />
                              </label>
                              <div className="flex items-end">
                                <Button className="w-full" onClick={() => removeFilter(dataset, filter.id)}>Retirer</Button>
                              </div>
                            </div>
                          );
                        })}
                        {[...filterValidation.errors, ...filterValidation.warnings].length > 0 ? (
                          <p className="text-xs leading-5 text-amber-700">
                            {[...filterValidation.errors, ...filterValidation.warnings].join(" ")}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
                        Aucun filtre actif : le KPI sera calcule sur l&apos;ensemble du dataset.
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-line bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="brand">Analyse comparative</Badge>
                      <Badge>{filtered.dataset.rowCount} ligne(s) filtrees</Badge>
                      <Badge>{currentGroupBySummary?.groupCount ?? 0} groupe(s)</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Aggregation</span>
                        <select
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                          value={groupByDraft.aggregation}
                          onChange={(event) => updateGroupByDraft(dataset, { aggregation: event.target.value as DatasetGroupByAggregation })}
                        >
                          {Object.entries(groupByAggregationLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Champ KPI</span>
                        <select
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                          value={groupByDraft.field}
                          disabled={groupByDraft.aggregation === "count"}
                          onChange={(event) => updateGroupByDraft(dataset, { field: event.target.value })}
                        >
                          {dataset.fields.filter((field) => field.atlasType === "number").map((field) => (
                            <option key={`${dataset.id}-groupby-metric-${field.key}-${field.sourceColumn}`} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Regrouper par</span>
                        <select
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                          value={groupByDraft.groupedByField}
                          onChange={(event) => updateGroupByDraft(dataset, { groupedByField: event.target.value })}
                        >
                          {(supportedGroupFields(dataset).length > 0 ? supportedGroupFields(dataset) : dataset.fields).map((field) => (
                            <option key={`${dataset.id}-groupby-field-${field.key}-${field.sourceColumn}`} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {currentGroupBySummary ? (
                      <div className="mt-4 grid gap-3 lg:grid-cols-4">
                        <div className="rounded-md border border-line bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Meilleur groupe</p>
                          <p className="mt-1 text-sm font-semibold text-ink">{currentGroupBySummary.bestGroup?.groupValue ?? "-"}</p>
                          <p className="mt-1 text-xs text-slate-500">{currentGroupBySummary.bestGroup?.value ?? 0}</p>
                        </div>
                        <div className="rounded-md border border-line bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Moins bon groupe</p>
                          <p className="mt-1 text-sm font-semibold text-ink">{currentGroupBySummary.worstGroup?.groupValue ?? "-"}</p>
                          <p className="mt-1 text-xs text-slate-500">{currentGroupBySummary.worstGroup?.value ?? 0}</p>
                        </div>
                        <div className="rounded-md border border-line bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Ecart</p>
                          <p className="mt-1 text-sm font-semibold text-ink">{currentGroupBySummary.gap ?? 0}</p>
                        </div>
                        <div className="rounded-md border border-line bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Dispersion</p>
                          <p className="mt-1 text-sm font-semibold text-ink">{currentGroupBySummary.dispersion ?? 0}</p>
                        </div>
                      </div>
                    ) : null}

                    {currentGroupByAnalysis && currentGroupByAnalysis.results.length > 0 ? (
                      <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="px-4 py-3 font-medium">Groupe</th>
                              <th className="px-4 py-3 font-medium">Lignes</th>
                              <th className="px-4 py-3 font-medium">Valeur</th>
                              <th className="px-4 py-3 font-medium">% lignes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line bg-white">
                            {currentGroupByAnalysis.results.slice(0, 8).map((result) => (
                              <tr key={`${dataset.id}-groupby-${result.groupValue}`} className="align-top transition hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-ink">{result.groupValue}</td>
                                <td className="px-4 py-3 text-slate-600">{result.rowCount}</td>
                                <td className="px-4 py-3 text-slate-600">{result.value}</td>
                                <td className="px-4 py-3 text-slate-600">{result.percentage ?? 0}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}

                    {[...groupByValidation.errors, ...groupByValidation.warnings].length > 0 ? (
                      <p className="mt-3 text-xs leading-5 text-amber-700">
                        {[...groupByValidation.errors, ...groupByValidation.warnings].join(" ")}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onClick={() => runGroupBy(dataset, filtered.dataset)} disabled={!groupByValidation.valid}>
                        Sauvegarder analyse comparative
                      </Button>
                      <Badge>{previousAnalyses.length} analyse(s) historique(s)</Badge>
                      <Badge>Exploitable par recommandations : phase suivante</Badge>
                    </div>

                    <div className="mt-4 rounded-lg border border-line bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="brand">Insights comparatifs</Badge>
                        <Badge>{currentGroupByInsights.length}</Badge>
                      </div>
                      {currentGroupByInsights.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-600">
                          Aucun insight comparatif exploitable pour cette analyse.
                        </p>
                      ) : (
                        <div className="mt-3 grid gap-3 lg:grid-cols-2">
                          {currentGroupByInsights.map((insight) => (
                            <article key={insight.id} className="rounded-md border border-line bg-white p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={insightVariant(insight.severity)}>{insight.severity}</Badge>
                                <Badge>{insight.insightType}</Badge>
                                <Badge>{insight.groupValue}</Badge>
                              </div>
                              <h4 className="mt-2 text-sm font-semibold text-ink">{insight.title}</h4>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{insight.summary}</p>
                              <ul className="mt-2 space-y-1">
                                {insight.reasons.slice(0, 2).map((reason, index) => (
                                  <li key={`${insight.id}-reason-${index}`} className="text-xs text-slate-500">
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                              {insight.recommendedAction ? (
                                <p className="mt-2 text-xs font-medium text-brand-700">{insight.recommendedAction}</p>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      )}
                    </div>

                    {previousAnalyses.length > 0 ? (
                      <div className="mt-4 rounded-md border border-line bg-slate-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Derniers insights sauvegardes</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {previousAnalyses.slice(0, 3).flatMap((analysis) => {
                            const insights = groupByInsights[analysis.id] ?? getGroupByInsightsByAnalysisId(analysis.id);
                            return insights.slice(0, 2).map((insight) => (
                              <Badge key={`${analysis.id}-${insight.id}`} variant={insightVariant(insight.severity)}>
                                {insight.title}
                              </Badge>
                            ));
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {[...validation.errors, ...statistics.warnings].length > 0 ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-950">Warnings qualite</p>
                      <ul className="mt-2 space-y-1">
                        {[...validation.errors, ...statistics.warnings].slice(0, 8).map((warning, index) => (
                          <li key={`${dataset.id}-warning-${index}`} className="text-sm text-amber-800">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="overflow-x-auto rounded-lg border border-line">
                    <table className="min-w-[900px] w-full border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          {dataset.fields.map((field) => (
                            <th key={`${dataset.id}-head-${field.key}-${field.sourceColumn}`} className="px-4 py-3 font-medium">
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line bg-white">
                        {dataset.records.slice(0, 10).map((record) => (
                          <tr key={record.id} className="align-top transition hover:bg-slate-50">
                            {dataset.fields.map((field) => (
                              <td key={`${record.id}-${field.key}-${field.sourceColumn}`} className="px-4 py-3 text-slate-600">
                                {valueToText(record.values[field.key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="brand">Generateur KPI Dataset V1</Badge>
                      <Badge>COUNT</Badge>
                      <Badge>SUM</Badge>
                      <Badge>AVERAGE</Badge>
                      <Badge>RATIO</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-4">
                      <label className="space-y-1 text-sm lg:col-span-2">
                        <span className="font-medium text-slate-700">Nom KPI</span>
                        <input
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                          value={draft.name}
                          onChange={(event) => updateDraft(dataset, { name: event.target.value })}
                        />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Type</span>
                        <select
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                          value={draft.aggregation}
                          onChange={(event) => updateDraft(dataset, { aggregation: event.target.value as DatasetKpiAggregation })}
                        >
                          {Object.entries(aggregationLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Champ</span>
                        <select
                          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                          value={draft.field}
                          disabled={draft.aggregation === "count"}
                          onChange={(event) => updateDraft(dataset, {
                            field: event.target.value,
                            name: defaultKpiName(dataset, draft.aggregation, event.target.value)
                          })}
                        >
                          {(draft.aggregation === "sum" || draft.aggregation === "average" || draft.aggregation === "ratio" ? numericFields : dataset.fields).map((field) => (
                            <option key={`${dataset.id}-kpi-field-${field.key}-${field.sourceColumn}`} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      {draft.aggregation === "ratio" ? (
                        <label className="space-y-1 text-sm">
                          <span className="font-medium text-slate-700">Denominateur</span>
                          <select
                            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-300"
                            value={draft.secondaryField}
                            onChange={(event) => updateDraft(dataset, { secondaryField: event.target.value })}
                          >
                            {numericFields.map((field) => (
                              <option key={`${dataset.id}-kpi-secondary-${field.key}-${field.sourceColumn}`} value={field.key}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                      <div className="rounded-md border border-line bg-white p-4">
                        <p className="text-sm font-semibold text-ink">Apercu KPI</p>
                        <p className="mt-2 text-2xl font-semibold text-brand-700">{kpiPreview.value}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Dataset total : {kpiPreview.totalRowCount} ligne(s). Dataset filtre : {kpiPreview.filteredRowCount} ligne(s). KPI calcule sur : {kpiPreview.rowCount} ligne(s). Champ : {kpiPreview.sourceField?.label ?? "Toutes les lignes"}.
                        </p>
                        {[...kpiValidation.errors, ...kpiPreview.warnings].length > 0 ? (
                          <p className="mt-2 text-xs leading-5 text-amber-700">
                            {[...kpiValidation.errors, ...kpiPreview.warnings].join(" ")}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col justify-end gap-2">
                        <Button onClick={() => generateKpi(dataset)} disabled={!kpiValidation.valid}>
                          <TableProperties className="h-4 w-4" aria-hidden="true" />
                          Generer KPI local
                        </Button>
                        <p className="text-xs leading-5 text-brand-700">
                          Le KPI sera stocke localement et reutilise par Pilotage, Alertes, Priorites et Dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
