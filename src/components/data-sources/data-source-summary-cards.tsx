import { AlertTriangle, CheckCircle2, Database, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DataSource } from "@/types/atlas";

export function DataSourceSummaryCards({ sources }: { sources: DataSource[] }) {
  const activeSources = sources.filter((source) => source.status === "connected").length;
  const errorSources = sources.filter((source) => source.status === "error").length;
  const lastSync = sources.find((source) => source.status === "connected")?.lastSync ?? "Aucune";
  const kpiCoverage = Math.round(
    (new Set(sources.flatMap((source) => source.usage)).size / 6) * 100
  );

  const cards = [
    { label: "Sources actives", value: activeSources, icon: CheckCircle2 },
    { label: "Erreurs", value: errorSources, icon: AlertTriangle },
    { label: "Derniere synchro", value: lastSync, icon: Database },
    { label: "Couverture KPI", value: `${kpiCoverage}%`, icon: Gauge }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-ink">{card.value}</p>
                </div>
                <div className="rounded-md bg-brand-50 p-2 text-brand-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
