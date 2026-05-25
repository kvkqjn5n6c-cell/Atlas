import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethod, PaymentRecord } from "@/types/payment";
import { PaymentNextAction } from "./payment-next-action";
import { PaymentRiskBadge } from "./payment-risk-badge";
import { PaymentStatusBadge } from "./payment-status-badge";

const methodLabels: Record<PaymentMethod, string> = {
  "bank-transfer": "virement",
  card: "carte",
  check: "cheque",
  cash: "especes",
  unknown: "a confirmer"
};

function LateBadge({ daysLate }: { daysLate: number }) {
  if (daysLate <= 0) {
    return <Badge variant="success">a jour</Badge>;
  }

  return <Badge variant={daysLate >= 10 ? "danger" : "warning"}>{daysLate} j retard</Badge>;
}

export function PaymentsTable({ payments }: { payments: PaymentRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Encaissements prioritaires</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Classement par retard, risque, statut puis reste a encaisser.
            </p>
          </div>
          <Badge variant="brand">{payments.length} lignes</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden overflow-hidden rounded-lg border border-line xl:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Facture</th>
                <th className="px-4 py-3 font-medium">Echeance</th>
                <th className="px-4 py-3 font-medium">Attendu</th>
                <th className="px-4 py-3 font-medium">Recu</th>
                <th className="px-4 py-3 font-medium">Reste du</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Moyen</th>
                <th className="px-4 py-3 font-medium">Retard</th>
                <th className="px-4 py-3 font-medium">Risque</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((payment) => (
                <tr key={payment.id} className="bg-white align-top transition hover:bg-slate-50">
                  <td className="px-4 py-4 font-semibold text-ink">{payment.clientName}</td>
                  <td className="px-4 py-4 text-slate-600">{payment.invoiceNumber}</td>
                  <td className="px-4 py-4 text-slate-600">{payment.dueDate}</td>
                  <td className="px-4 py-4 font-medium text-ink">
                    {formatCurrency(payment.expectedAmount)}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {formatCurrency(payment.receivedAmount)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-ink">
                    {formatCurrency(payment.outstandingAmount)}
                  </td>
                  <td className="px-4 py-4">
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-4">
                    <Badge>{methodLabels[payment.method]}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <LateBadge daysLate={payment.daysLate} />
                  </td>
                  <td className="px-4 py-4">
                    <PaymentRiskBadge riskLevel={payment.riskLevel} />
                  </td>
                  <td className="px-4 py-4">
                    <PaymentNextAction action={payment.nextAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 xl:hidden">
          {payments.map((payment) => (
            <article key={payment.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{payment.clientName}</p>
                  <p className="mt-1 text-sm text-slate-500">{payment.invoiceNumber}</p>
                </div>
                <PaymentRiskBadge riskLevel={payment.riskLevel} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <PaymentStatusBadge status={payment.status} />
                <Badge>{methodLabels[payment.method]}</Badge>
                <LateBadge daysLate={payment.daysLate} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-md bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Attendu</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatCurrency(payment.expectedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Recu</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatCurrency(payment.receivedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reste</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatCurrency(payment.outstandingAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Echeance
                  </p>
                  <p className="mt-2 text-slate-700">{payment.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Prochaine action
                  </p>
                  <div className="mt-2">
                    <PaymentNextAction action={payment.nextAction} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
