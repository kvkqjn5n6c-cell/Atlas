"use client";

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PaymentFiltersState, PaymentRiskLevel, PaymentStatus } from "@/types/payment";

const statuses: Array<{ value: PaymentStatus | "all"; label: string }> = [
  { value: "all", label: "Tous statuts" },
  { value: "pending", label: "En attente" },
  { value: "partial", label: "Partiel" },
  { value: "paid", label: "Paye" },
  { value: "late", label: "En retard" },
  { value: "cancelled", label: "Annule" }
];

const riskLevels: Array<{ value: PaymentRiskLevel | "all"; label: string }> = [
  { value: "all", label: "Tous risques" },
  { value: "low", label: "Faible" },
  { value: "medium", label: "Modere" },
  { value: "high", label: "Eleve" },
  { value: "critical", label: "Critique" }
];

export function PaymentFilters({
  filters,
  onChange
}: {
  filters: PaymentFiltersState;
  onChange: (filters: PaymentFiltersState) => void;
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 xl:grid-cols-[minmax(260px,1fr)_220px_220px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Rechercher client ou facture"
            className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <select
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value as PaymentStatus | "all" })
          }
          className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          value={filters.riskLevel}
          onChange={(event) =>
            onChange({ ...filters, riskLevel: event.target.value as PaymentRiskLevel | "all" })
          }
          className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {riskLevels.map((riskLevel) => (
            <option key={riskLevel.value} value={riskLevel.value}>
              {riskLevel.label}
            </option>
          ))}
        </select>

        <label className="flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.lateOnly}
            onChange={(event) => onChange({ ...filters, lateOnly: event.target.checked })}
            className="h-4 w-4 rounded border-line text-brand-600"
          />
          Retard uniquement
        </label>
      </CardContent>
    </Card>
  );
}
