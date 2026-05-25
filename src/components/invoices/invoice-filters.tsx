"use client";

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type {
  InvoiceBusinessStatus,
  InvoiceFiltersState,
  InvoiceTransmissionStatus
} from "@/types/invoice";

const businessStatuses: Array<{ value: InvoiceBusinessStatus | "all"; label: string }> = [
  { value: "all", label: "Tous statuts" },
  { value: "draft", label: "Brouillon" },
  { value: "validated", label: "Validee" },
  { value: "ready-transmission", label: "Prete transmission" },
  { value: "transmitted", label: "Transmise" },
  { value: "accepted", label: "Acceptee" },
  { value: "rejected", label: "Rejetee" },
  { value: "partially-paid", label: "Payee partiellement" },
  { value: "paid", label: "Payee" },
  { value: "cancelled", label: "Annulee" }
];

const transmissionStatuses: Array<{ value: InvoiceTransmissionStatus | "all"; label: string }> = [
  { value: "all", label: "Toutes transmissions" },
  { value: "not-transmitted", label: "Non transmise" },
  { value: "pending", label: "En attente" },
  { value: "transmitted", label: "Transmise" },
  { value: "accepted", label: "Acceptee" },
  { value: "rejected", label: "Rejetee" },
  { value: "error", label: "Erreur" }
];

export function InvoiceFilters({
  filters,
  onChange
}: {
  filters: InvoiceFiltersState;
  onChange: (filters: InvoiceFiltersState) => void;
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 xl:grid-cols-[minmax(260px,1fr)_220px_240px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Rechercher client ou numero"
            className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <select
          value={filters.businessStatus}
          onChange={(event) =>
            onChange({
              ...filters,
              businessStatus: event.target.value as InvoiceBusinessStatus | "all"
            })
          }
          className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {businessStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          value={filters.transmissionStatus}
          onChange={(event) =>
            onChange({
              ...filters,
              transmissionStatus: event.target.value as InvoiceTransmissionStatus | "all"
            })
          }
          className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {transmissionStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
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
