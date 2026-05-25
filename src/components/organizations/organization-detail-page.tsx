import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { TechnicalModeBadge } from "@/components/admin/technical-mode-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiDataQualityBadge } from "@/components/indicators/kpi-data-quality-badge";
import { formatKpiValue } from "@/lib/business/performance";
import {
  formatActionPriority,
  formatActionStatus,
  formatAlertSeverity,
  formatAlertUrgency,
  formatKpiStatus,
  formatOrganizationStatus
} from "@/lib/formatters/status-labels";
import type { OrganizationDetailData } from "@/lib/services/organizations.service";
import type { ServiceResult } from "@/types/service-results";

function getRiskLabel(score: number) {
  if (score >= 80) return "faible";
  if (score >= 60) return "modere";
  return "eleve";
}

function isPastDue(dueDate: string) {
  const [day, month, year] = dueDate.split("/").map(Number);
  const due = new Date(year, month - 1, day).getTime();
  const today = new Date(2026, 4, 25).getTime();

  return due < today;
}

export function OrganizationDetailPage({
  result
}: {
  result: ServiceResult<OrganizationDetailData>;
}) {
  const { organization, sources, imports, kpis, alerts, actions, score, activePeriod } = result.data;
  const latestImport = imports[0];
  const activeSources = sources.filter((source) => source.status === "connected").length;
  const averageDataQuality =
    imports.length > 0
      ? Math.round(imports.reduce((total, job) => total + job.kpiCoverage, 0) / imports.length)
      : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <Link
          href="/organizations"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour organisations
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Fiche organisation</Badge>
              <Badge>{formatOrganizationStatus(organization.status)}</Badge>
              <TechnicalModeBadge result={result} />
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">{organization.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {organization.sector} - {organization.size} - Responsable : {organization.owner}
            </p>
          </div>
          <div className="rounded-lg bg-ink p-5 text-white">
            <p className="text-sm text-slate-300">Score performance global</p>
            <p className="mt-2 text-3xl font-semibold">{score}/100</p>
            <p className="mt-2 text-sm text-slate-300">Période active : {activePeriod}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Qualité des données", `${averageDataQuality}%`],
          ["Couverture KPI", `${kpis.length} suivis`],
          ["Niveau de risque", getRiskLabel(score)],
          ["Derniere synchronisation", latestImport?.finishedAt ?? "Non disponible"],
          ["Plans en retard", String(actions.filter((action) => action.status !== "done" && isPastDue(action.dueDate)).length)]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-brand-700" aria-hidden="true" />
            <CardTitle>Sources liees</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          {sources.map((source) => (
            <Link
              key={source.id}
              href={`/data-sources/${source.id}`}
              className="rounded-md border border-line bg-slate-50 p-4 transition hover:border-brand-200 hover:bg-brand-50"
            >
              <p className="font-semibold text-ink">{source.name}</p>
              <p className="mt-2 text-sm text-slate-600">
                {source.type} - {source.importedRows.toLocaleString("fr-FR")} lignes
              </p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPI lies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[900px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">KPI</th>
                  <th className="px-4 py-3 font-medium">Valeur</th>
                  <th className="px-4 py-3 font-medium">Objectif</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Tendance</th>
                  <th className="px-4 py-3 font-medium">Qualité donnée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {kpis.map((kpi) => (
                  <tr key={kpi.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-ink">{kpi.name}</td>
                    <td className="px-4 py-3 text-slate-600">{formatKpiValue(kpi)}</td>
                    <td className="px-4 py-3 text-slate-600">{kpi.target}</td>
                    <td className="px-4 py-3"><Badge>{formatKpiStatus(kpi.status)}</Badge></td>
                    <td className="px-4 py-3 text-slate-600">{kpi.trend}</td>
                    <td className="px-4 py-3"><KpiDataQualityBadge quality={kpi.dataQuality} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alertes liees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <article key={alert.id} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>{formatAlertSeverity(alert.severity)}</Badge>
                  <h3 className="font-semibold text-ink">{alert.title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">Cause probable : {alert.probableCause}</p>
                <p className="mt-2 text-sm font-medium text-slate-700">Impact : {alert.businessImpact}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{formatAlertUrgency(alert.urgency)}</Badge>
                  <Badge variant="brand">{alert.executiveRisk}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-ink">{alert.recommendedDecision}</p>
                {alert.actionPlanId ? (
                  <Link href="/action-plans" className="mt-3 inline-block text-sm font-medium text-brand-700">
                    Voir le plan d&apos;action
                  </Link>
                ) : null}
              </article>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plans d&apos;action lies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actions.map((action) => {
              const source = sources.find((item) => item.id === kpis.find((kpi) => kpi.id === action.kpiId)?.sourceId);

              return (
                <article key={action.id} className="rounded-md border border-line bg-white p-4">
                  <Badge variant={action.priority === "high" ? "danger" : "warning"}>{formatActionPriority(action.priority)}</Badge>
                  <h3 className="mt-3 font-semibold text-ink">{action.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {action.owner} - {action.dueDate} - {formatActionStatus(action.status)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">{action.expectedImpact}</p>
                  <p className="mt-2 text-xs text-slate-500">Source associée : {source?.name ?? "Non rattachée"}</p>
                </article>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
