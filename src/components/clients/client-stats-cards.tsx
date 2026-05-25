import { AlertTriangle, Banknote, HandCoins, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ClientStats } from "@/types/client";

const cards = [
  { key: "activeClients", label: "Clients actifs", icon: Users },
  { key: "atRiskClients", label: "Clients a risque", icon: AlertTriangle },
  { key: "invoicedRevenue", label: "CA facture", icon: Banknote },
  { key: "collectedRevenue", label: "CA encaisse", icon: HandCoins },
  { key: "outstandingRevenue", label: "Reste a encaisser", icon: Banknote }
] as const;

export function ClientStatsCards({ stats }: { stats: ClientStats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];
        const displayValue =
          typeof value === "number" && card.key.includes("Revenue") ? formatCurrency(value) : value;

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
