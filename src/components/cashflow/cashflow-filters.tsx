"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { CashflowFiltersState, CashflowMovementType, CashflowPeriod } from "@/types/cashflow";

const periods: Array<{ value: CashflowPeriod; label: string }> = [
  { value: 30, label: "30 jours" },
  { value: 60, label: "60 jours" },
  { value: 90, label: "90 jours" }
];

const movementTypes: Array<{ value: CashflowMovementType | "all"; label: string }> = [
  { value: "all", label: "Tous mouvements" },
  { value: "inflow", label: "Encaissements" },
  { value: "outflow", label: "Depenses" }
];

export function CashflowFilters({
  filters,
  onChange
}: {
  filters: CashflowFiltersState;
  onChange: (filters: CashflowFiltersState) => void;
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 md:grid-cols-[220px_220px_180px]">
        <select
          value={filters.period}
          onChange={(event) =>
            onChange({ ...filters, period: Number(event.target.value) as CashflowPeriod })
          }
          className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>

        <select
          value={filters.movementType}
          onChange={(event) =>
            onChange({
              ...filters,
              movementType: event.target.value as CashflowMovementType | "all"
            })
          }
          className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {movementTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <label className="flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.riskOnly}
            onChange={(event) => onChange({ ...filters, riskOnly: event.target.checked })}
            className="h-4 w-4 rounded border-line text-brand-600"
          />
          Risque uniquement
        </label>
      </CardContent>
    </Card>
  );
}
