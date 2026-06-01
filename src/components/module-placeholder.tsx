import Link from "next/link";
import { ArrowLeft, ArrowRight, Archive, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ModulePlaceholderProps = {
  title: string;
  objective: string;
  expectedInsights: string[];
  futureActions: string[];
  badge?: string;
};

export function ModulePlaceholder({
  title,
  objective,
  expectedInsights,
  futureActions,
  badge = "Module archivé"
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <Badge variant="warning">{badge}</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{objective}</p>
            <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <Archive className="h-4 w-4" aria-hidden="true" />
              Ancien module conservé hors navigation. Il ne reviendra que s&apos;il sert directement le pilotage métier.
            </div>
          </div>
          <Link
            href="/pilotage"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour pilotage
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Signaux de pilotage potentiels</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Données qui pourraient redevenir utiles si elles alimentent les KPI, alertes ou rapports Atlas.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {expectedInsights.map((insight) => (
                <article key={insight} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 rounded-md bg-white p-2 text-brand-700">
                      <Target className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <p className="text-sm leading-6 text-slate-700">{insight}</p>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conditions de retour</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Ce module reste en attente et ne doit pas redevenir un écran de gestion complet.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {futureActions.map((action) => (
              <article key={action} className="rounded-md border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <ArrowRight className="mt-0.5 h-4 w-4 text-brand-700" aria-hidden="true" />
                  <p className="text-sm leading-6 text-slate-700">{action}</p>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
