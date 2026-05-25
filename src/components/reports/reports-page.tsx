import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatReportStatus } from "@/lib/formatters/status-labels";
import { organizationsMock } from "@/lib/mock/organizations";
import { reportsMock } from "@/lib/mock/reports";

const reportTypeLabel = {
  monthly: "mensuel",
  alert: "alerte",
  summary: "synthèse"
} as const;

export function ReportsPage() {
  const latestReadyReport = reportsMock.find((report) => report.status === "ready");

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <Badge variant="brand">Rapports</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Rapports de pilotage</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Rapports reliés aux KPI, alertes et scores pour présenter une lecture dirigeant claire.
        </p>
      </section>

      {latestReadyReport ? (
        <Card className="border-brand-100 bg-brand-50">
          <CardContent className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <Badge variant="brand">Livrable dirigeant</Badge>
              <h3 className="mt-3 text-xl font-semibold text-ink">{latestReadyReport.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{latestReadyReport.executiveSummary}</p>
              <p className="mt-4 rounded-md bg-white p-4 text-sm font-semibold text-ink">
                {latestReadyReport.directionSummary}
              </p>
            </div>
            <div className="rounded-lg bg-white p-5">
              <p className="text-sm text-slate-500">Fiabilité donnée du rapport</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{latestReadyReport.dataReliabilityScore}%</p>
              <p className="mt-3 text-sm leading-5 text-slate-600">
                Les données peu fiables sont explicitées pour séparer risque métier et risque de donnée.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Rapports prets</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {reportsMock.filter((report) => report.status === "ready").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">KPI critiques couverts</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {reportsMock.reduce((total, report) => total + report.criticalKpiCount, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Alertes expliquees</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {reportsMock.reduce((total, report) => total + report.alertCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapports disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[1300px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Rapport</th>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Période</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">KPI critiques</th>
                  <th className="px-4 py-3 font-medium">Alertes</th>
                  <th className="px-4 py-3 font-medium">Risques principaux</th>
                  <th className="px-4 py-3 font-medium">Donnees peu fiables</th>
                  <th className="px-4 py-3 font-medium">Actions prioritaires</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Generation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {reportsMock.map((report) => {
                  const organization = organizationsMock.find((item) => item.id === report.organizationId);

                  return (
                    <tr key={report.id} className="align-top transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{report.title}</p>
                        <p className="mt-2 max-w-sm text-sm leading-5 text-slate-600">{report.mainInsight}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{organization?.name}</td>
                      <td className="px-4 py-4 text-slate-600">{report.period}</td>
                      <td className="px-4 py-4"><Badge>{reportTypeLabel[report.type]}</Badge></td>
                      <td className="px-4 py-4 font-semibold text-ink">{report.globalScore}/100</td>
                      <td className="px-4 py-4 text-slate-600">{report.criticalKpiCount}</td>
                      <td className="px-4 py-4 text-slate-600">{report.alertCount}</td>
                      <td className="px-4 py-4 text-slate-600">{report.keyRisks.join(", ")}</td>
                      <td className="px-4 py-4 text-slate-600">{report.unreliableData.join(", ")}</td>
                      <td className="px-4 py-4 font-medium text-ink">{report.priorityActions.join(", ")}</td>
                      <td className="px-4 py-4"><Badge variant={report.status === "ready" ? "success" : "warning"}>{formatReportStatus(report.status)}</Badge></td>
                      <td className="px-4 py-4 text-slate-600">{report.generatedAt}</td>
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
