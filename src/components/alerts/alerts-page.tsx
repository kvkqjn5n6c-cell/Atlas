import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { actionPlansMock } from "@/lib/mock/action-plans";
import { alertsMock } from "@/lib/mock/alerts";
import { dataSourcesMock } from "@/lib/mock/data-sources";
import { formatAlertSeverity, formatAlertStatus, formatAlertUrgency } from "@/lib/formatters/status-labels";
import { performanceKpisMock } from "@/lib/mock/kpis";
import { organizationsMock } from "@/lib/mock/organizations";

export function AlertsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <Badge variant="brand">Alertes</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Risques a prioriser</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Vue de décision : criticité, cause probable, donnée liée et action recommandée.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filtres mockés</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="brand">Organisation : toutes</Badge>
          <Badge>Criticité : toutes</Badge>
          <Badge>Statut : ouvertes</Badge>
          <Badge>Source/KPI : tous</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alertes ouvertes et risques dirigeant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[1280px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Alerte</th>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Criticité</th>
                  <th className="px-4 py-3 font-medium">Urgence</th>
                  <th className="px-4 py-3 font-medium">KPI / source liee</th>
                  <th className="px-4 py-3 font-medium">Cause probable</th>
                  <th className="px-4 py-3 font-medium">Impact métier</th>
                  <th className="px-4 py-3 font-medium">Risque dirigeant</th>
                  <th className="px-4 py-3 font-medium">Action recommandee</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Plan lie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {alertsMock.map((alert) => {
                  const organization = organizationsMock.find((item) => item.id === alert.organizationId);
                  const kpi = performanceKpisMock.find((item) => item.id === alert.kpiId);
                  const source = dataSourcesMock.find((item) => item.id === alert.sourceId);
                  const action = actionPlansMock.find((item) => item.id === alert.actionPlanId);

                  return (
                    <tr key={alert.id} className="align-top transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-ink">{alert.title}</td>
                      <td className="px-4 py-4 text-slate-600">{organization?.name}</td>
                      <td className="px-4 py-4">
                        <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>{formatAlertSeverity(alert.severity)}</Badge>
                      </td>
                      <td className="px-4 py-4"><Badge>{formatAlertUrgency(alert.urgency)}</Badge></td>
                      <td className="px-4 py-4 text-slate-600">{kpi?.name ?? source?.name ?? "Non rattaché"}</td>
                      <td className="px-4 py-4 text-slate-600">
                        <p>{alert.probableCause}</p>
                        <p className="mt-2 text-xs text-slate-500">{alert.message}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">{alert.businessImpact}</td>
                      <td className="px-4 py-4"><Badge variant="brand">{alert.executiveRisk}</Badge></td>
                      <td className="px-4 py-4 font-medium text-ink">{alert.recommendedDecision}</td>
                      <td className="px-4 py-4"><Badge>{formatAlertStatus(alert.status ?? "open")}</Badge></td>
                      <td className="px-4 py-4 text-slate-600">{action?.title ?? "A creer"}</td>
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
