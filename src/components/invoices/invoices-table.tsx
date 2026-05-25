import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceRecord } from "@/types/invoice";
import { InvoiceNextAction } from "./invoice-next-action";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { TransmissionStatusBadge } from "./transmission-status-badge";

function LateBadge({ daysLate }: { daysLate: number }) {
  if (daysLate <= 0) {
    return <Badge variant="success">a jour</Badge>;
  }

  return <Badge variant={daysLate >= 10 ? "danger" : "warning"}>{daysLate} j retard</Badge>;
}

export function InvoicesTable({ invoices }: { invoices: InvoiceRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Factures prioritaires</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Classement par retard, blocage transmission, statut puis reste du.
            </p>
          </div>
          <Badge variant="brand">{invoices.length} factures</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden overflow-hidden rounded-lg border border-line xl:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Facture</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">TTC</th>
                <th className="px-4 py-3 font-medium">Encaisse</th>
                <th className="px-4 py-3 font-medium">Reste du</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Transmission</th>
                <th className="px-4 py-3 font-medium">Retard</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="bg-white align-top transition hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{invoice.invoiceNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">{invoice.clientName}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>Emission : {invoice.issueDate}</p>
                    <p className="mt-1">Echeance : {invoice.dueDate}</p>
                  </td>
                  <td className="px-4 py-4 font-medium text-ink">
                    {formatCurrency(invoice.amountIncludingTax)}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {formatCurrency(invoice.collectedAmount)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-ink">
                    {formatCurrency(invoice.outstandingAmount)}
                  </td>
                  <td className="px-4 py-4">
                    <InvoiceStatusBadge status={invoice.businessStatus} />
                  </td>
                  <td className="px-4 py-4">
                    <TransmissionStatusBadge status={invoice.transmissionStatus} />
                  </td>
                  <td className="px-4 py-4">
                    <LateBadge daysLate={invoice.daysLate} />
                  </td>
                  <td className="px-4 py-4">
                    <InvoiceNextAction action={invoice.nextAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 xl:hidden">
          {invoices.map((invoice) => (
            <article key={invoice.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{invoice.invoiceNumber}</p>
                  <p className="mt-1 text-sm text-slate-500">{invoice.clientName}</p>
                </div>
                <LateBadge daysLate={invoice.daysLate} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <InvoiceStatusBadge status={invoice.businessStatus} />
                <TransmissionStatusBadge status={invoice.transmissionStatus} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-md bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">TTC</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatCurrency(invoice.amountIncludingTax)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Encaisse</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatCurrency(invoice.collectedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reste</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatCurrency(invoice.outstandingAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Dates
                  </p>
                  <p className="mt-2 text-slate-700">Emission : {invoice.issueDate}</p>
                  <p className="mt-1 text-slate-700">Echeance : {invoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Prochaine action
                  </p>
                  <div className="mt-2">
                    <InvoiceNextAction action={invoice.nextAction} />
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
