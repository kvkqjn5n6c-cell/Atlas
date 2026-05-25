"use client";

import Link from "next/link";
import { ArrowLeft, Radar } from "lucide-react";
import { ClientFilters } from "@/components/clients/client-filters";
import { ClientStatsCards } from "@/components/clients/client-stats-cards";
import { ClientsTable } from "@/components/clients/clients-table";
import { Badge } from "@/components/ui/badge";
import { calculateClientStats, applyClientFilter, sortClientsByDecisionPriority } from "@/lib/business/clients";
import { clientsMock } from "@/lib/mock/clients";
import type { ClientFiltersState } from "@/types/client";
import { useMemo, useState } from "react";

const initialFilters: ClientFiltersState = {
  status: "all",
  riskLevel: "all",
  search: ""
};

export function ClientsCrmPage() {
  const [filters, setFilters] = useState<ClientFiltersState>(initialFilters);

  const visibleClients = useMemo(() => {
    return sortClientsByDecisionPriority(applyClientFilter(clientsMock, filters));
  }, [filters]);

  const stats = useMemo(() => calculateClientStats(visibleClients), [visibleClients]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">CRM V1</Badge>
              <Badge>
                <Radar className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Portefeuille dirigeant
              </Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Clients</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Voir rapidement quels clients rapportent, lesquels sont a risque, qui doit etre
              relance et ou se trouve le cash a encaisser.
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

      <ClientStatsCards stats={stats} />
      <ClientFilters filters={filters} onChange={setFilters} />
      <ClientsTable clients={visibleClients} />
    </div>
  );
}
