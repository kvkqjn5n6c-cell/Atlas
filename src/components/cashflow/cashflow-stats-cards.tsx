import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Banknote, CalendarClock, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CashflowSummary } from "@/types/cashflow";
import { CashflowRiskBadge } from "./cashflow-risk-badge";

const moneyCards = [
  { key: "currentBalance", label: "Solde actuel", icon: Banknote },
  { key: "expectedInflows", label: "Encaissements prevus", icon: ArrowUpCircle },
  { key: "expectedOutflows", label: "Decaissements prevus", icon: ArrowDownCircle },
  { key: "balance30", label: "Solde J+30", icon: CalendarClock },
  { key: "balance60", label: "Solde J+60", icon: CalendarClock },
  { key: "balance90", label: "Solde J+90", icon: CalendarClock },
  { key: "lowestBalance", label: "Point bas", icon: AlertTriangle }
] as const;

export function CashflowStatsCards({ summary }: { summary: CashflowSummary }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {moneyCards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key];

        return (
          <Card key={card.key}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-ink">
                    {formatCurrency(Number(value))}
                  </p>
                </div>
                <div className="rounded-md bg-brand-50 p-2 text-brand-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Tension potentielle</p>
              <p className="mt-3 text-2xl font-semibold text-ink">{summary.tensionDate ?? "Aucune"}</p>
            </div>
            <div className="rounded-md bg-brand-50 p-2 text-brand-700">
              <Gauge className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4">
            <CashflowRiskBadge riskLevel={summary.riskLevel} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
