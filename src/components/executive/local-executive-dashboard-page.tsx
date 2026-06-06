"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocalKpiWorkspace } from "@/hooks/use-local-kpi-workspace";
import type { ExecutiveDashboardCard, ExecutiveDatasetSignal, ExecutiveGlobalStatus } from "@/types/local-executive-dashboard";
import type { ConfidenceLevel } from "@/types/recommendation-confidence";

const statusLabels: Record<ExecutiveGlobalStatus, string> = {
  healthy: "Situation maîtrisée",
  watch: "À surveiller",
  critical: "Critique"
};

const statusVariants: Record<ExecutiveGlobalStatus, "success" | "warning" | "danger"> = {
  healthy: "success",
  watch: "warning",
  critical: "danger"
};

const confidenceLabels: Record<ConfidenceLevel, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  very_high: "Très élevée"
};

function ExecutiveCardList({
  title,
  emptyLabel,
  cards
}: {
  title: string;
  emptyLabel: string;
  cards: ExecutiveDashboardCard[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <Badge>{cards.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {cards.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">{emptyLabel}</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {cards.map((card, index) => (
              <article key={`${title}-${card.title}-${index}`} className="rounded-md border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariants[card.status]}>{statusLabels[card.status]}</Badge>
                  {card.score !== undefined ? <Badge>Score {card.score}/100</Badge> : null}
                  {card.sourceIds.length > 0 ? <Badge>{card.sourceIds.length} source(s)</Badge> : null}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.summary}</p>
                {card.actionLabel ? <p className="mt-3 text-sm font-medium text-ink">{card.actionLabel}</p> : null}
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SimpleListCard({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <Badge>{items.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">{emptyLabel}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={`${title}-${index}-${item}`} className="rounded-md border border-line bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DatasetDecisionFlowCard({ signals, flow }: { signals: ExecutiveDatasetSignal[]; flow: string[] }) {
  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Décisions issues des données</CardTitle>
          <Badge variant="brand">Dataset → Analyse → Action</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Lecture synthétique des signaux issus des Datasets Atlas et des analyses comparatives.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {signals.map((signal) => (
            <div key={signal.label} className="rounded-md border border-line bg-slate-50 p-3">
              <Badge variant={statusVariants[signal.status]}>{signal.label}</Badge>
              <p className="mt-2 text-2xl font-semibold text-ink">{signal.value}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{signal.summary}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2 md:grid-cols-5">
          {flow.map((item, index) => (
            <div key={`dataset-flow-${index}-${item}`} className="rounded-md border border-brand-100 bg-brand-50 p-3 text-xs leading-5 text-brand-800">
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function LocalExecutiveDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { data: workspace } = useLocalKpiWorkspace();
  const dashboard = workspace.executiveDashboard;
  const hasLocalData =
    workspace.results.length > 0 ||
    workspace.alerts.length > 0 ||
    workspace.recommendations.length > 0 ||
    workspace.priorities.length > 0 ||
    workspace.actionPlans.length > 0 ||
    workspace.datasets.length > 0 ||
    workspace.datasetGroupByAnalyses.length > 0 ||
    workspace.datasetGroupByInsights.length > 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard dirigeant</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Chargement de la lecture exécutive locale.</p>
        </CardHeader>
      </Card>
    );
  }

  if (!hasLocalData) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">Dashboard dirigeant</Badge>
            <Badge>Local</Badge>
            <Badge>Sans IA</Badge>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Aucune donnée locale suffisante</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Importez un CSV, créez un KPI local, validez des connaissances dans Atlas Memory ou transformez une recommandation en plan d&apos;action pour alimenter cette lecture exécutive.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700" href="/data-sources">
              Importer des données
            </Link>
            <Link className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" href="/atlas-memory">
              Valider la mémoire
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Dashboard dirigeant</Badge>
              <Badge variant={statusVariants[dashboard.globalStatus]}>{statusLabels[dashboard.globalStatus]}</Badge>
              <Badge>Confiance Atlas {confidenceLabels[dashboard.confidenceLevel]}</Badge>
              <Badge>Déterministe</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Lecture exécutive de la situation
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Vue consolidée des priorités, risques, recommandations, plans d&apos;action, impacts, décisions récentes et signaux mémoire. Elle complète le cockpit sans le remplacer.
            </p>
          </div>
          <div className="min-w-[260px] rounded-md border border-line bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Score exécutif</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-semibold text-ink">{dashboard.globalScore}</span>
              <span className="pb-1 text-sm text-slate-500">/100</span>
            </div>
            <Progress value={dashboard.globalScore} className="mt-4" />
            <p className="mt-3 text-xs leading-5 text-slate-600">
              Score local borné, influencé par les priorités, alertes, impacts, plans actifs et niveaux de confiance.
            </p>
          </div>
        </div>
      </section>

      <ExecutiveCardList
        title="À traiter en priorité"
        emptyLabel="Aucune priorité particulière détectée."
        cards={dashboard.topPriorities}
      />

      <DatasetDecisionFlowCard
        signals={dashboard.datasetSignals ?? []}
        flow={dashboard.datasetDecisionFlow ?? []}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ExecutiveCardList
          title="Risques à surveiller"
          emptyLabel="Aucun risque critique local détecté."
          cards={dashboard.criticalRisks}
        />
        <ExecutiveCardList
          title="Signaux comparatifs Dataset"
          emptyLabel="Aucun signal comparatif Dataset disponible."
          cards={dashboard.comparativeSignals ?? []}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ExecutiveCardList
          title="Recommandations clés"
          emptyLabel="Aucune recommandation prioritaire disponible."
          cards={dashboard.keyRecommendations}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ExecutiveCardList
          title="Actions en cours"
          emptyLabel="Aucun plan d'action local actif."
          cards={dashboard.activeActionPlans}
        />
        <ExecutiveCardList
          title="Impacts récents"
          emptyLabel="Aucun impact mesuré récemment."
          cards={dashboard.recentImpacts}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ExecutiveCardList
          title="Décisions récentes"
          emptyLabel="Aucun événement décisionnel récent."
          cards={dashboard.recentDecisions}
        />
        <ExecutiveCardList
          title="Mémoire Atlas mobilisée"
          emptyLabel="Aucune connaissance validée mobilisée."
          cards={dashboard.memorySignals}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SimpleListCard
          title="Prochaines meilleures actions"
          emptyLabel="Aucune action suivante prioritaire."
          items={dashboard.nextBestActions}
        />
        <SimpleListCard
          title="Notes de fiabilité"
          emptyLabel="Aucune limite de fiabilité particulière."
          items={dashboard.dataReliabilityNotes}
        />
      </div>
    </div>
  );
}
