import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateMappingQuality, getMappingsForSource } from "@/lib/data-pipeline/mapping-engine";
import { formatImportStatus } from "@/lib/formatters/status-labels";
import { dataImportJobsMock } from "@/lib/mock/data-imports";
import { dataSourcesMock } from "@/lib/mock/data-sources";
import { organizationsMock } from "@/lib/mock/organizations";
import { ImportsMappingsWorkbench } from "./imports-mappings-workbench";
import { LocalImportSupervision } from "./local-import-supervision";

const statusVariant = {
  pending: "default",
  running: "brand",
  completed: "success",
  failed: "danger",
  partial: "warning"
} as const;

export function ImportsMappingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <Badge variant="brand">Imports & mappings</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          Supervision des flux de données
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Suivre les imports, la qualité de mapping et les colonnes qui menacent la fiabilité KPI.
        </p>
      </section>

      <LocalImportSupervision />

      <Card>
        <CardHeader>
          <CardTitle>Derniers imports mockés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Import</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Lignes lues</th>
                  <th className="px-4 py-3 font-medium">Rejetées</th>
                  <th className="px-4 py-3 font-medium">Erreurs</th>
                  <th className="px-4 py-3 font-medium">Mapping</th>
                  <th className="px-4 py-3 font-medium">Qualité mapping</th>
                  <th className="px-4 py-3 font-medium">Prochaine sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {dataImportJobsMock.map((job) => {
                  const source = dataSourcesMock.find((item) => item.id === job.dataSourceId);
                  const organization = organizationsMock.find((item) => item.id === job.organizationId);
                  const mappings = getMappingsForSource(job.dataSourceId);
                  const mappingQuality = calculateMappingQuality(mappings);

                  return (
                    <tr key={job.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{job.startedAt}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{source?.name}</td>
                      <td className="px-4 py-3 text-slate-600">{organization?.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[job.status]}>{formatImportStatus(job.status)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{job.rowsRead.toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-3 text-slate-600">{job.rejectedRows.toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-3 text-slate-600">{job.detectedErrors}</td>
                      <td className="px-4 py-3 text-slate-600">{mappings.length} colonnes</td>
                      <td className="px-4 py-3 font-semibold text-ink">{mappingQuality}%</td>
                      <td className="px-4 py-3 text-slate-600">{source?.frequency === "daily" ? "Demain" : "À planifier"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ImportsMappingsWorkbench />
    </div>
  );
}
