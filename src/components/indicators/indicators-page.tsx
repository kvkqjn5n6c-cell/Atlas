import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKpiValue } from "@/lib/business/performance";
import { organizationsMock } from "@/lib/mock/organizations";
import { dataSourcesMock } from "@/lib/mock/data-sources";
import { performanceKpisMock } from "@/lib/mock/kpis";
import { KpiDataQualityBadge } from "./kpi-data-quality-badge";

export function IndicatorsPage() {
  const categories = Array.from(new Set(performanceKpisMock.map((kpi) => kpi.category)));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <Badge variant="brand">Indicateurs</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">KPI de performance</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Lecture structurée des indicateurs : performance, écart à l&apos;objectif, qualité de la
          donnée et source principale.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filtres mockés</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="brand">Organisation : toutes</Badge>
          <Badge>Catégorie : {categories.join(", ")}</Badge>
          <Badge>Statut : tous</Badge>
          <Badge>Qualité donnée : toutes</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indicateurs suivis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="px-4 py-3 font-medium">KPI</th>
                  <th className="px-4 py-3 font-medium">Valeur</th>
                  <th className="px-4 py-3 font-medium">Objectif</th>
                  <th className="px-4 py-3 font-medium">Écart</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Tendance</th>
                  <th className="px-4 py-3 font-medium">Qualité donnée</th>
                  <th className="px-4 py-3 font-medium">Mise à jour</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {performanceKpisMock.map((kpi) => {
                  const organization = organizationsMock.find((item) => item.id === kpi.organizationId);
                  const source = dataSourcesMock.find((item) => item.id === kpi.sourceId);

                  return (
                    <tr key={kpi.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-ink">{organization?.name}</td>
                      <td className="px-4 py-3 text-slate-600">{kpi.category}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{kpi.name}</td>
                      <td className="px-4 py-3 text-slate-600">{formatKpiValue(kpi)}</td>
                      <td className="px-4 py-3 text-slate-600">{kpi.target}</td>
                      <td className="px-4 py-3 text-slate-600">{kpi.deviation}%</td>
                      <td className="px-4 py-3"><Badge>{kpi.status}</Badge></td>
                      <td className="px-4 py-3 text-slate-600">{kpi.trend}</td>
                      <td className="px-4 py-3"><KpiDataQualityBadge quality={kpi.dataQuality} /></td>
                      <td className="px-4 py-3 text-slate-600">{kpi.lastUpdated}</td>
                      <td className="px-4 py-3 text-slate-600">{source?.name ?? "Non rattachée"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
