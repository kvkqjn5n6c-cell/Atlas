import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataSourcesMock } from "@/lib/mock/data-sources";
import { kpiConfigurationsMock } from "@/lib/mock/kpi-configurations";
import { organizationsMock } from "@/lib/mock/organizations";

const frequencyLabels = {
  daily: "Quotidienne",
  weekly: "Hebdomadaire",
  monthly: "Mensuelle"
} as const;

export function KpiCatalogTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Catalogue KPI configurés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">KPI</th>
                <th className="px-4 py-3 font-medium">Organisation</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Source principale</th>
                <th className="px-4 py-3 font-medium">Type de calcul</th>
                <th className="px-4 py-3 font-medium">Objectif</th>
                <th className="px-4 py-3 font-medium">Seuil alerte</th>
                <th className="px-4 py-3 font-medium">Seuil critique</th>
                <th className="px-4 py-3 font-medium">Fréquence</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {kpiConfigurationsMock.map((config) => {
                const organization = organizationsMock.find((item) => item.id === config.organizationId);
                const source = dataSourcesMock.find((item) => item.id === config.sourceId);

                return (
                  <tr key={config.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-ink">{config.name}</td>
                    <td className="px-4 py-3 text-slate-600">{organization?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{config.category}</td>
                    <td className="px-4 py-3 text-slate-600">{source?.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{config.formula}</td>
                    <td className="px-4 py-3 text-slate-600">{config.target}</td>
                    <td className="px-4 py-3 text-slate-600">{config.alertThreshold}</td>
                    <td className="px-4 py-3 text-slate-600">{config.criticalThreshold}</td>
                    <td className="px-4 py-3 text-slate-600">{frequencyLabels[config.frequency]}</td>
                    <td className="px-4 py-3">
                      <Badge variant={config.isActive ? "success" : "default"}>
                        {config.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
