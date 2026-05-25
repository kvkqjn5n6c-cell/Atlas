"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { CashflowPoint } from "@/types/business";
import { formatCurrency } from "@/lib/utils";

export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  return (
    <div className="h-80 rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-ink">Trésorerie prévisionnelle</h2>
        <p className="mt-1 text-sm text-slate-500">Vue simple des flux sur 6 mois.</p>
      </div>
      <div className="h-56 min-h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="solde" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1f8a83" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#1f8a83" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: 8, borderColor: "#d9dee3" }}
            />
            <Area
              type="monotone"
              dataKey="solde"
              stroke="#1f8a83"
              strokeWidth={2}
              fill="url(#solde)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
