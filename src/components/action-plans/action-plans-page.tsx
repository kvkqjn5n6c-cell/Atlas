import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatActionPriority, formatActionStatus } from "@/lib/formatters/status-labels";
import { actionPlansMock } from "@/lib/mock/action-plans";
import { alertsMock } from "@/lib/mock/alerts";
import { performanceKpisMock } from "@/lib/mock/kpis";
import { organizationsMock } from "@/lib/mock/organizations";

export function ActionPlansPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <Badge variant="brand">Plans d&apos;action</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Actions issues des alertes</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Prioriser les actions qui réduisent le risque, fiabilisent la donnée ou corrigent un écart
          KPI.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filtres mockés</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="brand">Statut : tous</Badge>
          <Badge>Priorité : toutes</Badge>
          <Badge>Organisation : toutes</Badge>
          <Badge>Retard uniquement : non</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plans reliés au pilotage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Alerte liée</th>
                  <th className="px-4 py-3 font-medium">KPI lié</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium">Échéance</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Priorité</th>
                  <th className="px-4 py-3 font-medium">Impact attendu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {actionPlansMock.map((action) => {
                  const organization = organizationsMock.find((item) => item.id === action.organizationId);
                  const alert = alertsMock.find((item) => item.id === action.alertId);
                  const kpi = performanceKpisMock.find((item) => item.id === action.kpiId);

                  return (
                    <tr key={action.id} className="align-top transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-ink">{action.title}</td>
                      <td className="px-4 py-4 text-slate-600">{organization?.name}</td>
                      <td className="px-4 py-4 text-slate-600">{alert?.title ?? "Non rattachée"}</td>
                      <td className="px-4 py-4 text-slate-600">{kpi?.name ?? "Non rattaché"}</td>
                      <td className="px-4 py-4 text-slate-600">{action.owner}</td>
                      <td className="px-4 py-4 text-slate-600">{action.dueDate}</td>
                      <td className="px-4 py-4"><Badge>{formatActionStatus(action.status)}</Badge></td>
                      <td className="px-4 py-4">
                        <Badge variant={action.priority === "high" ? "danger" : "warning"}>{formatActionPriority(action.priority)}</Badge>
                      </td>
                      <td className="px-4 py-4 font-medium text-ink">{action.expectedImpact}</td>
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
