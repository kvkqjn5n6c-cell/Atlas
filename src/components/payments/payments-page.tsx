"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, WalletCards } from "lucide-react";
import { PaymentFilters } from "@/components/payments/payment-filters";
import { PaymentStatsCards } from "@/components/payments/payment-stats-cards";
import { PaymentsTable } from "@/components/payments/payments-table";
import { Badge } from "@/components/ui/badge";
import {
  applyPaymentFilter,
  calculatePaymentStats,
  sortPaymentsByDecisionPriority
} from "@/lib/business/payments";
import { paymentsMock } from "@/lib/mock/payments";
import type { PaymentFiltersState } from "@/types/payment";

const initialFilters: PaymentFiltersState = {
  status: "all",
  lateOnly: false,
  riskLevel: "all",
  search: ""
};

export function PaymentsPage() {
  const [filters, setFilters] = useState<PaymentFiltersState>(initialFilters);

  const visiblePayments = useMemo(() => {
    return sortPaymentsByDecisionPriority(applyPaymentFilter(paymentsMock, filters));
  }, [filters]);

  const stats = useMemo(() => calculatePaymentStats(visiblePayments), [visiblePayments]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Paiements V1</Badge>
              <Badge>
                <WalletCards className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Encaissement et trésorerie
              </Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Paiements</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Voir ce qui est réellement encaissé, ce qui reste à encaisser, les retards probables
              et les relances qui ont le plus d&apos;impact sur la trésorerie.
            </p>
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

      <PaymentStatsCards stats={stats} />
      <PaymentFilters filters={filters} onChange={setFilters} />
      <PaymentsTable payments={visiblePayments} />
    </div>
  );
}
