import Link from "next/link";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";
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
  badge = "Module cible"
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <Badge variant="brand">{badge}</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{objective}</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>KPI et informations attendues</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Les données qui devront nourrir le cockpit dirigeant.
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
            <CardTitle>Actions futures prévues</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Prochaines capacités à ajouter sans construire un CRUD complet maintenant.
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
