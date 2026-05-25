"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CashflowForecastPoint, RevenuePoint } from "@/types/dashboard";

export function CashflowForecastChart({ data }: { data: CashflowForecastPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trésorerie prévisionnelle</CardTitle>
        <p className="mt-1 text-sm text-slate-500">Projection simple avec seuil critique.</p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1f8a83" stopOpacity={0.28} />
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
              <Area
                type="monotone"
                dataKey="projectedCash"
                name="Trésorerie"
                stroke="#1f8a83"
                strokeWidth={2}
                fill="url(#cashGradient)"
              />
              <Line
                type="monotone"
                dataKey="criticalThreshold"
                name="Seuil critique"
                stroke="#e11d48"
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CA signé, facturé, encaissé</CardTitle>
        <p className="mt-1 text-sm text-slate-500">Lecture rapide du decalage commercial-cash.</p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
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
              <Line type="monotone" dataKey="signed" name="Signe" stroke="#2563eb" strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="invoiced"
                name="Facture"
                stroke="#1f8a83"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="collected"
                name="Encaisse"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
