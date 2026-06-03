"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalKpiWorkspace } from "@/hooks/use-local-kpi-workspace";
import { measureActionPlanImpact } from "@/lib/action-plans/local-action-plan-impact-engine";
import {
  deleteLocalActionPlanAction,
  saveDecisionJournalEntryAction,
  updateLocalActionPlanAction
} from "@/lib/actions/decision-engine-persistence-actions";
import { formatActionPriority, formatActionStatus } from "@/lib/formatters/status-labels";
import { recordActionPlanUpdated, recordImpactMeasured } from "@/lib/journal/decision-journal-engine";
import { getLocalActionPlanImpacts, saveLocalActionPlanImpact } from "@/lib/local/local-action-plan-impact-store";
import { deleteLocalActionPlan, getLocalActionPlans, updateLocalActionPlan } from "@/lib/local/local-action-plans-store";
import { actionPlansMock } from "@/lib/mock/action-plans";
import { alertsMock } from "@/lib/mock/alerts";
import { performanceKpisMock } from "@/lib/mock/kpis";
import { organizationsMock } from "@/lib/mock/organizations";
import type { LocalActionPlan, LocalActionPlanStatus } from "@/types/local-action-plans";
import type { ImpactStatus, LocalActionPlanImpact } from "@/types/local-action-plan-impact";

const localStatusLabels: Record<LocalActionPlanStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminé",
  cancelled: "Annulé"
};

const localPriorityLabels: Record<LocalActionPlan["priority"], string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  critical: "Critique"
};

const impactStatusLabels: Record<ImpactStatus, string> = {
  not_measurable: "Non mesurable",
  pending: "En attente",
  positive: "Impact positif",
  neutral: "Impact neutre",
  negative: "Impact négatif"
};

type BadgeVariant = "default" | "success" | "warning" | "danger" | "brand";

function statusVariant(status: LocalActionPlanStatus): BadgeVariant {
  if (status === "done") return "success";
  if (status === "in_progress") return "warning";
  if (status === "cancelled") return "default";
  return "brand";
}

function priorityVariant(priority: LocalActionPlan["priority"]): BadgeVariant {
  if (priority === "critical") return "danger";
  if (priority === "high") return "warning";
  return "default";
}

function impactVariant(status: ImpactStatus): BadgeVariant {
  if (status === "positive") return "success";
  if (status === "negative") return "danger";
  if (status === "pending") return "warning";
  return "default";
}

