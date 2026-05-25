"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { InvoiceStatsCards } from "@/components/invoices/invoice-stats-cards";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { Badge } from "@/components/ui/badge";
import {
  applyInvoiceFilter,
  calculateInvoiceStats,
  sortInvoicesByDecisionPriority
} from "@/lib/business/invoices";
import { invoicesMock } from "@/lib/mock/invoices";
import type { InvoiceFiltersState } from "@/types/invoice";

const initialFilters: InvoiceFiltersState = {
  businessStatus: "all",
  transmissionStatus: "all",
  lateOnly: false,
  search: ""
};

export function InvoicesPage() {
  const [filters, setFilters] = useState<InvoiceFiltersState>(initialFilters);

  const visibleInvoices = useMemo(() => {
    return sortInvoicesByDecisionPriority(applyInvoiceFilter(invoicesMock, filters));
  }, [filters]);

  const stats = useMemo(() => calculateInvoiceStats(visibleInvoices), [visibleInvoices]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Factures V1</Badge>
              <Badge>
                <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Cash et conformité future
              </Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Factures</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Identifier immédiatement le cash à encaisser, les retards, les transmissions bloquées
              et les actions qui protègent la trésorerie.
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

      <InvoiceStatsCards stats={stats} />
      <InvoiceFilters filters={filters} onChange={setFilters} />
      <InvoicesTable invoices={visibleInvoices} />
    </div>
  );
}
