"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAtlasField } from "@/lib/formatters/status-labels";
import { deleteLocalKpiConfiguration, getLocalKpiConfigurations } from "@/lib/local/local-kpi-store";
import type { LocalKpiConfiguration, LocalKpiTestStatus } from "@/types/local-kpi";

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

export function LocalKpiConfigurations() {
  const [kpis, setKpis] = useState<LocalKpiConfiguration[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setKpis(getLocalKpiConfigurations());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function deleteKpi(id: string) {
    deleteLocalKpiConfiguration(id);
    setKpis(getLocalKpiConfigurations());
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
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">KPI</th>
                  <th className="px-4 py-3 font-medium">Source fichier</th>
                  <th className="px-4 py-3 font-medium">Type calcul</th>
                  <th className="px-4 py-3 font-medium">Champ principal</th>
                  <th className="px-4 py-3 font-medium">Objectif</th>
                  <th className="px-4 py-3 font-medium">Dernier test</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Persistance</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {kpis.map((kpi) => {
                  const status = kpi.testResult?.status ?? "not-tested";

                  return (
                    <tr key={kpi.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-ink">{kpi.name}</td>
                      <td className="px-4 py-3 text-slate-600">{kpi.sourceFileName}</td>
                      <td className="px-4 py-3 text-slate-600">{calculationLabels[kpi.calculationType]}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{displayPrimaryField(kpi)}</span>
                          {kpi.fieldType === "custom" ? <Badge variant="brand">Champ personnalisé</Badge> : null}
                        </div>
                        {kpi.sourceColumn ? <p className="mt-1 text-xs text-slate-500">Colonne : {kpi.sourceColumn}</p> : null}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{kpi.targetValue}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {kpi.testResult ? `${kpi.testResult.value} sur ${kpi.testResult.rowsUsed} lignes` : "Non testé"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>
                      </td>
                      <td className="px-4 py-3"><Badge>persisted: false</Badge></td>
                      <td className="px-4 py-3">
                        <Button className="h-8" onClick={() => deleteKpi(kpi.id)}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
