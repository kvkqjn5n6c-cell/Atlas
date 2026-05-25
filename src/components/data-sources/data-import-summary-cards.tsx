import { AlertTriangle, CheckCircle2, Gauge, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DataImportJob } from "@/types/atlas";

export function DataImportSummaryCards({ job }: { job?: DataImportJob }) {
  const cards = [
    {
      label: "Lignes valides",
      value: job?.validRows ?? 0,
      icon: CheckCircle2,
      tone: "text-emerald-600"
    },
    {
      label: "Lignes rejetées",
      value: job?.rejectedRows ?? 0,
      icon: XCircle,
      tone: "text-rose-600"
    },
    {
      label: "Erreurs détectées",
      value: job?.detectedErrors ?? 0,
      icon: AlertTriangle,
      tone: "text-amber-600"
    },
    {
      label: "Couverture KPI",
      value: `${job?.kpiCoverage ?? 0}%`,
      icon: Gauge,
      tone: "text-brand-700"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {typeof card.value === "number" ? card.value.toLocaleString("fr-FR") : card.value}
                </p>
              </div>
              <Icon className={`h-5 w-5 ${card.tone}`} aria-hidden="true" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
