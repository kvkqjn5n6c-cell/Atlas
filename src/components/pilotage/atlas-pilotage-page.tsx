import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Compass,
  ListTodo,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiDataQualityBadge } from "@/components/indicators/kpi-data-quality-badge";
import { Progress } from "@/components/ui/progress";
import { LocalKpiPilotageSection } from "@/components/pilotage/local-kpi-pilotage-section";
import {
  calculatePerformanceScore,
  formatKpiValue,
  splitKpisByPriority
} from "@/lib/business/performance";
import { generateExecutiveSummary } from "@/lib/business/insights/generate-executive-summary";
import { generateOperationalInsights } from "@/lib/business/insights/generate-operational-insights";
import { generateRiskInsights } from "@/lib/business/insights/generate-risk-insights";
import {
  formatActionPriority,
  formatAlertSeverity,
  formatDataQuality,
  formatKpiStatus
} from "@/lib/formatters/status-labels";
import { actionPlansMock } from "@/lib/mock/action-plans";
import { alertsMock } from "@/lib/mock/alerts";
import { getDataMode } from "@/lib/config/data-mode";
import { activeOrganization } from "@/lib/mock/organizations";
import { performanceKpisMock } from "@/lib/mock/kpis";
import { reportsMock } from "@/lib/mock/reports";
import {
  executiveVerdictMock,
  globalTrendsMock,
  sevenDayPrioritiesMock
} from "@/lib/mock/pilotage";
import type { Alert, KPITrend, PerformanceKPI, PerformanceTrend } from "@/types/atlas";

const trendIcons: Record<KPITrend, typeof ArrowUpRight> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  stable: ArrowRight
};

function KpiStatusBadge({ status }: { status: PerformanceKPI["status"] }) {
  const config = {
    healthy: { variant: "success" },
    watch: { variant: "warning" },
    critical: { variant: "danger" }
  } as const;

  return <Badge variant={config[status].variant}>{formatKpiStatus(status)}</Badge>;
}

function KpiCard({ kpi }: { kpi: PerformanceKPI }) {
  const Icon = trendIcons[kpi.trend];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{kpi.name}</p>
            <p className="mt-3 text-2xl font-semibold text-ink">{formatKpiValue(kpi)}</p>
          </div>
          <KpiStatusBadge status={kpi.status} />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Icon className="h-4 w-4" aria-hidden="true" />
          Écart objectif : {kpi.deviation}%
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Qualité donnée
          </span>
          <KpiDataQualityBadge quality={kpi.dataQuality} />
        </div>
        <p className="mt-3 text-sm leading-5 text-slate-600">{kpi.insight}</p>
      </CardContent>
    </Card>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const variant = alert.severity === "critical" ? "danger" : "warning";

  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-white p-2 text-rose-600">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{alert.title}</h3>
            <Badge variant={variant}>{formatAlertSeverity(alert.severity)}</Badge>
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-600">{alert.message}</p>
          <p className="mt-2 text-sm leading-5 text-slate-600">
            Cause probable : {alert.probableCause}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700">Impact : {alert.businessImpact}</p>
          <p className="mt-3 text-sm font-medium text-ink">{alert.recommendedDecision}</p>
        </div>
      </div>
    </article>
  );
}

function GlobalTrendCard({ trend }: { trend: PerformanceTrend }) {
  const variant = trend.trend === "hausse" ? "success" : trend.trend === "baisse" ? "danger" : "warning";
  const maxPoint = Math.max(...trend.points);

  return (
    <article className="rounded-md border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{trend.label}</p>
          <p className="mt-1 text-xl font-semibold text-ink">{trend.value}</p>
        </div>
        <Badge variant={variant}>{trend.trend}</Badge>
      </div>
      <div className="mt-4 flex h-10 items-end gap-1">
        {trend.points.map((point, index) => (
          <span
            key={`${trend.axis}-${index}`}
            className="flex-1 rounded-t bg-brand-200"
            style={{ height: `${Math.max(18, (point / maxPoint) * 100)}%` }}
          />
        ))}
      </div>
      <p className="mt-3 text-sm leading-5 text-slate-600">{trend.insight}</p>
    </article>
  );
}

