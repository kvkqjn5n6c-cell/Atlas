"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, TestTube2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveKpiConfigurationAction } from "@/lib/actions/admin-actions";
import { validateKpiConfigurationDraft } from "@/lib/validation/admin-validation";
import type { ActionResult, KPIConfigurationDraft } from "@/types/atlas";

const calculationTypes = ["sum", "average", "rate", "count", "distinct-count", "ratio", "period-change"] as const;

const calculationTypeLabels: Record<(typeof calculationTypes)[number], string> = {
  sum: "Somme",
  average: "Moyenne",
  rate: "Taux",
  count: "Comptage",
  "distinct-count": "Comptage unique",
  ratio: "Ratio",
  "period-change": "Évolution période"
};

export function KpiConfigPanel() {
  const [draft, setDraft] = useState<KPIConfigurationDraft>({
    name: "CA mensuel",
    organizationId: "org-atlas-demo",
    category: "revenue",
    sourceId: "source-erp-csv",
    primaryField: "ChiffreAffaires",
    secondaryField: "Date",
    calculationType: "sum",
    targetValue: 65000,
    warningThreshold: 58000,
    criticalThreshold: 50000,
    frequency: "daily",
    owner: "Direction",
    expectedImpact: "Identifier rapidement l'écart de croissance.",
    isActive: true
  });
  const [testResult, setTestResult] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult<KPIConfigurationDraft> | null>(null);
  const validation = useMemo(() => validateKpiConfigurationDraft(draft), [draft]);

  function update(key: keyof KPIConfigurationDraft, value: string | number | boolean) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setResult(await saveKpiConfigurationAction(draft));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Configurer un KPI</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Flux local, préparé pour Prisma.</p>
          </div>
          <Badge variant="brand">Simulation mock</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Nom du KPI", "name", draft.name],
            ["Organisation", "organizationId", draft.organizationId],
            ["Source", "sourceId", draft.sourceId],
            ["Champ principal", "primaryField", draft.primaryField],
            ["Objectif", "targetValue", draft.targetValue],
            ["Seuil surveillance", "warningThreshold", draft.warningThreshold],
            ["Seuil critique", "criticalThreshold", draft.criticalThreshold],
            ["Responsable", "owner", draft.owner],
            ["Impact attendu", "expectedImpact", draft.expectedImpact]
          ].map(([label, key, value]) => (
            <label key={String(key)} className="block rounded-md border border-line bg-slate-50 p-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
              <input
                value={String(value)}
                onChange={(event) => {
                  const numeric = ["targetValue", "warningThreshold", "criticalThreshold"].includes(String(key));
                  update(key as keyof KPIConfigurationDraft, numeric ? Number(event.target.value) : event.target.value);
                }}
                className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
              />
              {validation.validationErrors?.[String(key)] ? (
                <p className="mt-2 text-xs text-rose-600">{validation.validationErrors[String(key)]}</p>
              ) : null}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {calculationTypes.map((type) => (
            <button key={type} type="button" onClick={() => update("calculationType", type)}>
              <Badge variant={draft.calculationType === type ? "brand" : "default"}>{calculationTypeLabels[type]}</Badge>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              setTestResult("Valeur calculée : 53 100 EUR sur 1 216 lignes, période Mai 2026, statut À surveiller.")
            }
          >
            <TestTube2 className="h-4 w-4" aria-hidden="true" />
            Tester le calcul
          </Button>
          <Button variant="primary" onClick={save}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Enregistrer la configuration
          </Button>
          <Badge>Non persisté</Badge>
        </div>

        {testResult ? <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-ink">{testResult}</p> : null}
        {result ? (
          <p className={`rounded-md border p-4 text-sm ${result.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {result.message} Mode {result.mode}, persisté : {result.persisted ? "oui" : "non"}.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
