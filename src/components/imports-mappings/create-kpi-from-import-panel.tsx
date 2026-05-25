"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Save, TestTube2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateLocalKpiFromImport } from "@/lib/kpi-engine/local-kpi-calculator";
import { saveLocalKpiConfiguration } from "@/lib/local/local-kpi-store";
import { formatAtlasField } from "@/lib/formatters/status-labels";
import type { AtlasField, KPIConfigurationDraft, PerformanceKPI } from "@/types/atlas";
import type { LocalValidatedImport } from "@/types/data-import";
import type { KpiImpactCandidate } from "@/lib/data-pipeline/kpi-impact";
import type { LocalKpiConfiguration, LocalKpiDraft, LocalKpiTestResult } from "@/types/local-kpi";

const calculationTypes: { value: KPIConfigurationDraft["calculationType"]; label: string }[] = [
  { value: "sum", label: "Somme" },
  { value: "average", label: "Moyenne" },
  { value: "count", label: "Comptage" },
  { value: "distinct-count", label: "Comptage unique" },
  { value: "rate", label: "Taux" },
  { value: "ratio", label: "Ratio" },
  { value: "period-change", label: "Évolution période" }
];

const categoryOptions: { value: PerformanceKPI["category"]; label: string }[] = [
  { value: "revenue", label: "CA" },
  { value: "margin", label: "Marge" },
  { value: "activity", label: "Activité" },
  { value: "cash", label: "Cash" },
  { value: "quality", label: "Qualité" },
  { value: "operations", label: "Opérations" }
];

function categoryFromCandidate(candidate: KpiImpactCandidate): PerformanceKPI["category"] {
  if (candidate.id.includes("revenue")) return "revenue";
  if (candidate.id.includes("margin")) return "margin";
  if (candidate.id.includes("cash")) return "cash";
  if (candidate.id.includes("satisfaction")) return "quality";
  if (candidate.id.includes("regional") || candidate.id.includes("interventions")) return "operations";
  return "activity";
}

function calculationFromCandidate(candidate: KpiImpactCandidate): KPIConfigurationDraft["calculationType"] {
  if (candidate.id.includes("margin") || candidate.id.includes("satisfaction")) return "average";
  if (candidate.id.includes("late")) return "rate";
  if (candidate.id.includes("regional")) return "count";
  return "sum";
}

function primaryFieldFromCandidate(candidate: KpiImpactCandidate): AtlasField {
  if (candidate.requiredFieldsPresent.includes("ChiffreAffaires")) return "ChiffreAffaires";
  if (candidate.requiredFieldsPresent.includes("Marge")) return "Marge";
  if (candidate.requiredFieldsPresent.includes("Tresorerie")) return "Tresorerie";
  if (candidate.requiredFieldsPresent.includes("Qualite")) return "Qualite";
  if (candidate.requiredFieldsPresent.includes("Intervention")) return "Intervention";
  return candidate.requiredFieldsPresent[0] ?? "Date";
}

function validateDraft(draft: LocalKpiDraft) {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Le nom du KPI est obligatoire.");
  if (!draft.calculationType) errors.push("Le type de calcul est obligatoire.");
  if (draft.calculationType !== "count" && !draft.primaryField) {
    errors.push("Le champ principal est obligatoire hors comptage simple.");
  }
  if (Number.isNaN(draft.targetValue)) errors.push("L'objectif doit être numérique.");
  if (draft.criticalThreshold > draft.warningThreshold) {
    errors.push("Le seuil critique doit rester inférieur ou égal au seuil de surveillance.");
  }
  return errors;
}

