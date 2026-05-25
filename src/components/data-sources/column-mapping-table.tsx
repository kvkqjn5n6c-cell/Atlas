import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateMappingQuality } from "@/lib/data-pipeline/mapping-engine";
import { formatAtlasField, formatMappingStatus } from "@/lib/formatters/status-labels";
import type { ColumnMapping } from "@/types/atlas";

export function ColumnMappingTable({ mappings }: { mappings: ColumnMapping[] }) {
  const quality = calculateMappingQuality(mappings);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Mapping des colonnes</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Colonne source vers champ Atlas normalisé.</p>
          </div>
          <div className="min-w-[220px]">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Qualité mapping</span>
              <span className="font-semibold text-ink">{quality}%</span>
            </div>
            <Progress value={quality} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Colonne source</th>
                <th className="px-4 py-3 font-medium">Champ Atlas</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Confiance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {mappings.map((mapping) => (
                <tr key={mapping.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-ink">{mapping.sourceColumn}</td>
                  <td className="px-4 py-3 text-slate-700">{formatAtlasField(mapping.atlasField)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={mapping.status === "mapped" ? "success" : "warning"}>
                      {formatMappingStatus(mapping.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{mapping.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
