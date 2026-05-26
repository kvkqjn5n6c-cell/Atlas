"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetectedColumnsTable } from "@/components/data-import/detected-columns-table";
import { FilePreviewTable } from "@/components/data-import/file-preview-table";
import { LocalImportSummary } from "@/components/data-import/local-import-summary";
import { LocalMappingPanel } from "@/components/data-import/local-mapping-panel";
import { MAX_LOCAL_STORAGE_ROWS } from "@/lib/config/import-limits";
import { parseCsvFile } from "@/lib/data-pipeline/csv-parser";
import { buildInitialMappings, validateLocalMapping } from "@/lib/data-pipeline/mapping-suggestions";
import { saveLastLocalImport } from "@/lib/local/local-import-store";
import type { DataImportJob } from "@/types/atlas";
import type {
  LocalColumnMapping,
  LocalImportSummary as LocalImportSummaryType,
  LocalValidatedImport,
  ParsedFileResult
} from "@/types/data-import";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} Mo`;
}

function buildLocalImportSummary(parsedFile: ParsedFileResult, mappings: LocalColumnMapping[]): LocalImportSummaryType {
  const validation = validateLocalMapping(mappings);
  const status: DataImportJob["status"] =
    parsedFile.errors.length > 0 || validation.warnings.length > 0 ? "partial" : "completed";
  const now = new Date().toISOString();

  return {
    fileName: parsedFile.fileName,
    rowsRead: parsedFile.totalRows,
    columnsDetected: parsedFile.columns.length,
    mappedColumns: validation.mappedColumns,
    unmappedColumns: validation.unmappedColumns.length,
    detectedErrors: parsedFile.errors.length,
    qualityScore: validation.qualityScore,
    validationWarnings: [...parsedFile.errors, ...parsedFile.warnings, ...validation.warnings],
    importJob: {
      id: `local-import-${Date.now()}`,
      sourceName: parsedFile.fileName,
      dataSourceId: "local-file",
      organizationId: "org-atlas-demo",
      status,
      startedAt: now,
      finishedAt: now,
      rowsRead: parsedFile.totalRows,
      validRows: Math.max(0, parsedFile.totalRows - parsedFile.errors.length),
      rejectedRows: parsedFile.errors.length,
      detectedErrors: parsedFile.errors.length,
      kpiCoverage: validation.qualityScore,
      durationSeconds: parsedFile.statistics ? Math.max(1, Math.round(parsedFile.statistics.parsingTimeMs / 1000)) : 1,
      trigger: "manual",
      persisted: false
    }
  };
}

export function LocalFileImportPanel() {
  const [isReading, setIsReading] = useState(false);
  const [parsedFile, setParsedFile] = useState<ParsedFileResult | null>(null);
  const [mappings, setMappings] = useState<LocalColumnMapping[]>([]);
  const [summary, setSummary] = useState<LocalImportSummaryType | null>(null);
  const [validatedImport, setValidatedImport] = useState<LocalValidatedImport | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);

  const canGenerateSummary = useMemo(() => {
    if (!parsedFile || parsedFile.columns.length === 0) return false;
    return validateLocalMapping(mappings).mappedColumns > 0;
  }, [mappings, parsedFile]);

  async function handleFileChange(file?: File) {
    if (!file) return;

    setIsReading(true);
    setReadError(null);
    setSummary(null);
    setValidatedImport(null);
    setStorageMessage(null);

    try {
      const result = await parseCsvFile(file);
      setParsedFile(result);
      setMappings(buildInitialMappings(result.columns));

      if (result.errors.length > 0 && result.columns.length === 0) {
        setReadError(result.errors[0]);
      }
    } catch {
      setReadError("Lecture impossible. Vérifiez le fichier CSV puis réessayez.");
      setParsedFile(null);
      setMappings([]);
    } finally {
      setIsReading(false);
    }
  }

  function validateLocalImport() {
    if (!parsedFile) return;
    const nextSummary = buildLocalImportSummary(parsedFile, mappings);
    const nextValidatedImport: LocalValidatedImport = {
      id: nextSummary.importJob.id,
      fileName: parsedFile.fileName,
      createdAt: new Date().toISOString(),
      rowsRead: nextSummary.rowsRead,
      columnsDetected: nextSummary.columnsDetected,
      mappedColumns: nextSummary.mappedColumns,
      unmappedColumns: nextSummary.unmappedColumns,
      mappingQualityScore: nextSummary.qualityScore,
      mappings: mappings.map((mapping) => ({
        ...mapping,
        detectedType:
          parsedFile.columns.find((column) => column.name === mapping.sourceColumn)?.detectedType ?? "text"
      })),
      previewRows: parsedFile.rows.slice(0, MAX_LOCAL_STORAGE_ROWS),
      simulatedImportJob: nextSummary.importJob,
      summaryStats: parsedFile.statistics,
      persisted: false
    };
    const storeResult = saveLastLocalImport(nextValidatedImport);

    setSummary(nextSummary);
    setStorageMessage(storeResult.message);

    if (storeResult.success) {
      setValidatedImport(nextValidatedImport);
    } else {
      setValidatedImport(null);
    }
  }

  return (
    <section className="space-y-5">
      <Card className="border-brand-100">
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">Import réel local</Badge>
                <Badge>Test local</Badge>
                <Badge>Non persisté</Badge>
                {parsedFile?.statistics?.isLargeFile ? <Badge variant="warning">Fichier volumineux</Badge> : null}
              </div>
              <CardTitle className="mt-3">Prévisualiser un fichier CSV</CardTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Chargez un fichier local pour détecter les colonnes, préparer le mapping et estimer si la donnée
                peut alimenter les KPI Atlas. Atlas analyse le fichier, mais ne conserve localement qu&apos;un aperçu
                limité et des métadonnées.
              </p>
            </div>
            <div className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-medium text-ink">Formats</p>
              <p>CSV supporté · Excel préparé pour une prochaine étape</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-brand-200 bg-brand-50/40 p-6 text-center transition hover:bg-brand-50">
            <FileSpreadsheet className="h-8 w-8 text-brand-700" aria-hidden="true" />
            <span className="mt-3 text-sm font-semibold text-ink">
              {isReading ? "Lecture du fichier..." : "Choisir un fichier CSV"}
            </span>
            <span className="mt-1 text-xs text-slate-500">
              Séparateur virgule ou point-virgule, première ligne utilisée comme en-têtes.
            </span>
            <input
              type="file"
              accept=".csv,.xlsx"
              className="sr-only"
              disabled={isReading}
              onChange={(event) => void handleFileChange(event.target.files?.[0])}
            />
          </label>

          {readError ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {readError}
            </div>
          ) : null}

          {parsedFile && parsedFile.columns.length > 0 ? (
            <div className="space-y-3 rounded-md border border-line bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Upload className="h-4 w-4 text-brand-700" aria-hidden="true" />
                <span className="font-semibold text-ink">{parsedFile.fileName}</span>
                <span className="text-slate-500">· {parsedFile.totalRows.toLocaleString("fr-FR")} lignes lues</span>
                <span className="text-slate-500">· {parsedFile.columns.length} colonnes détectées</span>
                {parsedFile.delimiter ? <span className="text-slate-500">· séparateur : {parsedFile.delimiter}</span> : null}
              </div>

              {parsedFile.statistics ? (
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    ["Taille fichier", formatBytes(parsedFile.statistics.fileSizeBytes)],
                    ["Temps lecture", `${parsedFile.statistics.parsingTimeMs} ms`],
                    ["Cellules vides", parsedFile.statistics.estimatedEmptyCells.toLocaleString("fr-FR")],
                    ["Colonnes avec manques", parsedFile.statistics.columnsWithMissingValues.length]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-line bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                      <p className="mt-1 font-semibold text-ink">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
                Atlas affiche un aperçu limité pour préserver les performances. Le fichier complet n&apos;est pas stocké
                localement ; le traitement complet sera géré côté serveur dans une phase ultérieure.
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {parsedFile ? (
        <>
          <FilePreviewTable rows={parsedFile.rows} />
          <DetectedColumnsTable columns={parsedFile.columns} />
          <LocalMappingPanel mappings={mappings} onChange={setMappings} />

          {parsedFile.columns.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={validateLocalImport} disabled={!canGenerateSummary}>
                Valider l&apos;import local
              </Button>
              <p className="text-sm text-slate-500">
                Le résultat reste local et prépare uniquement le mapping futur.
              </p>
            </div>
          ) : null}

          <LocalImportSummary summary={summary} />

          {storageMessage ? (
            <div className={`rounded-md border p-4 text-sm ${validatedImport ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
              <p className="font-semibold">{storageMessage}</p>
            </div>
          ) : null}

          {validatedImport ? (
            <div className="flex flex-col gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Import local prêt pour supervision.</p>
                <p className="mt-1">Atlas peut maintenant reprendre ce mapping dans Imports & mappings.</p>
              </div>
              <Link
                href="/imports-mappings"
                className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-700 px-3 text-sm font-medium text-white transition hover:bg-emerald-800"
              >
                Superviser le mapping
              </Link>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
