import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDataSourceUsage } from "@/lib/formatters/status-labels";
import type { DataSource } from "@/types/atlas";
import { DataSourceStatusBadge } from "./data-source-status-badge";

const sourceTypeLabels = {
  excel: "Excel",
  csv: "CSV",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  "sql-server": "SQL Server"
};

export function DataSourcesTable({ sources }: { sources: DataSource[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Sources par organisation</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Structure front préparatoire, sans connexion réelle.
            </p>
          </div>
          <Badge variant="brand">{sources.length} sources</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Dernière sync</th>
                <th className="px-4 py-3 font-medium">Lignes</th>
                <th className="px-4 py-3 font-medium">Usage métier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sources.map((source) => (
                <tr key={source.id} className="bg-white align-top transition hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <Link
                      href={`/data-sources/${source.id}`}
                      className="font-semibold text-ink underline-offset-4 hover:text-brand-700 hover:underline"
                    >
                      {source.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{sourceTypeLabels[source.type]}</td>
                  <td className="px-4 py-4">
                    <DataSourceStatusBadge status={source.status} />
                  </td>
                  <td className="px-4 py-4 text-slate-600">{source.lastSync}</td>
                  <td className="px-4 py-4 font-medium text-ink">
                    {source.importedRows.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {source.usage.map((usage) => (
                        <Badge key={usage}>{formatDataSourceUsage(usage)}</Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
