"use client";

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ClientFiltersState, ClientRiskLevel, ClientStatus } from "@/types/client";

const statuses: Array<{ value: ClientStatus | "all"; label: string }> = [
  { value: "all", label: "Tous statuts" },
  { value: "prospect", label: "Prospect" },
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "at-risk", label: "A risque" }
];

const riskLevels: Array<{ value: ClientRiskLevel | "all"; label: string }> = [
  { value: "all", label: "Tous risques" },
  { value: "low", label: "Faible" },
  { value: "medium", label: "Modere" },
  { value: "high", label: "Eleve" },
  { value: "critical", label: "Critique" }
];

export function ClientFilters({
  filters,
  onChange
}: {
  filters: ClientFiltersState;
  onChange: (filters: ClientFiltersState) => void;
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[minmax(260px,1fr)_220px_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Rechercher client, contact ou ville"
            className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <select
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value as ClientStatus | "all" })
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
            onChange({ ...filters, riskLevel: event.target.value as ClientRiskLevel | "all" })
          }
          className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {riskLevels.map((riskLevel) => (
            <option key={riskLevel.value} value={riskLevel.value}>
              {riskLevel.label}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );
}
