import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DataPreviewRow } from "@/types/atlas";

export function DataPreviewTable({ rows }: { rows: DataPreviewRow[] }) {
  const columns = Object.keys(rows[0]?.values ?? {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu des données importées</CardTitle>
        <p className="text-sm text-slate-500">
          Prévisualisation technique limitée, sans upload ni connexion réelle.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="min-w-[920px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={`${row.id}-${column}`} className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {row.values[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
