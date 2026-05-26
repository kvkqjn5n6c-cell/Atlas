"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Save, TestTube2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEffectiveAtlasField, getMappingDisplayLabel, getMappingFieldType } from "@/lib/data-pipeline/mapping-suggestions";
import { calculateLocalKpiFromImport } from "@/lib/kpi-engine/local-kpi-calculator";
import { buildLocalKpiHistoryPoint, buildLocalKpiResult } from "@/lib/kpi-engine/local-kpi-results";
import { saveLocalKpiConfiguration } from "@/lib/local/local-kpi-store";
import { saveLocalKpiHistoryPoint } from "@/lib/local/local-kpi-history-store";
import { getLocalKpiResults, saveLocalKpiResult } from "@/lib/local/local-kpi-results-store";
import { updateLocalImport } from "@/lib/local/local-import-store";
import { registerBusinessFieldUsage } from "@/lib/local/business-dictionary-store";
import { registerBusinessFieldUsageAction } from "@/lib/actions/business-dictionary-actions";
import { formatAtlasField } from "@/lib/formatters/status-labels";
import type { KpiImpactCandidate } from "@/lib/data-pipeline/kpi-impact";
import type { AtlasField, KPIConfigurationDraft, PerformanceKPI } from "@/types/atlas";
import type { DetectedColumnType, LocalValidatedColumnMapping, LocalValidatedImport, MappingFieldType } from "@/types/data-import";
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

function calculationFromColumnType(type: DetectedColumnType): KPIConfigurationDraft["calculationType"] {
  if (type === "number") return "sum";
  if (type === "boolean" || type === "status") return "rate";
  if (type === "text") return "count";
  return "count";
}

function categoryFromColumn(mapping: LocalValidatedColumnMapping): PerformanceKPI["category"] {
  const label = `${mapping.sourceColumn} ${mapping.customFieldLabel ?? ""}`.toLowerCase();
  if (label.includes("cout") || label.includes("coût") || label.includes("marge")) return "margin";
  if (label.includes("montant") || label.includes("cash")) return "cash";
  if (label.includes("satisfaction") || label.includes("qualite")) return "quality";
  if (label.includes("intervention") || label.includes("dossier") || label.includes("heure")) return "operations";
  return "activity";
}

function buildDraftFromColumn(importData: LocalValidatedImport, mapping: LocalValidatedColumnMapping): LocalKpiDraft {
  const fieldType = getMappingFieldType(mapping);
  const effectiveField = getEffectiveAtlasField(mapping);
  const displayLabel = getMappingDisplayLabel(mapping);

  return {
    name: `${calculationFromColumnType(mapping.detectedType) === "sum" ? "Somme" : "KPI"} ${displayLabel}`,
    organizationId: "org-atlas-demo",
    importId: importData.id,
    sourceFileName: importData.fileName,
    importCreatedAt: importData.createdAt,
    category: categoryFromColumn(mapping),
    calculationType: calculationFromColumnType(mapping.detectedType),
    primaryField: fieldType === "standard" ? effectiveField : "NonMappe",
    sourceColumn: mapping.sourceColumn,
    fieldType,
    customFieldLabel: fieldType === "custom" ? mapping.customFieldLabel : undefined,
    displayFieldLabel: displayLabel,
    targetValue: 0,
    warningThreshold: 0,
    criticalThreshold: 0,
    frequency: "monthly",
    owner: "Direction",
    expectedImpact: `Suivre ${displayLabel} à partir du fichier importé.`
  };
}

function buildDraftFromCandidate(importData: LocalValidatedImport, candidate: KpiImpactCandidate): LocalKpiDraft {
  const primaryField = primaryFieldFromCandidate(candidate);
  const sourceColumn = importData.mappings.find((mapping) => getEffectiveAtlasField(mapping) === primaryField)?.sourceColumn;

  return {
    name: candidate.name,
    organizationId: "org-atlas-demo",
    importId: importData.id,
    sourceFileName: importData.fileName,
    importCreatedAt: importData.createdAt,
    category: categoryFromCandidate(candidate),
    calculationType: calculationFromCandidate(candidate),
    primaryField,
    secondaryField: candidate.requiredFieldsPresent.find((field) => field !== primaryField),
    sourceColumn,
    fieldType: "standard",
    displayFieldLabel: formatAtlasField(primaryField),
    targetValue: 0,
    warningThreshold: 0,
    criticalThreshold: 0,
    frequency: "monthly",
    owner: "Direction",
    expectedImpact: candidate.businessNote
  };
}

function validateDraft(draft: LocalKpiDraft, detectedType?: DetectedColumnType) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!draft.name.trim()) errors.push("Le nom du KPI est obligatoire.");
  if (!draft.calculationType) errors.push("Le type de calcul est obligatoire.");
  if (draft.fieldType === "custom" && !draft.customFieldLabel?.trim()) {
    errors.push("Le nom métier du champ personnalisé est obligatoire.");
  }
  if (draft.calculationType !== "count" && !draft.primaryField && !draft.sourceColumn) {
    errors.push("Le champ principal est obligatoire hors comptage simple.");
  }
  if (Number.isNaN(draft.targetValue)) errors.push("L'objectif doit être numérique.");
  if (draft.criticalThreshold > draft.warningThreshold) {
    errors.push("Le seuil critique doit rester inférieur ou égal au seuil de surveillance.");
  }
  if (detectedType === "text" && !["count", "distinct-count"].includes(draft.calculationType)) {
    warnings.push("Cette colonne texte est généralement plus fiable en comptage ou comptage unique.");
  }
  if (detectedType === "date") {
    warnings.push("Une date seule sert surtout à périodiser un KPI, pas à le mesurer.");
  }

  return { errors, warnings };
}

