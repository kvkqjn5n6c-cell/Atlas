import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatImportStatus } from "@/lib/formatters/status-labels";
import { dataSourcesMock } from "@/lib/mock/data-sources";
import type { DataImportJob } from "@/types/atlas";

const statusVariant = {
  pending: "default",
  running: "brand",
  completed: "success",
  failed: "danger",
  partial: "warning"
} as const;

export function ImportJournal({ jobs }: { jobs: DataImportJob[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal des imports</CardTitle>
        <p className="text-sm text-slate-500">
          Historique mocké des traitements qui alimentent les KPI Atlas.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="min-w-[900px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Lignes lues</th>
                <th className="px-4 py-3 font-medium">Rejetées</th>
                <th className="px-4 py-3 font-medium">Erreurs</th>
                <th className="px-4 py-3 font-medium">Durée</th>
                <th className="px-4 py-3 font-medium">Déclenchement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {jobs.map((job, index) => {
                const source = dataSourcesMock.find((item) => item.id === job.dataSourceId);

                return (
                  <tr key={`${job.id}-${index}`} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{job.startedAt}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{source?.name ?? job.dataSourceId}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[job.status]}>{formatImportStatus(job.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{job.rowsRead.toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 text-slate-600">{job.rejectedRows.toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 text-slate-600">{job.detectedErrors}</td>
                    <td className="px-4 py-3 text-slate-600">{job.durationSeconds}s</td>
                    <td className="px-4 py-3 text-slate-600">{job.trigger === "auto" ? "Automatique" : "Manuel"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