export function AtlasPilotagePage() {
  const dataMode = getDataMode();
  const score = calculatePerformanceScore(performanceKpisMock, alertsMock);
  const kpis = splitKpisByPriority(performanceKpisMock);
  const executiveSummary = generateExecutiveSummary(performanceKpisMock, alertsMock, reportsMock);
  const operationalInsights = generateOperationalInsights(performanceKpisMock, alertsMock);
  const riskInsights = generateRiskInsights(performanceKpisMock, alertsMock);
  const immediateRisks = riskInsights.filter((risk) => risk.severity === "critical");
  const thisWeekActions = actionPlansMock.filter((action) => action.priority === "high");
  const monitoringKpis = performanceKpisMock.filter((kpi) => kpi.dataQuality !== "reliable" || kpi.status === "watch");

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">Pilotage Atlas</Badge>
            <Badge>{dataMode === "prisma" ? "Mode Prisma" : "Mode local"}</Badge>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            {activeOrganization.name}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Cockpit de performance PME : écarts aux objectifs, tendances, alertes prioritaires,
            recommandations déterministes et plan d&apos;action court terme.
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Lecture déterministe et explicable. Module Atlas IA non activé.
          </p>
        </div>

        <Card className="bg-ink text-white">
          <CardContent className="p-5">
            <p className="text-sm text-slate-300">Score performance global</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-semibold">{score}</span>
              <span className="pb-1 text-sm text-slate-300">/100</span>
            </div>
            <Progress value={score} className="mt-5 bg-white/15" indicatorClassName="bg-brand-500" />
            <p className="mt-4 text-sm text-slate-300">
              Calculé depuis KPI critiques, KPI à surveiller et alertes actives.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-brand-100 bg-brand-50">
        <CardContent className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <Badge variant="brand">Resume executif</Badge>
            <h3 className="mt-3 text-xl font-semibold text-ink">Ce que le dirigeant doit retenir</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">{executiveSummary.situation}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Risques principaux</p>
                <p className="mt-2 text-sm font-semibold text-ink">{executiveSummary.mainRisks[0]}</p>
              </div>
              <div className="rounded-md bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Zone stable</p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {executiveSummary.stableZones[0] ?? "Activite recurrente maintenue"}
                </p>
              </div>
              <div className="rounded-md bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Priorité immédiate</p>
                <p className="mt-2 text-sm font-semibold text-ink">{executiveSummary.immediatePriorities[0]}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-5">
            <p className="text-sm text-slate-500">Fiabilité des données</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{executiveSummary.dataReliabilityScore}%</p>
            <Progress value={executiveSummary.dataReliabilityScore} className="mt-4" />
            <p className="mt-3 text-sm leading-5 text-slate-600">
              Score calculé depuis la qualité donnée des KPI. Les écarts peuvent venir de la performance ou de données incomplètes.
            </p>
          </div>
        </CardContent>
      </Card>

      <LocalKpiPilotageSection baseScore={score} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-brand-700" aria-hidden="true" />
              <CardTitle>Verdict dirigeant</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <Badge variant={executiveVerdictMock.status === "critical" ? "danger" : "warning"}>
                {executiveVerdictMock.status === "critical" ? "Critique" : "À surveiller"}
              </Badge>
              <h3 className="text-base font-semibold text-ink">{executiveVerdictMock.title}</h3>
            </div>
            <p className="text-sm leading-6 text-slate-600">{executiveVerdictMock.summary}</p>
            <div className="rounded-md border border-brand-100 bg-brand-50 p-4 text-sm font-medium text-brand-700">
              {executiveVerdictMock.decisionFocus}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendance globale</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {globalTrendsMock.map((trend) => (
              <GlobalTrendCard key={trend.axis} trend={trend} />
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Lecture opérationnelle</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 xl:grid-cols-3">
          {operationalInsights.map((insight) => (
            <article key={insight.id} className="rounded-md border border-line bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">{insight.title}</h3>
                <Badge variant={insight.severity === "critical" ? "danger" : insight.severity === "watch" ? "warning" : "success"}>
                  {insight.severity === "critical" ? "Critique" : insight.severity === "watch" ? "À surveiller" : "Stable"}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">Ce qui se passe : {insight.whatHappens}</p>
              <p className="mt-2 text-sm text-slate-600">Pourquoi : {insight.why}</p>
              <p className="mt-2 text-sm font-medium text-slate-700">Impact : {insight.impact}</p>
              <p className="mt-3 text-sm font-semibold text-ink">{insight.recommendedAction}</p>
            </article>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        {performanceKpisMock.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Alertes prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsMock.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Compass className="h-5 w-5 text-brand-700" aria-hidden="true" />
              <CardTitle>Décisions recommandées</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {executiveSummary.immediatePriorities.map((priority) => (
              <p key={priority} className="rounded-md border border-line bg-slate-50 p-3 text-sm font-medium text-ink">
                {priority}
              </p>
            ))}
            <div className="rounded-md border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700">
              Recommandations deterministes. Atlas IA sera ajoute plus tard.
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Priorités dirigeant</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-rose-100 bg-rose-50 p-4">
            <Badge variant="danger">immediat</Badge>
            <div className="mt-3 space-y-2">
              {immediateRisks.map((risk) => (
                <p key={risk.id} className="text-sm font-medium text-ink">{risk.nextDecision}</p>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
            <Badge variant="warning">Cette semaine</Badge>
            <div className="mt-3 space-y-2">
              {thisWeekActions.map((action) => (
                <p key={action.id} className="text-sm font-medium text-ink">{action.title}</p>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-line bg-slate-50 p-4">
            <Badge>surveillance</Badge>
            <div className="mt-3 space-y-2">
              {monitoringKpis.slice(0, 3).map((kpi) => (
                <p key={kpi.id} className="text-sm font-medium text-ink">{kpi.name} - {formatDataQuality(kpi.dataQuality)}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ListTodo className="h-5 w-5 text-brand-700" aria-hidden="true" />
            <CardTitle>Priorités 7 jours</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Priorité</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Impact</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium">Échéance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {sevenDayPrioritiesMock.map((priority) => (
                  <tr key={priority.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Badge variant={priority.priority === "haute" ? "danger" : "warning"}>
                        {priority.priority === "haute" ? "Haute" : priority.priority === "moyenne" ? "Moyenne" : "Basse"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{priority.title}</td>
                    <td className="px-4 py-3 text-slate-600">{priority.impact}</td>
                    <td className="px-4 py-3 text-slate-600">{priority.owner}</td>
                    <td className="px-4 py-3 text-slate-600">{priority.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan d&apos;action court terme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-3">
            {actionPlansMock.map((action) => (
              <article key={action.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <Badge variant={action.priority === "high" ? "danger" : "warning"}>
                  {formatActionPriority(action.priority)}
                </Badge>
                <h3 className="mt-3 text-sm font-semibold text-ink">{action.title}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {action.owner} - {action.dueDate}
                </p>
                <p className="mt-3 text-sm font-medium text-ink">{action.expectedImpact}</p>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">KPI critiques</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{kpis.critical.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">KPI à surveiller</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{kpis.watch.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">KPI sains</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{kpis.healthy.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
