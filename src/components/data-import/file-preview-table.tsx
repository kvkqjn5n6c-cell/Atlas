import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FilePreviewRow } from "@/types/data-import";

export function FilePreviewTable({ rows }: { rows: FilePreviewRow[] }) {
  const columns = Object.keys(rows[0]?.values ?? {});
  const previewRows = rows.slice(0, 10);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu des données</CardTitle>
        <p className="mt-1 text-sm text-slate-500">Les 10 premières lignes sont affichées pour préparer le mapping.</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="min-w-[900px] w-full border-collapse text-left text-sm">
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
              {previewRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={`${row.id}-${column}`} className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {row.values[column] || "-"}
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
