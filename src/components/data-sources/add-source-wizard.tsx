"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Database, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createDataSourceAction } from "@/lib/actions/admin-actions";
import { validateDataSourceDraft } from "@/lib/validation/admin-validation";
import type { ActionResult, DataSourceDraft, DataSourceType } from "@/types/atlas";

const sourceTypes: { label: string; value: DataSourceType; icon: typeof FileSpreadsheet }[] = [
  { label: "Excel", value: "excel", icon: FileSpreadsheet },
  { label: "CSV", value: "csv", icon: FileSpreadsheet },
  { label: "MySQL", value: "mysql", icon: Database },
  { label: "PostgreSQL", value: "postgresql", icon: Database },
  { label: "SQL Server", value: "sql-server", icon: Database }
];

export function AddSourceWizard() {
  const [draft, setDraft] = useState<DataSourceDraft>({
    name: "Export performance mensuel",
    organizationId: "org-atlas-demo",
    type: "csv",
    usage: ["CA", "marge"],
    syncFrequency: "daily"
  });
  const [tested, setTested] = useState(false);
  const [result, setResult] = useState<ActionResult<DataSourceDraft> | null>(null);
  const validation = useMemo(() => validateDataSourceDraft(draft), [draft]);

  async function createSource() {
    const actionResult = await createDataSourceAction(draft);
    setResult(actionResult);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Parcours mocké : ajouter une source</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Aucun upload ni accès base de données.</p>
          </div>
          <Badge variant="brand">Simulation mock</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 lg:grid-cols-5">
          {sourceTypes.map((type) => {
            const Icon = type.icon;
            const active = draft.type === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, type: type.value }))}
                className={`rounded-md border p-4 text-left ${active ? "border-brand-200 bg-brand-50" : "border-line bg-white"}`}
              >
                <Icon className="h-5 w-5 text-brand-700" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-ink">{type.label}</p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Nom source", "name", draft.name],
            ["Organisation", "organizationId", draft.organizationId],
            ["Fréquence", "syncFrequency", draft.syncFrequency]
          ].map(([label, key, value]) => (
            <label key={key} className="block rounded-md border border-line bg-slate-50 p-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
              <input
                value={value}
                onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
              />
              {validation.validationErrors?.[key] ? (
                <p className="mt-2 text-xs text-rose-600">{validation.validationErrors[key]}</p>
              ) : null}
            </label>
          ))}
        </div>

        <section className="rounded-md border border-line bg-slate-50 p-4">
          <h3 className="font-semibold text-ink">Test connexion / fichier</h3>
          <p className="mt-2 text-sm text-slate-600">
            {draft.type === "excel" || draft.type === "csv"
              ? "Fichier simulé détecté : performance-mai.csv"
              : "Connexion simulée en lecture seule. Aucun accès réel n'est effectué."}
          </p>
          <Button className="mt-3" onClick={() => setTested(true)}>
            Simuler le test
          </Button>
          {tested ? (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Statut test : OK / à vérifier selon mapping.
            </div>
          ) : null}
        </section>

        <section className="rounded-md border border-line bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-500">Score qualité mapping</span>
            <span className="font-semibold text-ink">82%</span>
          </div>
          <Progress value={82} />
          <p className="mt-3 text-sm text-slate-600">
            Colonnes détectées : date_cmd, montant_ht, marge_pct, region_vente. La colonne region_vente reste à vérifier.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={createSource}>Créer la source</Button>
          <Badge>Non persisté</Badge>
        </div>

        {result ? (
          <div className={`rounded-md border p-4 text-sm ${result.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            <p className="font-semibold">{result.message}</p>
            <p className="mt-2">Mode : {result.mode} - persisté : {result.persisted ? "oui" : "non"}</p>
            {result.validationErrors ? (
              <ul className="mt-2 list-disc pl-5">
                {Object.entries(result.validationErrors).map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2">Prochaines étapes : mapping, import test, configuration KPI.</p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
