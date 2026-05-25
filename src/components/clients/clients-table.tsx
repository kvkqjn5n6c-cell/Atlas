import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ClientRecord, ClientStatus } from "@/types/client";
import { ClientNextAction } from "./client-next-action";
import { ClientRiskBadge } from "./client-risk-badge";

const statusConfig: Record<
  ClientStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "brand" }
> = {
  prospect: { label: "prospect", variant: "brand" },
  active: { label: "actif", variant: "success" },
  inactive: { label: "inactif", variant: "default" },
  "at-risk": { label: "a risque", variant: "danger" }
};

function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ClientsTable({ clients }: { clients: ClientRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Portefeuille clients</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Classement par risque puis par reste a encaisser.
            </p>
          </div>
          <Badge variant="brand">{clients.length} clients</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden overflow-hidden rounded-lg border border-line lg:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">CA facture</th>
                <th className="px-4 py-3 font-medium">CA encaisse</th>
                <th className="px-4 py-3 font-medium">Reste</th>
                <th className="px-4 py-3 font-medium">Docs</th>
                <th className="px-4 py-3 font-medium">Activite</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Risque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.map((client) => (
                <tr key={client.id} className="bg-white align-top transition hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{client.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {client.contactName} - {client.city}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <ClientStatusBadge status={client.status} />
                  </td>
                  <td className="px-4 py-4 font-medium text-ink">
                    {formatCurrency(client.invoicedRevenue)}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {formatCurrency(client.collectedRevenue)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-ink">
                    {formatCurrency(client.outstandingRevenue)}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {client.quoteCount} devis
                    <br />
                    {client.invoiceCount} factures
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-slate-700">{client.lastActivity.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{client.lastActivity.date}</p>
                  </td>
                  <td className="px-4 py-4">
                    <ClientNextAction action={client.nextAction} />
                  </td>
                  <td className="px-4 py-4">
                    <ClientRiskBadge riskLevel={client.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 lg:hidden">
          {clients.map((client) => (
            <article key={client.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{client.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {client.contactName} - {client.city}
                  </p>
                </div>
                <ClientRiskBadge riskLevel={client.riskLevel} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <ClientStatusBadge status={client.status} />
                <Badge>{client.quoteCount} devis</Badge>
                <Badge>{client.invoiceCount} factures</Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-md bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Facture</p>
                  <p className="mt-1 font-semibold text-ink">{formatCurrency(client.invoicedRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Encaisse</p>
                  <p className="mt-1 font-semibold text-ink">{formatCurrency(client.collectedRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reste</p>
                  <p className="mt-1 font-semibold text-ink">{formatCurrency(client.outstandingRevenue)}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Prochaine action
                </p>
                <div className="mt-2">
                  <ClientNextAction action={client.nextAction} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
