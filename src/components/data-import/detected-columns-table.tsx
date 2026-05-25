import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAtlasField } from "@/lib/formatters/status-labels";
import type { DetectedColumn } from "@/types/data-import";

export function DetectedColumnsTable({ columns }: { columns: DetectedColumn[] }) {
  if (columns.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Colonnes détectées</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Atlas propose un type simple et un champ cible à partir du nom de colonne.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="min-w-[820px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Colonne source</th>
                <th className="px-4 py-3 font-medium">Type détecté</th>
                <th className="px-4 py-3 font-medium">Exemples</th>
                <th className="px-4 py-3 font-medium">Suggestion Atlas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {columns.map((column) => (
                <tr key={column.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-ink">{column.name}</td>
                  <td className="px-4 py-3">
                    <Badge>{column.detectedType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{column.examples.join(", ") || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{formatAtlasField(column.suggestedAtlasField)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
