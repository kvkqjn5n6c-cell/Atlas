"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKpiDirection } from "@/lib/kpi-engine/local-kpi-direction";
import { generateLocalKpiAlerts, type LocalKpiAlert } from "@/lib/kpi-engine/local-kpi-alerts";
import { getLocalKpiResults } from "@/lib/local/local-kpi-results-store";
import { actionPlansMock } from "@/lib/mock/action-plans";
import { alertsMock } from "@/lib/mock/alerts";
import { dataSourcesMock } from "@/lib/mock/data-sources";
import { formatAlertSeverity, formatAlertStatus, formatAlertUrgency } from "@/lib/formatters/status-labels";
import { performanceKpisMock } from "@/lib/mock/kpis";
import { organizationsMock } from "@/lib/mock/organizations";

type AlertSeverityFilter = "all" | "warning" | "critical";
type AlertStatusFilter = "all" | "open" | "in-progress" | "resolved";
type AlertTypeFilter = "all" | "model" | "local";

type UnifiedAlert = {
  id: string;
  title: string;
  organization: string;
  severity: "info" | "warning" | "critical";
  urgency: string;
  linkedLabel: string;
  linkedHref?: string;
  cause: string;
  message?: string;
  businessImpact: string;
  executiveRisk: string;
  recommendedAction: string;
  status: "open" | "in-progress" | "resolved";
  actionPlan: string;
  type: "model" | "local";
  badges: string[];
  localAlert?: LocalKpiAlert;
};

const severityVariant = {
  info: "default",
  warning: "warning",
  critical: "danger"
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function buildModelAlerts(): UnifiedAlert[] {
  return alertsMock.map((alert) => {
    const organization = organizationsMock.find((item) => item.id === alert.organizationId);
    const kpi = performanceKpisMock.find((item) => item.id === alert.kpiId);
    const source = dataSourcesMock.find((item) => item.id === alert.sourceId);
    const action = actionPlansMock.find((item) => item.id === alert.actionPlanId);

    return {
      id: alert.id,
      title: alert.title,
      organization: organization?.name ?? "Organisation non définie",
      severity: alert.severity,
      urgency: formatAlertUrgency(alert.urgency),
      linkedLabel: kpi?.name ?? source?.name ?? "Non rattaché",
      linkedHref: kpi ? "/indicators" : source ? `/data-sources/${source.id}` : undefined,
      cause: alert.probableCause,
      message: alert.message,
      businessImpact: alert.businessImpact,
      executiveRisk: alert.executiveRisk,
      recommendedAction: alert.recommendedDecision,
      status: alert.status ?? "open",
      actionPlan: action?.title ?? "À créer",
      type: "model",
      badges: ["Alerte modèle"]
    };
  });
}

function buildLocalAlerts(localAlerts: LocalKpiAlert[]): UnifiedAlert[] {
  return localAlerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    organization: "Organisation active",
    severity: alert.severity,
    urgency: alert.severity === "critical" ? "Immédiate" : "Cette semaine",
    linkedLabel: alert.title.replace(" en zone critique", "").replace(" à surveiller", ""),
    linkedHref: "/kpi-configuration",
    cause: alert.cause,
    message: `Valeur ${alert.value}. Objectif ${alert.targetValue ?? "non défini"}. ${formatKpiDirection(alert.direction)}.`,
    businessImpact: alert.businessImpact,
    executiveRisk: "performance locale",
    recommendedAction: alert.recommendedAction,
    status: "open",
    actionPlan: "À créer depuis le KPI personnalisé",
    type: "local",
    badges: ["Alerte locale", "KPI personnalisé", "Donnée locale"],
    localAlert: alert
  }));
}

export function AlertsPage() {
  const [localAlerts, setLocalAlerts] = useState<LocalKpiAlert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<AlertStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<AlertTypeFilter>("all");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLocalAlerts(generateLocalKpiAlerts(getLocalKpiResults()));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const alerts = useMemo(() => {
    const mergedAlerts = [...buildModelAlerts(), ...buildLocalAlerts(localAlerts)];

    return mergedAlerts.filter((alert) => {
      const severityMatches = severityFilter === "all" || alert.severity === severityFilter;
      const statusMatches = statusFilter === "all" || alert.status === statusFilter;
      const typeMatches = typeFilter === "all" || alert.type === typeFilter;
      return severityMatches && statusMatches && typeMatches;
    });
  }, [localAlerts, severityFilter, statusFilter, typeFilter]);

  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const localCount = localAlerts.length;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <Badge variant="brand">Alertes</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Risques à prioriser</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Supervision des alertes générées par Atlas : alertes modèle, KPI personnalisés, données locales et actions recommandées.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Alertes affichées</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{alerts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Critiques</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Alertes locales KPI</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{localCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <label>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Criticité</span>
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value as AlertSeverityFilter)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              <option value="all">Toutes</option>
              <option value="critical">Critique</option>
              <option value="warning">À surveiller</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Statut</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AlertStatusFilter)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              <option value="all">Tous</option>
              <option value="open">Ouverte</option>
              <option value="in-progress">En cours</option>
              <option value="resolved">Résolue</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Type d&apos;alerte</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as AlertTypeFilter)}
              className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              <option value="all">Toutes</option>
              <option value="model">Alertes modèle</option>
              <option value="local">Alertes locales</option>
            </select>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alertes ouvertes et risques dirigeant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[1380px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Alerte</th>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Criticité</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">KPI / source liée</th>
                  <th className="px-4 py-3 font-medium">Cause</th>
                  <th className="px-4 py-3 font-medium">Impact métier</th>
                  <th className="px-4 py-3 font-medium">Risque dirigeant</th>
                  <th className="px-4 py-3 font-medium">Action recommandée</th>
                  <th className="px-4 py-3 font-medium">Plan lié</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="align-top transition hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink">{alert.title}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {alert.badges.map((badge) => (
                          <Badge key={badge} variant={badge === "Alerte locale" ? "brand" : "default"}>{badge}</Badge>
                        ))}
                      </div>
                      {alert.localAlert ? (
                        <p className="mt-2 text-xs text-slate-500">
                          Calculé le {formatDate(alert.localAlert.calculatedAt)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{alert.organization}</td>
                    <td className="px-4 py-4">
                      <Badge variant={severityVariant[alert.severity]}>{formatAlertSeverity(alert.severity)}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <Badge>{formatAlertStatus(alert.status)}</Badge>
                        <Badge>{alert.urgency}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {alert.linkedHref ? (
                        <Link href={alert.linkedHref} className="font-semibold text-brand-700 hover:underline">
                          {alert.linkedLabel}
                        </Link>
                      ) : (
                        alert.linkedLabel
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <p>{alert.cause}</p>
                      {alert.message ? <p className="mt-2 text-xs text-slate-500">{alert.message}</p> : null}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">{alert.businessImpact}</td>
                    <td className="px-4 py-4"><Badge variant="brand">{alert.executiveRisk}</Badge></td>
                    <td className="px-4 py-4 font-medium text-ink">{alert.recommendedAction}</td>
                    <td className="px-4 py-4 text-slate-600">{alert.actionPlan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {alerts.length === 0 ? (
            <p className="mt-4 rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune alerte ne correspond aux filtres sélectionnés.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
