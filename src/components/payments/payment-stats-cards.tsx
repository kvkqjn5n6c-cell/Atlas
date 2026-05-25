import { AlertTriangle, Banknote, HandCoins, ShieldAlert, Timer, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { PaymentStats } from "@/types/payment";

const cards = [
  { key: "expectedAmount", label: "Attendu", icon: WalletCards },
  { key: "receivedAmount", label: "Recu", icon: HandCoins },
  { key: "outstandingAmount", label: "Reste a encaisser", icon: Banknote },
  { key: "overdueAmount", label: "En retard", icon: AlertTriangle },
  { key: "latePayments", label: "Paiements en retard", icon: Timer },
  { key: "highRiskPayments", label: "Risques eleves", icon: ShieldAlert }
] as const;

export function PaymentStatsCards({ stats }: { stats: PaymentStats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];
        const displayValue =
          typeof value === "number" && card.key.toLowerCase().includes("amount")
            ? formatCurrency(value)
            : value;

        return (
          <Card key={card.key}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-ink">{displayValue}</p>
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
