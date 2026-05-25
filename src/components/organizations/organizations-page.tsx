import Link from "next/link";
import { TechnicalModeBadge } from "@/components/admin/technical-mode-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrganizationsData } from "@/lib/services/organizations.service";
import type { ServiceResult } from "@/types/service-results";

export function OrganizationsPage({ result }: { result: ServiceResult<OrganizationsData> }) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">Organisations</Badge>
          <TechnicalModeBadge result={result} />
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Portefeuille pilote</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Vue admin des organisations suivies par Atlas, avec score, données actives, KPI et
          alertes ouvertes.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Organisations suivies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Secteur</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Sources</th>
                  <th className="px-4 py-3 font-medium">Alertes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {result.data.organizations.map((summary) => {
                  const { organization } = summary;
                  return (
                    <tr key={organization.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/organizations/${organization.id}`}
                          className="font-semibold text-ink underline-offset-4 hover:text-brand-700 hover:underline"
                        >
                          {organization.name}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">{organization.activePeriod}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{organization.sector}</td>
                      <td className="px-4 py-4 text-slate-600">{organization.owner}</td>
                      <td className="px-4 py-4 font-semibold text-ink">{summary.score}/100</td>
                      <td className="px-4 py-4 text-slate-600">{summary.sourcesCount}</td>
                      <td className="px-4 py-4">
                        <Badge variant={summary.hasCriticalAlert ? "danger" : "warning"}>
                          {summary.alertsCount} ouvertes
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
    </div>
  );
}
