"use client";

import { useState } from "react";
import { Save, TestTube2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateLocalKpiFromImport } from "@/lib/kpi-engine/local-kpi-calculator";
import { formatKpiDirection, inferKpiDirection, validateThresholdOrder } from "@/lib/kpi-engine/local-kpi-direction";
import { buildLocalKpiHistoryPoint, buildLocalKpiResult } from "@/lib/kpi-engine/local-kpi-results";
import { getLocalImportById } from "@/lib/local/local-import-store";
import { saveLocalKpiConfiguration } from "@/lib/local/local-kpi-store";
import { saveLocalKpiHistoryPoint } from "@/lib/local/local-kpi-history-store";
import { getLocalKpiResults, saveLocalKpiResult } from "@/lib/local/local-kpi-results-store";
import { persistLocalKpiSnapshotAction } from "@/lib/actions/local-kpi-persistence-actions";
import type { KpiDirection, LocalKpiConfiguration } from "@/types/local-kpi";
import type { LocalKpiThresholdChange } from "@/types/local-kpi-history";

function validateThresholds(
  direction: KpiDirection,
  targetValue: number,
  warningThreshold: number,
  criticalThreshold: number
) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Number.isFinite(targetValue)) errors.push("L'objectif doit être numérique.");
  if (!Number.isFinite(warningThreshold)) errors.push("Le seuil de surveillance doit être numérique.");
  if (!Number.isFinite(criticalThreshold)) errors.push("Le seuil critique doit être numérique.");
  if (!validateThresholdOrder(direction, targetValue, warningThreshold, criticalThreshold)) {
    errors.push(
      direction === "lower_is_better"
        ? "Pour ce KPI, l'ordre attendu est objectif < surveillance < critique."
        : "Pour ce KPI, l'ordre attendu est critique < surveillance < objectif."
    );
  }

  return { errors, warnings };
}

export function EditLocalKpiThresholds({
  kpi,
  onUpdated
}: {
  kpi: LocalKpiConfiguration;
  onUpdated: () => void;
}) {
  const [targetValue, setTargetValue] = useState(kpi.targetValue);
  const [warningThreshold, setWarningThreshold] = useState(kpi.warningThreshold);
  const [criticalThreshold, setCriticalThreshold] = useState(kpi.criticalThreshold);
  const [direction, setDirection] = useState<KpiDirection>(() => inferKpiDirection(kpi));
  const [message, setMessage] = useState<string | null>(null);
  const [lastChange, setLastChange] = useState<LocalKpiThresholdChange | null>(
    kpi.thresholdChanges?.[0] ?? null
  );

  const validation = validateThresholds(direction, targetValue, warningThreshold, criticalThreshold);

  function saveThresholds() {
    if (validation.errors.length > 0) return;

    const changedAt = new Date().toISOString();
    const thresholdChange: LocalKpiThresholdChange = {
      id: `local-threshold-change-${kpi.id}-${Date.now()}`,
      kpiId: kpi.id,
      changedAt,
      previousTargetValue: kpi.targetValue,
      nextTargetValue: targetValue,
      previousWarningThreshold: kpi.warningThreshold,
      nextWarningThreshold: warningThreshold,
      previousCriticalThreshold: kpi.criticalThreshold,
      nextCriticalThreshold: criticalThreshold,
      persisted: false
    };
    const nextKpi: LocalKpiConfiguration = {
      ...kpi,
      direction,
      targetValue,
      warningThreshold,
      criticalThreshold,
      thresholdChanges: [thresholdChange, ...(kpi.thresholdChanges ?? [])].slice(0, 10)
    };
    const sourceImport = kpi.importId ? getLocalImportById(kpi.importId) : null;

    if (sourceImport) {
      const nextTestResult = calculateLocalKpiFromImport(sourceImport, nextKpi);
      const nextKpiWithResult = {
        ...nextKpi,
        testResult: nextTestResult
      };
      const previousResult = getLocalKpiResults().find((result) => result.kpiId === kpi.id);
      const nextResult = buildLocalKpiResult(nextKpiWithResult, nextTestResult, previousResult);

      saveLocalKpiConfiguration(nextKpiWithResult);
      saveLocalKpiResult(nextResult);
      const historyPoint = buildLocalKpiHistoryPoint(nextResult);
      saveLocalKpiHistoryPoint(historyPoint);
      void persistLocalKpiSnapshotAction({
        organizationId: nextKpiWithResult.organizationId,
        kpi: nextKpiWithResult,
        result: nextResult,
        historyPoint
      });
      setMessage("Seuils modifiés localement, KPI recalculé et historique mis à jour.");
    } else {
      saveLocalKpiConfiguration(nextKpi);
      setMessage("Seuils modifiés localement. Recalcul impossible : import source absent.");
    }

    setLastChange(thresholdChange);
    onUpdated();
  }

  return (
    <div className="mt-4 rounded-md border border-line bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">Seuils modifiables</Badge>
        <Badge>Local</Badge>
        {lastChange ? <Badge variant="warning">Seuils modifiés localement</Badge> : null}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <label>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Sens du KPI</span>
          <select
            value={direction}
            onChange={(event) => setDirection(event.target.value as KpiDirection)}
            className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
          >
            <option value="higher_is_better">Plus haut = meilleur</option>
            <option value="lower_is_better">Plus bas = meilleur</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">{formatKpiDirection(direction)}</p>
        </label>
        <label>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Objectif</span>
          <input
            type="number"
            value={targetValue}
            onChange={(event) => setTargetValue(Number(event.target.value))}
            className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
          />
        </label>
        <label>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Seuil surveillance</span>
          <input
            type="number"
            value={warningThreshold}
            onChange={(event) => setWarningThreshold(Number(event.target.value))}
            className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
          />
        </label>
        <label>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Seuil critique</span>
          <input
            type="number"
            value={criticalThreshold}
            onChange={(event) => setCriticalThreshold(Number(event.target.value))}
            className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
          />
        </label>
      </div>

      {validation.errors.length > 0 || validation.warnings.length > 0 ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {[...validation.errors, ...validation.warnings].map((item, index) => <p key={`threshold-validation-${index}-${item}`}>{item}</p>)}
        </div>
      ) : null}

      {lastChange ? (
        <p className="mt-3 text-xs text-slate-500">
          Dernière modification : objectif {lastChange.previousTargetValue} → {lastChange.nextTargetValue},
          surveillance {lastChange.previousWarningThreshold} → {lastChange.nextWarningThreshold},
          critique {lastChange.previousCriticalThreshold} → {lastChange.nextCriticalThreshold}.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={saveThresholds} disabled={validation.errors.length > 0}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Enregistrer les seuils
        </Button>
        <Badge>
          <TestTube2 className="mr-1 h-3 w-3" aria-hidden="true" />
          Recalcul dynamique
        </Badge>
      </div>

      {message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}
    </div>
  );
}