export function CreateKpiFromImportPanel({
  importData,
  candidate,
  mapping,
  onSaved
}: {
  importData: LocalValidatedImport;
  candidate?: KpiImpactCandidate;
  mapping?: LocalValidatedColumnMapping;
  onSaved: () => void;
}) {
  const availableMappings = useMemo(
    () => importData.mappings.filter((item) => getMappingFieldType(item) !== "unused"),
    [importData.mappings]
  );
  const [draft, setDraft] = useState<LocalKpiDraft>(() =>
    mapping ? buildDraftFromColumn(importData, mapping) : buildDraftFromCandidate(importData, candidate as KpiImpactCandidate)
  );
  const [testResult, setTestResult] = useState<LocalKpiTestResult | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const validation = validateDraft(draft, mapping?.detectedType);

  function update<K extends keyof LocalKpiDraft>(key: K, value: LocalKpiDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaveMessage(null);
  }

  function selectPrimaryMapping(sourceColumn: string) {
    const selected = availableMappings.find((item) => item.sourceColumn === sourceColumn);
    if (!selected) return;
    const fieldType = getMappingFieldType(selected);
    const effectiveField = getEffectiveAtlasField(selected);
    const displayLabel = getMappingDisplayLabel(selected);

    setDraft((current) => ({
      ...current,
      sourceColumn: selected.sourceColumn,
      fieldType,
      primaryField: fieldType === "standard" ? effectiveField : "NonMappe",
      customFieldLabel: fieldType === "custom" ? selected.customFieldLabel : undefined,
      displayFieldLabel: displayLabel
    }));
  }

  function testCalculation() {
    setTestResult(calculateLocalKpiFromImport(importData, draft));
  }

  function saveKpi() {
    if (validation.errors.length > 0) return;
    const nextTestResult = testResult ?? calculateLocalKpiFromImport(importData, draft);
    const kpi: LocalKpiConfiguration = {
      ...draft,
      id: `local-kpi-${Date.now()}`,
      createdAt: new Date().toISOString(),
      testResult: nextTestResult,
      persisted: false
    };

    const localKpiResult = buildLocalKpiResult(
      kpi,
      nextTestResult,
      getLocalKpiResults().find((result) => result.kpiId === kpi.id)
    );

    saveLocalKpiConfiguration(kpi);
    saveLocalKpiResult(localKpiResult);
    saveLocalKpiHistoryPoint(buildLocalKpiHistoryPoint(localKpiResult));
    updateLocalImport({
      ...importData,
      updatedAt: new Date().toISOString(),
      linkedLocalKpiIds: Array.from(new Set([...(importData.linkedLocalKpiIds ?? []), kpi.id])),
      linkedLocalKpiNames: Array.from(new Set([...(importData.linkedLocalKpiNames ?? []), kpi.name]))
    });
    if (draft.fieldType === "custom" && draft.customFieldLabel && draft.sourceColumn) {
      registerBusinessFieldUsage({
        organizationId: draft.organizationId,
        label: draft.customFieldLabel,
        sourceColumn: draft.sourceColumn,
        detectedType: mapping?.detectedType ?? "text",
        linkedKpi: draft.name,
        tags: ["kpi-local"]
      });
      void registerBusinessFieldUsageAction({
        organizationId: draft.organizationId,
        label: draft.customFieldLabel,
        sourceColumn: draft.sourceColumn,
        detectedType: mapping?.detectedType ?? "text",
        linkedKpi: draft.name,
        tags: ["kpi-local"]
      });
    }
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
              Préremplissage local depuis le fichier {importData.fileName}. Atlas accepte les champs standards et personnalisés.
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
              value={draft.sourceColumn ?? ""}
              onChange={(event) => selectPrimaryMapping(event.target.value)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              {availableMappings.map((item) => (
                <option key={item.sourceColumn} value={item.sourceColumn}>
                  {getMappingDisplayLabel(item)} ({item.sourceColumn})
                </option>
              ))}
            </select>
            {draft.fieldType === "custom" ? <Badge className="mt-2">Champ personnalisé</Badge> : null}
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

        {validation.errors.length > 0 || validation.warnings.length > 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Validation</p>
            <ul className="mt-2 list-disc pl-5">
              {[...validation.errors, ...validation.warnings].map((message) => <li key={message}>{message}</li>)}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={testCalculation}>
            <TestTube2 className="h-4 w-4" aria-hidden="true" />
            Tester le calcul
          </Button>
          <Button variant="primary" onClick={saveKpi} disabled={validation.errors.length > 0}>
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
