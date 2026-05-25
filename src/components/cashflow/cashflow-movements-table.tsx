import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CashflowMovement, CashflowMovementStatus, CashflowMovementType } from "@/types/cashflow";
import { CashflowRiskBadge } from "./cashflow-risk-badge";

const statusConfig: Record<
  CashflowMovementStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "brand" }
> = {
  expected: { label: "prevu", variant: "brand" },
  confirmed: { label: "confirme", variant: "success" },
  "at-risk": { label: "a risque", variant: "danger" },
  late: { label: "en retard", variant: "danger" },
  planned: { label: "planifie", variant: "warning" }
};

function TypeBadge({ type }: { type: CashflowMovementType }) {
  const Icon = type === "inflow" ? ArrowUpCircle : ArrowDownCircle;

  return (
    <Badge variant={type === "inflow" ? "success" : "warning"}>
      <Icon className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
      {type === "inflow" ? "encaissement" : "depense"}
    </Badge>
  );
}

function MovementStatusBadge({ status }: { status: CashflowMovementStatus }) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function impactLabel(movement: CashflowMovement) {
  const signedAmount = movement.type === "inflow" ? movement.amount : -movement.amount;
  return signedAmount >= 0 ? `+${formatCurrency(signedAmount)}` : formatCurrency(signedAmount);
}

export function CashflowMovementsTable({ movements }: { movements: CashflowMovement[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Mouvements previsionnels</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Les entrees et sorties qui expliquent le risque cash.
            </p>
          </div>
          <Badge variant="brand">{movements.length} mouvements</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden overflow-hidden rounded-lg border border-line xl:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Client / fournisseur</th>
                <th className="px-4 py-3 font-medium">Libelle</th>
                <th className="px-4 py-3 font-medium">Montant</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Impact</th>
                <th className="px-4 py-3 font-medium">Risque</th>
                <th className="px-4 py-3 font-medium">Action recommandee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {movements.map((movement) => (
                <tr key={movement.id} className="bg-white align-top transition hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-600">{movement.date}</td>
                  <td className="px-4 py-4">
                    <TypeBadge type={movement.type} />
                  </td>
                  <td className="px-4 py-4 font-semibold text-ink">{movement.counterparty}</td>
                  <td className="px-4 py-4 text-slate-600">{movement.label}</td>
                  <td className="px-4 py-4 font-medium text-ink">
                    {formatCurrency(movement.amount)}
                  </td>
                  <td className="px-4 py-4">
                    <MovementStatusBadge status={movement.status} />
                  </td>
                  <td className="px-4 py-4 font-semibold text-ink">{impactLabel(movement)}</td>
                  <td className="px-4 py-4">
                    <CashflowRiskBadge riskLevel={movement.riskLevel} />
                  </td>
                  <td className="px-4 py-4 text-slate-700">{movement.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 xl:hidden">
          {movements.map((movement) => (
            <article key={movement.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{movement.counterparty}</p>
                  <p className="mt-1 text-sm text-slate-500">{movement.label}</p>
                </div>
                <CashflowRiskBadge riskLevel={movement.riskLevel} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <TypeBadge type={movement.type} />
                <MovementStatusBadge status={movement.status} />
                <Badge>{movement.date}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Montant</p>
                  <p className="mt-1 font-semibold text-ink">{formatCurrency(movement.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Impact</p>
                  <p className="mt-1 font-semibold text-ink">{impactLabel(movement)}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Action recommandee
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {movement.recommendedAction}
                </p>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
