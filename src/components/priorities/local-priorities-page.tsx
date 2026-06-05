"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalKpiWorkspace } from "@/hooks/use-local-kpi-workspace";
import type { LocalPriorityItem, PriorityImpact, PriorityUrgency } from "@/types/local-priorities";

const urgencyLabels: Record<PriorityUrgency, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  critical: "Critique"
};

const impactLabels: Record<PriorityImpact, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Fort"
};

function urgencyVariant(urgency: PriorityUrgency) {
  if (urgency === "critical") return "danger";
  if (urgency === "high") return "warning";
  if (urgency === "medium") return "brand";
  return "default";
}

function PriorityCard({ priority }: { priority: LocalPriorityItem }) {
  return (
    <article className="rounded-md border border-line bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">#{priority.rank}</Badge>
        <Badge variant={urgencyVariant(priority.urgency)}>Urgence {urgencyLabels[priority.urgency]}</Badge>
        <Badge>Score {priority.priorityScore}/100</Badge>
        <Badge>Impact {impactLabels[priority.impact]}</Badge>
        {priority.confidenceScore !== undefined ? <Badge>Confiance {priority.confidenceScore} %</Badge> : null}
      </div>
      <h3 className="mt-3 text-base font-semibold text-ink">{priority.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{priority.summary}</p>
      <p className="mt-3 text-sm font-medium text-ink">Action suivante : {priority.recommendedNextAction}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>{priority.category}</Badge>
        {priority.sourceTypes.map((sourceType) => (
          <Badge key={`${priority.id}-${sourceType}`}>{sourceType}</Badge>
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Raisons</p>
          <ul className="mt-2 space-y-2">
            {priority.reasons.map((reason, index) => (
              <li key={`${priority.id}-reason-${index}`} className="rounded-md border border-line bg-white px-3 py-2 text-xs leading-5 text-slate-600">
                {reason}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources liées</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {priority.relatedKpiIds.length > 0 ? <Badge>{priority.relatedKpiIds.length} KPI</Badge> : null}
            {priority.relatedAlertIds.length > 0 ? <Badge>{priority.relatedAlertIds.length} alerte(s)</Badge> : null}
            {priority.relatedRecommendationIds.length > 0 ? <Badge>{priority.relatedRecommendationIds.length} recommandation(s)</Badge> : null}
            {priority.relatedActionPlanIds.length > 0 ? <Badge>{priority.relatedActionPlanIds.length} plan(s)</Badge> : null}
            {(priority.relatedGroupByInsightIds?.length ?? 0) > 0 ? <Badge>{priority.relatedGroupByInsightIds?.length} insight(s) comparatif(s)</Badge> : null}
            {(priority.relatedDatasetIds?.length ?? 0) > 0 ? <Badge>{priority.relatedDatasetIds?.length} dataset(s)</Badge> : null}
            {priority.relatedMemoryReferences.length > 0 ? <Badge>{priority.relatedMemoryReferences.length} mémoire</Badge> : null}
          </div>
          {priority.warnings.length > 0 ? (
            <div className="mt-3 space-y-2">
              {priority.warnings.map((warning, index) => (
                <p key={`${priority.id}-warning-${index}`} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function LocalPrioritiesPage() {
  const [mounted, setMounted] = useState(false);
  const { data: workspace } = useLocalKpiWorkspace();
  const priorities = workspace.priorities;
  const criticalCount = priorities.filter((priority) => priority.urgency === "critical").length;
  const highCount = priorities.filter((priority) => priority.urgency === "high").length;
  const mediumCount = priorities.filter((priority) => priority.urgency === "medium").length;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priorités Atlas</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Chargement du centre de priorisation local.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Priorités Atlas</Badge>
              <Badge>Déterministe</Badge>
              <Badge>Local</Badge>
              <Badge>Sans IA</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Ce qui mérite votre attention maintenant
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Priorisation locale construite à partir des KPI, alertes, recommandations, plans d&apos;action, impacts, feedbacks, mémoire validée et journal décisionnel.
            </p>
          </div>
          <div className="grid min-w-[260px] grid-cols-2 gap-2 text-sm">
            <div className="rounded-md border border-line bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{priorities.length}</p>
            </div>
            <div className="rounded-md border border-line bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Critiques</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{criticalCount}</p>
            </div>
            <div className="rounded-md border border-line bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Élevées</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{highCount}</p>
            </div>
            <div className="rounded-md border border-line bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Moyennes</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{mediumCount}</p>
            </div>
          </div>
        </div>
      </section>

      <Card className="border-brand-100">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Top 5 priorités</CardTitle>
            <Badge>{Math.min(5, priorities.length)} sujet(s)</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {priorities.length === 0 ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune priorité particulière détectée.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {priorities.slice(0, 5).map((priority) => (
                <PriorityCard key={priority.id} priority={priority} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Liste complète</CardTitle>
            <Badge>{priorities.length} priorité(s)</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {priorities.length === 0 ? (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune priorité particulière détectée.
            </p>
          ) : (
            <div className="space-y-4">
              {priorities.map((priority) => (
                <PriorityCard key={`full-${priority.id}`} priority={priority} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
