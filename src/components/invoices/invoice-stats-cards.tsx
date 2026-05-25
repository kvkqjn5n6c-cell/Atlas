import { AlertTriangle, Banknote, FileText, ShieldAlert, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceStats } from "@/types/invoice";

const cards = [
  { key: "totalInvoices", label: "Factures", icon: FileText },
  { key: "amountIncludingTax", label: "Total TTC", icon: Banknote },
  { key: "collectedAmount", label: "Encaisse", icon: WalletCards },
  { key: "outstandingAmount", label: "Reste du", icon: Banknote },
  { key: "overdueAmount", label: "En retard", icon: AlertTriangle },
  { key: "blockedInvoices", label: "Bloquees", icon: ShieldAlert }
] as const;

export function InvoiceStatsCards({ stats }: { stats: InvoiceStats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];
        const displayValue =
          typeof value === "number" && !["totalInvoices", "blockedInvoices"].includes(card.key)
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
