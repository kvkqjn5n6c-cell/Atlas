"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalKpiWorkspace } from "@/hooks/use-local-kpi-workspace";
import { formatAtlasField } from "@/lib/formatters/status-labels";
import { calculateLocalKpiFromImport } from "@/lib/kpi-engine/local-kpi-calculator";
import { formatKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { buildLocalKpiHistoryPoint, buildLocalKpiResult } from "@/lib/kpi-engine/local-kpi-results";
import { formatVariation } from "@/lib/kpi-engine/local-kpi-trends";
import { getLocalImportById, updateLocalImport } from "@/lib/local/local-import-store";
import {
  deleteLocalKpiHistoryByKpiId,
  saveLocalKpiHistoryPoint
} from "@/lib/local/local-kpi-history-store";
import { deleteLocalKpiResult, saveLocalKpiResult } from "@/lib/local/local-kpi-results-store";
import { deleteLocalKpiConfiguration, saveLocalKpiConfiguration } from "@/lib/local/local-kpi-store";
import { deleteLocalKpiSnapshotAction, persistLocalKpiSnapshotAction } from "@/lib/actions/local-kpi-persistence-actions";
import type { LocalKpiConfiguration, LocalKpiTestStatus } from "@/types/local-kpi";
import { EditLocalKpiThresholds } from "./edit-local-kpi-thresholds";
import { LocalAlertRulesPanel } from "./local-alert-rules-panel";

const calculationLabels: Record<LocalKpiConfiguration["calculationType"], string> = {
  sum: "Somme",
  average: "Moyenne",
  count: "Comptage",
  "distinct-count": "Comptage unique",
  rate: "Taux",
  ratio: "Ratio",
  "period-change": "Évolution période"
};

const statusVariant: Record<LocalKpiTestStatus, "default" | "success" | "warning" | "danger"> = {
  healthy: "success",
  watch: "warning",
  critical: "danger",
  "not-tested": "default"
};

const statusLabels: Record<LocalKpiTestStatus, string> = {
  healthy: "Conforme",
  watch: "À surveiller",
  critical: "Critique",
  "not-tested": "Non testé"
};

function displayPrimaryField(kpi: LocalKpiConfiguration) {
  if (kpi.displayFieldLabel) return kpi.displayFieldLabel;
  if (kpi.fieldType === "custom") return kpi.customFieldLabel ?? kpi.sourceColumn ?? "Champ personnalisé";
  return formatAtlasField(kpi.primaryField);
}

function formatDate(value?: string) {
  if (!value) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function trendLabel(trend?: "up" | "down" | "stable") {
  if (trend === "up") return "▲ hausse";
  if (trend === "down") return "▼ baisse";
  return "→ stable";
}

export function LocalKpiConfigurations() {
  const { data: workspace, refresh: reloadKpis } = useLocalKpiWorkspace();
  const kpis = workspace.configurations;


  function recalculateKpi(kpi: LocalKpiConfiguration) {
    const sourceImport = kpi.importId ? getLocalImportById(kpi.importId) : null;
    if (!sourceImport) return;

    const nextTestResult = calculateLocalKpiFromImport(sourceImport, kpi);
    const nextKpi = { ...kpi, testResult: nextTestResult };
    const previousResult = workspace.results.find((result) => result.kpiId === kpi.id);
    const nextResult = buildLocalKpiResult(nextKpi, nextTestResult, previousResult);

    saveLocalKpiConfiguration(nextKpi);
    saveLocalKpiResult(nextResult);
    const historyPoint = buildLocalKpiHistoryPoint(nextResult);
    saveLocalKpiHistoryPoint(historyPoint);
    void persistLocalKpiSnapshotAction({
      organizationId: nextKpi.organizationId,
      kpi: nextKpi,
      result: nextResult,
      historyPoint
    });
    reloadKpis();
  }

  function deleteKpi(id: string) {
    const kpi = kpis.find((item) => item.id === id);
    const sourceImport = kpi?.importId ? getLocalImportById(kpi.importId) : null;
    if (kpi && sourceImport) {
      updateLocalImport({
        ...sourceImport,
        linkedLocalKpiIds: (sourceImport.linkedLocalKpiIds ?? []).filter((item) => item !== kpi.id),
        linkedLocalKpiNames: (sourceImport.linkedLocalKpiNames ?? []).filter((item) => item !== kpi.name)
      });
    }
    deleteLocalKpiConfiguration(id);
    deleteLocalKpiResult(id);
    deleteLocalKpiHistoryByKpiId(id);
    void deleteLocalKpiSnapshotAction({ kpiId: id, resultId: id });
    reloadKpis();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>KPI créés localement</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Configurations créées depuis un import CSV local. Elles ne sont pas persistées en base.
            </p>
          </div>
          <Badge>Non persisté</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {kpis.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Aucun KPI local pour l&apos;instant. Créez-en un depuis Imports & mappings après validation d&apos;un import CSV.
          </p>
        ) : (
          <div className="space-y-4">
            {kpis.map((kpi) => {
              const status = kpi.testResult?.status ?? "not-tested";
              const sourceImport = kpi.importId ? getLocalImportById(kpi.importId) : null;
              const sourceDeleted = Boolean(kpi.importId && !sourceImport);
              const history = workspace.historyByKpiId[kpi.id] ?? [];
              const latestHistory = history[0];

              return (
                <article key={kpi.id} className="rounded-lg border border-line bg-white p-4">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-ink">{kpi.name}</h3>
                        <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>
                        <Badge>{formatKpiDirection(kpi.direction)}</Badge>
                        {kpi.fieldType === "custom" ? <Badge variant="brand">Champ personnalisé</Badge> : null}
                        {sourceDeleted ? <Badge variant="warning">Import source supprimé</Badge> : null}
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-4">
                        <div className="rounded-md border border-line bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Source</p>
                          <p className="mt-1 text-sm font-semibold text-ink">{kpi.sourceFileName}</p>
                          <p className="mt-1 text-xs text-slate-500">Import : {kpi.importId ?? "non lié"}</p>
                        </div>
                        <div className="rounded-md border border-line bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Calcul</p>
                          <p className="mt-1 text-sm font-semibold text-ink">{calculationLabels[kpi.calculationType]}</p>
                          <p className="mt-1 text-xs text-slate-500">{displayPrimaryField(kpi)}</p>
                        </div>
                        <div className="rounded-md border border-line bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Dernier test</p>
                          <p className="mt-1 text-sm font-semibold text-ink">
                            {kpi.testResult ? `${kpi.testResult.value} sur ${kpi.testResult.rowsUsed} lignes` : "Non testé"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">Objectif : {kpi.targetValue}</p>
                        </div>
                        <div className="rounded-md border border-line bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Tendance</p>
                          <p className="mt-1 text-sm font-semibold text-ink">{trendLabel(latestHistory?.trend)}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatVariation(latestHistory?.variation)}</p>
                        </div>
                      </div>

                      {history.length > 0 ? (
                        <div className="mt-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Historique récent</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {history.slice(0, 6).map((point) => (
                              <div key={point.id} className="rounded-md border border-line bg-slate-50 px-3 py-2 text-xs">
                                <p className="font-semibold text-ink">{point.value}</p>
                                <p className="text-slate-500">{formatDate(point.calculatedAt)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button className="h-9 justify-center" onClick={() => recalculateKpi(kpi)} disabled={!sourceImport}>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Recalculer
                      </Button>
                      <Button className="h-9 justify-center" onClick={() => deleteKpi(kpi.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Supprimer
                      </Button>
                      <Badge>persisted: false</Badge>
                      <p className="text-xs text-slate-500">Date import : {formatDate(sourceImport?.createdAt ?? kpi.importCreatedAt)}</p>
                    </div>
                  </div>

                  <EditLocalKpiThresholds kpi={kpi} onUpdated={reloadKpis} />
                  <LocalAlertRulesPanel kpi={kpi} />
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
