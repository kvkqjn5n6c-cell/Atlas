import Link from "next/link";
import { ArrowLeft, BrainCircuit, Database, RefreshCcw } from "lucide-react";
import { TechnicalModeBadge } from "@/components/admin/technical-mode-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDataSourceUsage, formatImportStatus } from "@/lib/formatters/status-labels";
import { cn } from "@/lib/utils";
import type { DataSourceDetailData } from "@/lib/services/data-sources.service";
import type { DataSource } from "@/types/atlas";
import type { ServiceResult } from "@/types/service-results";
import { ColumnMappingTable } from "./column-mapping-table";
import { DataImportSummaryCards } from "./data-import-summary-cards";
import { DataPreviewTable } from "./data-preview-table";
import { DataSourceStatusBadge } from "./data-source-status-badge";
import { ImportJournal } from "./import-journal";

const sourceTypeLabels: Record<DataSource["type"], string> = {
  excel: "Excel",
  csv: "CSV",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  "sql-server": "SQL Server"
};

const frequencyLabels: Record<DataSource["frequency"], string> = {
  manual: "Manuelle",
  daily: "Quotidienne",
  weekly: "Hebdomadaire",
  monthly: "Mensuelle"
};

export function DataSourceDetailPage({
  result
}: {
  result: ServiceResult<DataSourceDetailData>;
}) {
  const { source, organization, job, jobs, mappings, previewRows, normalizationCoverage } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <Link
            href="/data-sources"
            className={cn(
              "mb-4 inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink"
            )}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour sources
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="brand">Source de données</Badge>
            <TechnicalModeBadge result={result} />
            <DataSourceStatusBadge status={source.status} />
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">{source.name}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Socle technique pour importer, mapper et normaliser les données qui alimenteront les
            KPI Atlas.
          </p>
        </div>
        <Button>
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Vérifier la source
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-brand-700" aria-hidden="true" />
            <CardTitle>Informations source</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Organisation", organization?.name ?? source.organizationId],
              ["Type", sourceTypeLabels[source.type]],
              ["Dernière synchronisation", source.lastSync],
              ["Fréquence", frequencyLabels[source.frequency]],
              ["Usage métier", source.usage.map(formatDataSourceUsage).join(", ")],
              ["Lignes importées", source.importedRows.toLocaleString("fr-FR")],
              ["Couverture normalisation", `${normalizationCoverage}%`],
              ["Job import", job ? formatImportStatus(job.status) : "Aucun job"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-line bg-slate-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-2 text-sm font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <DataImportSummaryCards job={job} />
      <ImportJournal jobs={jobs.length > 0 ? jobs : job ? [job] : []} />
      <DataPreviewTable rows={previewRows} />
      <ColumnMappingTable mappings={mappings} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-brand-700" aria-hidden="true" />
            <CardTitle>Préparation Atlas IA</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium text-ink">Analyse intelligente non activée.</p>
          <p className="text-sm leading-6 text-slate-600">
            Atlas IA utilisera plus tard les données normalisées, les KPI calculés et les alertes.
            Cette page prépare uniquement la structure d&apos;import et de mapping.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
