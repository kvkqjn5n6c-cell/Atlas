import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  GitBranch,
  LineChart,
  Map,
  ShieldAlert,
  Sparkles,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoScenarioMock } from "@/lib/mock/demo-scenario";

const statusVariant = {
  source: "default",
  mapping: "warning",
  configured: "brand",
  detected: "danger",
  action: "warning",
  ready: "success"
} as const;

const stepIcons = [Map, GitBranch, GitBranch, Target, ShieldAlert, BadgeCheck, FileText, LineChart];

const statusLabels = {
  source: "Source",
  mapping: "Mapping",
  configured: "Configuré",
  detected: "Détecté",
  action: "Action",
  ready: "Prêt"
} as const;

const productGlossary = [
  ["KPI", "Indicateur de performance suivi avec un objectif, une tendance et une qualité de donnée."],
  ["Source de données", "Fichier, export ou base qui alimente les indicateurs Atlas."],
  ["Mapping", "Lien entre une colonne client et un champ standard Atlas."],
  ["Qualité de donnée", "Niveau de confiance dans la donnée utilisée pour décider."],
  ["Alerte", "Signal priorisé avec cause probable, impact métier et action recommandée."],
  ["Plan d'action", "Suite d'actions concrètes issue des alertes de pilotage."],
  ["Rapport dirigeant", "Synthèse prête à présenter avec risques, KPI critiques et priorités."],
  ["Score de performance", "Lecture consolidée de la santé de pilotage sur 100."]
];

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-line bg-ink text-white shadow-soft">
        <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div>
            <Badge variant="brand" className="border-white/20 bg-white/10 text-white">
              Mode demo
            </Badge>
            <h2 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {demoScenarioMock.headline}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              {demoScenarioMock.pitch}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/pilotage"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Voir le cockpit final
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/data-sources"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Demarrer par les sources
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-white/10 p-2">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-300">Scenario client</p>
                <p className="font-semibold">{demoScenarioMock.organizationName}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-200">
              <p>Avant Atlas : données dispersées, arbitrages lents.</p>
              <p>Avec Atlas : sources reliées, KPI explicables, alertes actionnables.</p>
              <p>Après Atlas : priorités dirigeant visibles en moins de deux minutes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avant Atlas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {demoScenarioMock.beforeAtlas.map((item) => (
              <div key={item} className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apres traitement Atlas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {demoScenarioMock.afterAtlas.map((item) => (
              <div key={item} className="rounded-md border border-brand-100 bg-brand-50 p-3 text-sm font-medium text-brand-700">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Parcours guide</CardTitle>
          <p className="text-sm text-slate-500">
            Un fil de démonstration pour raconter la transformation : données dispersées, traitement Atlas, décision dirigeant.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-2">
            {demoScenarioMock.steps.map((step, index) => {
              const Icon = stepIcons[index] ?? Target;

              return (
                <article key={step.id} className="rounded-lg border border-line bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{`Etape ${step.order}`}</Badge>
                          <Badge variant={statusVariant[step.status]}>{statusLabels[step.status]}</Badge>
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{step.shortExplanation}</p>
                  <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-medium text-ink">
                    Valeur métier : {step.businessValue}
                  </div>
                  <Link
                    href={step.href}
                    className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {step.ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Ce que le dirigeant comprend</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {demoScenarioMock.atlasValue.map((item) => (
              <div key={item} className="rounded-md border border-line bg-slate-50 p-4">
                <p className="text-sm font-semibold text-ink">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-brand-50">
          <CardHeader>
            <CardTitle>Ce qu&apos;Atlas apporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-700">
            <p>Une lecture unique de la performance, sans transformer l&apos;outil en ERP.</p>
            <p>Des alertes qui relient donnée, cause probable, impact et décision.</p>
            <p>Un rapport dirigeant prêt à présenter, avec les limites de fiabilité explicites.</p>
            <Link
              href="/pilotage"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Conclure par le cockpit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Mini glossaire Atlas</CardTitle>
          <p className="text-sm text-slate-500">
            Quelques définitions simples pour aligner le vocabulaire pendant une présentation.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {productGlossary.map(([term, definition]) => (
            <div key={term} className="rounded-md border border-line bg-slate-50 p-4">
              <p className="text-sm font-semibold text-ink">{term}</p>
              <p className="mt-2 text-sm leading-5 text-slate-600">{definition}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