function formatVariationValue(value?: number) {
  if (value === undefined) return "Non disponible";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function nextStatus(status: LocalActionPlanStatus): LocalActionPlanStatus {
  if (status === "todo") return "in_progress";
  if (status === "in_progress") return "done";
  return status;
}

function LocalActionPlansSection() {
  const [mounted, setMounted] = useState(false);
  const [plans, setPlans] = useState<LocalActionPlan[]>([]);
  const [impacts, setImpacts] = useState<LocalActionPlanImpact[]>([]);
  const { data: workspace, refresh: refreshWorkspace } = useLocalKpiWorkspace();

  function refresh() {
    setPlans(getLocalActionPlans());
    setImpacts(getLocalActionPlanImpacts());
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);
      refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function updateStatus(plan: LocalActionPlan, status: LocalActionPlanStatus) {
    const updatedPlan = updateLocalActionPlan({ ...plan, status });
    const journalEntry = recordActionPlanUpdated(updatedPlan, `Statut passé à ${localStatusLabels[status]}.`);
    void updateLocalActionPlanAction(updatedPlan);
    void saveDecisionJournalEntryAction({ organizationId: updatedPlan.organizationId, entry: journalEntry });
    refresh();
  }

  function markTaskDone(plan: LocalActionPlan, taskId: string) {
    const updatedPlan = updateLocalActionPlan({
      ...plan,
      actions: plan.actions.map((task) => task.id === taskId ? { ...task, status: "done" } : task)
    });
    const journalEntry = recordActionPlanUpdated(updatedPlan, "Une tâche du plan a été marquée comme terminée.");
    void updateLocalActionPlanAction(updatedPlan);
    void saveDecisionJournalEntryAction({ organizationId: updatedPlan.organizationId, entry: journalEntry });
    refresh();
  }

  function deletePlan(id: string) {
    deleteLocalActionPlan(id);
    void deleteLocalActionPlanAction(id);
    refresh();
  }

  function measureImpact(plan: LocalActionPlan) {
    const measuredImpacts = measureActionPlanImpact(plan, workspace.history, workspace.results);
    measuredImpacts.forEach((impact) => {
      const savedImpact = saveLocalActionPlanImpact(impact);
      const journalEntry = recordImpactMeasured(savedImpact);
      void saveDecisionJournalEntryAction({ organizationId: plan.organizationId, entry: journalEntry });
    });
    refresh();
    refreshWorkspace();
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plans locaux issus des recommandations Atlas</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Chargement des plans locaux.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Plans locaux issus des recommandations Atlas</CardTitle>
          <Badge variant="brand">Local</Badge>
          <Badge>Non persisté</Badge>
          <Badge>{plans.length} plan(s)</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Aucun plan local pour l&apos;instant. Créez un plan depuis une recommandation dans Pilotage ou Rapports.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {plans.map((plan) => (
              <article key={plan.id} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">Plan local</Badge>
                  <Badge variant="success">Depuis recommandation Atlas</Badge>
                  <Badge variant={priorityVariant(plan.priority)}>{localPriorityLabels[plan.priority]}</Badge>
                  <Badge variant={statusVariant(plan.status)}>{localStatusLabels[plan.status]}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-ink">{plan.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{plan.description}</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p>Propriétaire : <span className="font-medium text-ink">{plan.owner}</span></p>
                  <p>Échéance : <span className="font-medium text-ink">{plan.dueDate ?? "À définir"}</span></p>
                  <p>KPI liés : <span className="font-medium text-ink">{plan.relatedKpiIds.length}</span></p>
                  <p>Impact : <span className="font-medium text-ink">{plan.expectedImpact}</span></p>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tâches</p>
                  {plan.actions.map((task) => (
                    <div key={task.id} className="rounded-md border border-line bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink">{task.label}</p>
                        <Badge variant={statusVariant(task.status)}>{localStatusLabels[task.status]}</Badge>
                      </div>
                      {task.description ? <p className="mt-1 text-xs leading-5 text-slate-600">{task.description}</p> : null}
                      {task.status !== "done" ? (
                        <Button className="mt-3" onClick={() => markTaskDone(plan, task.id)}>
                          Marquer terminée
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-md border border-brand-100 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">Impact mesuré</p>
                    <Button onClick={() => measureImpact(plan)}>Mesurer l&apos;impact</Button>
                  </div>
                  {(impacts.filter((impact) => impact.actionPlanId === plan.id)).length === 0 ? (
                    <p className="mt-3 text-sm text-slate-600">
                      Aucune mesure locale pour ce plan. Lancez une mesure après un nouveau point KPI.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {impacts.filter((impact) => impact.actionPlanId === plan.id).map((impact) => (
                        <div key={impact.id} className="rounded-md border border-line bg-slate-50 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={impactVariant(impact.status)}>{impactStatusLabels[impact.status]}</Badge>
                            <Badge>KPI {impact.relatedKpiId}</Badge>
                            <Badge>{formatVariationValue(impact.variation)}</Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{impact.interpretation}</p>
                          <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                            <p>Avant : {impact.beforeValue ?? "N/A"}</p>
                            <p>Après : {impact.afterValue ?? "N/A"}</p>
                            <p>Mesure : {new Date(impact.measuredAt).toLocaleDateString("fr-FR")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {plan.status !== "done" && plan.status !== "cancelled" ? (
                    <Button onClick={() => updateStatus(plan, nextStatus(plan.status))}>
                      Passer à {localStatusLabels[nextStatus(plan.status)]}
                    </Button>
                  ) : null}
                  <Button variant="ghost" onClick={() => deletePlan(plan.id)}>
                    Supprimer
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ActionPlansPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <Badge variant="brand">Plans d&apos;action</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Actions issues des alertes et recommandations</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Prioriser les actions qui réduisent le risque, fiabilisent la donnée ou corrigent un écart KPI. Les plans locaux complètent les plans modèles sans persistance réelle.
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

      <LocalActionPlansSection />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Plans modèles reliés au pilotage</CardTitle>
            <Badge>Plan modèle</Badge>
          </div>
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
