"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCopy,
  Database,
  FileText,
  Gauge,
  ListChecks,
  Presentation,
  ShieldAlert,
  Target,
  TrendingDown,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  demoAtlasScenario,
  generateDemoAtlasMarkdown,
  type DemoAtlasMetric,
  type DemoAtlasScenario,
  type DemoAtlasSeverity,
  type DemoAtlasStep
} from "@/lib/mock/demo-atlas-scenario";

const stepIcons = [Users, TrendingDown, ShieldAlert, Database, Target, CheckCircle2, ListChecks, BarChart3, Gauge, Presentation, FileText];

const metricVariant: Record<DemoAtlasSeverity, "success" | "warning" | "danger"> = {
  stable: "success",
  watch: "warning",
  critical: "danger"
};

const metricLabels: Record<DemoAtlasSeverity, string> = {
  stable: "Stable",
  watch: "À surveiller",
  critical: "Critique"
};

function MetricCard({ metric }: { metric: DemoAtlasMetric }) {
  return (
    <article className="rounded-md border border-line bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={metricVariant[metric.status]}>{metricLabels[metric.status]}</Badge>
      </div>
      <p className="mt-3 text-sm text-slate-500">{metric.label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{metric.value}</p>
      <p className="mt-2 text-sm text-slate-600">{metric.trend}</p>
    </article>
  );
}

function StepEvidence({ step }: { step: DemoAtlasStep }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{step.cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {step.cardItems.map((item, index) => (
          <div key={`${step.id}-card-${index}-${item}`} className="rounded-md border border-line bg-slate-50 p-3 text-sm font-medium text-ink">
            {item}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CurrentStepCard({ step }: { step: DemoAtlasStep }) {
  const Icon = stepIcons[step.order - 1] ?? Target;

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">Étape {step.order}</Badge>
          <Badge>Parcours guidé</Badge>
        </div>
        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">{step.title}</CardTitle>
            <p className="mt-3 text-sm leading-6 text-slate-600">{step.summary}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-line bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message dirigeant</p>
          <p className="mt-2 text-base font-medium leading-7 text-ink">{step.leaderMessage}</p>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Éléments de preuve</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {step.proofPoints.map((proof, index) => (
              <Badge key={`${step.id}-proof-${index}-${proof}`}>{proof}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrioritySection({ scenario }: { scenario: DemoAtlasScenario }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Priorités et recommandations</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {scenario.priorities.map((priority, index) => (
            <article key={`${priority.title}-${index}`} className="rounded-md border border-line bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">#{index + 1}</Badge>
                <Badge>{priority.score}/100</Badge>
                <Badge variant={priority.urgency === "Critique" ? "danger" : "warning"}>{priority.urgency}</Badge>
                <Badge>Impact {priority.impact}</Badge>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">{priority.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{priority.reason}</p>
            </article>
          ))}
        </div>
        <div className="space-y-3">
          {scenario.recommendations.map((recommendation, index) => (
            <article key={`${recommendation.title}-${index}`} className="rounded-md border border-brand-100 bg-brand-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">Confiance {recommendation.confidenceScore} %</Badge>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">{recommendation.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation.why}</p>
              <p className="mt-3 text-sm font-medium text-brand-700">{recommendation.action}</p>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionAndImpactSection({ scenario }: { scenario: DemoAtlasScenario }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{scenario.actionPlan.title}</CardTitle>
            <Badge>Plan d&apos;action</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Responsable : {scenario.actionPlan.owner} · Échéance : {scenario.actionPlan.dueDate}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="rounded-md border border-line bg-slate-50 p-3 text-sm font-medium text-ink">
            Impact attendu : {scenario.actionPlan.expectedImpact}
          </p>
          {scenario.actionPlan.tasks.map((task, index) => (
            <div key={`${task.label}-${index}`} className="rounded-md border border-line bg-white p-3">
              <p className="text-sm font-semibold text-ink">{task.label}</p>
              <p className="mt-1 text-xs text-slate-500">{task.owner} · {task.dueDate}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impact observé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avant</p>
              <p className="mt-2 text-sm font-medium text-ink">{scenario.impact.before}</p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Après</p>
              <p className="mt-2 text-sm font-medium text-emerald-800">{scenario.impact.after}</p>
            </div>
          </div>
          <p className="rounded-md border border-line bg-slate-50 p-3 text-sm leading-6 text-slate-700">{scenario.impact.interpretation}</p>
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">{scenario.impact.limitation}</p>
        </CardContent>
      </Card>
    </section>
  );
}

function ExecutiveAndCopilSection({ scenario }: { scenario: DemoAtlasScenario }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card className="border-brand-100">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Dashboard dirigeant</CardTitle>
            <Badge variant="brand">{scenario.executiveDashboard.score}/100</Badge>
            <Badge>Confiance {scenario.executiveDashboard.confidenceLevel}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-700">{scenario.executiveDashboard.globalSituation}</p>
          <div className="mt-4 space-y-2">
            {scenario.executiveDashboard.nextActions.map((action, index) => (
              <p key={`${action}-${index}`} className="rounded-md border border-line bg-slate-50 px-3 py-2 text-sm font-medium text-ink">
                {action}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{scenario.copilBrief.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Points d&apos;arbitrage</p>
            <div className="mt-2 space-y-2">
              {scenario.copilBrief.arbitrationPoints.map((point, index) => (
                <p key={`${point}-${index}`} className="rounded-md border border-line bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {point}
                </p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Décisions à prendre</p>
            <div className="mt-2 space-y-2">
              {scenario.copilBrief.decisionsToTake.map((decision, index) => (
                <p key={`${decision}-${index}`} className="rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
                  {decision}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function AtlasDemoPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");
  const scenario = demoAtlasScenario;
  const currentStep = scenario.steps[currentStepIndex];
  const progressLabel = `Étape ${currentStep.order} / ${scenario.steps.length}`;
  const markdownSummary = useMemo(() => generateDemoAtlasMarkdown(scenario), [scenario]);

  async function copyDemoSummary() {
    try {
      await navigator.clipboard.writeText(markdownSummary);
      setCopyMessage("Résumé de démonstration copié.");
    } catch {
      setCopyMessage("Copie indisponible dans ce navigateur.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-line bg-ink text-white shadow-soft">
        <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" className="border-white/20 bg-white/10 text-white">Démo Atlas guidée</Badge>
              <Badge className="border-white/20 bg-white/10 text-white">15 minutes</Badge>
              <Badge className="border-white/20 bg-white/10 text-white">Sans IA générative</Badge>
            </div>
            <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Atlas transforme les signaux dispersés d&apos;une PME en décisions pilotables.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              {scenario.company.name} fait face à une marge qui se dégrade, un coût de sous-traitance en hausse et un COPIL à préparer. Cette démonstration raconte comment Atlas aide à voir, décider et piloter.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" onClick={copyDemoSummary}>
                <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                Copier le résumé de démonstration
              </Button>
              {copyMessage ? <span className="inline-flex items-center text-sm text-slate-300">{copyMessage}</span> : null}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/10 p-5">
            <p className="text-sm text-slate-300">Entreprise</p>
            <p className="mt-1 text-xl font-semibold">{scenario.company.name}</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              <p>{scenario.company.activity}</p>
              <p>{scenario.company.size}</p>
              <p>{scenario.company.context}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scenario.initialMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Parcours guidé</CardTitle>
              <Badge variant="brand">{progressLabel}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {scenario.steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(index)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                  index === currentStepIndex
                    ? "border-brand-200 bg-brand-50 font-semibold text-brand-700"
                    : "border-line bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {step.order}. {step.title}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <CurrentStepCard step={currentStep} />
          <StepEvidence step={currentStep} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((value) => Math.max(0, value - 1))}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Étape précédente
            </Button>
            <Button
              variant="primary"
              disabled={currentStepIndex === scenario.steps.length - 1}
              onClick={() => setCurrentStepIndex((value) => Math.min(scenario.steps.length - 1, value + 1))}
            >
              Étape suivante
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <PrioritySection scenario={scenario} />
      <ActionAndImpactSection scenario={scenario} />
      <ExecutiveAndCopilSection scenario={scenario} />

      <Card className="border-brand-100 bg-brand-50">
        <CardHeader>
          <CardTitle>Conclusion : ce que vend Atlas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Une lecture dirigeant en moins de deux minutes.",
            "Des priorités explicables, pas une liste de voyants.",
            "Des recommandations transformables en plans d'action.",
            "Une boucle décisionnelle : signal, action, impact, mémoire."
          ].map((value, index) => (
            <p key={`${value}-${index}`} className="rounded-md border border-brand-100 bg-white p-4 text-sm font-medium leading-6 text-brand-700">
              {value}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