export function CreateKpiFromImportPanel({
  importData,
  candidate,
  onSaved
}: {
  importData: LocalValidatedImport;
  candidate: KpiImpactCandidate;
  onSaved: () => void;
}) {
  const availableFields = useMemo(
    () => Array.from(new Set(importData.mappings.map((mapping) => mapping.atlasField).filter((field) => field !== "NonMappe"))),
    [importData.mappings]
  );
  const [draft, setDraft] = useState<LocalKpiDraft>({
    name: candidate.name,
    organizationId: "org-atlas-demo",
    sourceFileName: importData.fileName,
    category: categoryFromCandidate(candidate),
    calculationType: calculationFromCandidate(candidate),
    primaryField: primaryFieldFromCandidate(candidate),
    secondaryField: candidate.requiredFieldsPresent.find((field) => field !== primaryFieldFromCandidate(candidate)),
    targetValue: 100,
    warningThreshold: 80,
    criticalThreshold: 60,
    frequency: "monthly",
    owner: "Direction",
    expectedImpact: candidate.businessNote
  });
  const [testResult, setTestResult] = useState<LocalKpiTestResult | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const validationErrors = validateDraft(draft);

  function update<K extends keyof LocalKpiDraft>(key: K, value: LocalKpiDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaveMessage(null);
  }

  function testCalculation() {
    setTestResult(calculateLocalKpiFromImport(importData, draft));
  }

  function saveKpi() {
    if (validationErrors.length > 0) return;
    const nextTestResult = testResult ?? calculateLocalKpiFromImport(importData, draft);
    const kpi: LocalKpiConfiguration = {
      ...draft,
      id: `local-kpi-${Date.now()}`,
      createdAt: new Date().toISOString(),
      testResult: nextTestResult,
      persisted: false
    };

    saveLocalKpiConfiguration(kpi);
    setTestResult(nextTestResult);
    setSaveMessage("KPI enregistré localement, visible dans Configuration KPI.");
    onSaved();
  }

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Créer un KPI à partir de cet import</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Préremplissage local depuis le fichier {importData.fileName}. Aucune donnée n&apos;est persistée.
            </p>
          </div>
          <Badge variant="brand">KPI local</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Nom KPI</span>
            <input
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            />
          </label>
          <label className="rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Catégorie</span>
            <select
              value={draft.category}
              onChange={(event) => update("category", event.target.value as LocalKpiDraft["category"])}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Type de calcul</span>
            <select
              value={draft.calculationType}
              onChange={(event) => update("calculationType", event.target.value as LocalKpiDraft["calculationType"])}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              {calculationTypes.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Champ principal</span>
            <select
              value={draft.primaryField}
              onChange={(event) => update("primaryField", event.target.value as AtlasField)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              {availableFields.map((field) => (
                <option key={field} value={field}>{formatAtlasField(field)}</option>
              ))}
            </select>
          </label>
          <label className="rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Champ secondaire</span>
            <select
              value={draft.secondaryField ?? ""}
              onChange={(event) => update("secondaryField", (event.target.value || undefined) as AtlasField | undefined)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              <option value="">Aucun</option>
              {availableFields.map((field) => (
                <option key={field} value={field}>{formatAtlasField(field)}</option>
              ))}
            </select>
          </label>
          <label className="rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Filtre optionnel</span>
            <input
              value={draft.filterValue ?? ""}
              onChange={(event) => update("filterValue", event.target.value)}
              placeholder="Ex : Est, payé, maintenance"
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            />
          </label>
          {[
            ["Objectif", "targetValue", draft.targetValue],
            ["Seuil de surveillance", "warningThreshold", draft.warningThreshold],
            ["Seuil critique", "criticalThreshold", draft.criticalThreshold]
          ].map(([label, key, value]) => (
            <label key={String(key)} className="rounded-md border border-line bg-slate-50 p-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
              <input
                type="number"
                value={Number(value)}
                onChange={(event) => update(key as keyof LocalKpiDraft, Number(event.target.value) as never)}
                className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
              />
            </label>
          ))}
          <label className="rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Fréquence</span>
            <select
              value={draft.frequency}
              onChange={(event) => update("frequency", event.target.value as LocalKpiDraft["frequency"])}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </label>
          <label className="rounded-md border border-line bg-slate-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Responsable métier</span>
            <input
              value={draft.owner}
              onChange={(event) => update("owner", event.target.value)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            />
          </label>
        </div>

        <label className="block rounded-md border border-line bg-slate-50 p-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Impact attendu</span>
          <textarea
            value={draft.expectedImpact}
            onChange={(event) => update("expectedImpact", event.target.value)}
            className="mt-2 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-ink"
          />
        </label>

        {validationErrors.length > 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Validation</p>
            <ul className="mt-2 list-disc pl-5">
              {validationErrors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={testCalculation}>
            <TestTube2 className="h-4 w-4" aria-hidden="true" />
            Tester le calcul
          </Button>
          <Button variant="primary" onClick={saveKpi} disabled={validationErrors.length > 0}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Enregistrer localement le KPI
          </Button>
          <Badge>Non persisté</Badge>
        </div>

        {testResult ? (
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Valeur", testResult.value],
              ["Lignes utilisées", testResult.rowsUsed],
              ["Lignes ignorées", testResult.ignoredRows],
              ["Statut", testResult.status]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-line bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
            {testResult.warning ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 md:col-span-4">
                {testResult.warning}
              </p>
            ) : null}
          </div>
        ) : null}

        {saveMessage ? (
          <div className="flex flex-col gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">{saveMessage}</p>
            <Link
              href="/kpi-configuration"
              className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-700 px-3 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              Voir dans Configuration KPI
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
