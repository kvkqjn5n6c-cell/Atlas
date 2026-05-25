"use client";

import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CashflowForecastPoint } from "@/types/cashflow";

export function CashflowForecastChart({ data }: { data: CashflowForecastPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prévision de trésorerie</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Solde prévisionnel, encaissements, décaissements et seuil critique.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="cashflowBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1f8a83" stopOpacity={0.26} />
                  <stop offset="95%" stopColor="#1f8a83" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: 8, borderColor: "#d9dee3" }}
              />
              <Legend />
              <Bar dataKey="inflows" name="Encaissements" fill="#8fd6c8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflows" name="Décaissements" fill="#f5b56b" radius={[4, 4, 0, 0]} />
              <Area
                type="monotone"
                dataKey="projectedBalance"
                name="Solde"
                stroke="#1f8a83"
                strokeWidth={2}
                fill="url(#cashflowBalance)"
              />
              <Line
                type="monotone"
                dataKey="criticalThreshold"
                name="Seuil critique"
                stroke="#e11d48"
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
