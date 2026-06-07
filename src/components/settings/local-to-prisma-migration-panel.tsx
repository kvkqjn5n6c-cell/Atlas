"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Database, Download, FileCheck2, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getLocalToPrismaMigrationStatusAction,
  importLocalBundleToPrismaAction
} from "@/lib/actions/local-to-prisma-migration-actions";
import { exportLocalAtlasData, summarizeLocalExport } from "@/lib/migration/local-exporter";
import { validateLocalMigrationBundle } from "@/lib/migration/local-migration-validator";
import type {
  LocalMigrationBundle,
  LocalMigrationReport,
  LocalMigrationValidationResult
} from "@/types/local-to-prisma-migration";

type MigrationStatus = {
  dataMode: "mock" | "local" | "prisma";
  prismaEnabled: boolean;
  databaseUrlConfigured: boolean;
};

export function LocalToPrismaMigrationPanel() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [bundle, setBundle] = useState<LocalMigrationBundle | null>(null);
  const [validation, setValidation] = useState<LocalMigrationValidationResult | null>(null);
  const [report, setReport] = useState<LocalMigrationReport | null>(null);
  const [message, setMessage] = useState("");
  const summary = useMemo(() => (bundle ? summarizeLocalExport(bundle) : null), [bundle]);
  const canImport = Boolean(status?.prismaEnabled && status.databaseUrlConfigured && validation?.valid && bundle);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      const nextBundle = exportLocalAtlasData();
      setBundle(nextBundle);
      setValidation(validateLocalMigrationBundle(nextBundle));
      setStatus(await getLocalToPrismaMigrationStatusAction());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function refreshExport() {
    const nextBundle = exportLocalAtlasData();
    setBundle(nextBundle);
    setValidation(null);
    setReport(null);
    setMessage("Export local regenere. Aucune donnee n'a ete modifiee.");
  }

  function validateBundle() {
    if (!bundle) return;

    const nextValidation = validateLocalMigrationBundle(bundle);
    setValidation(nextValidation);
    setMessage(nextValidation.valid ? "Bundle valide pour tentative d'import controlee." : "Bundle invalide : corrigez les erreurs avant import.");
  }

  function downloadBundle() {
    if (!bundle) return;

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${bundle.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Export JSON genere localement. Conservez-le prudemment.");
  }

  async function importBundle() {
    if (!bundle || !canImport) return;

    const result = await importLocalBundleToPrismaAction(bundle);
    setReport(result.report);
    setMessage(result.report.success ? "Import Prisma best effort termine." : "Import termine avec avertissements ou erreurs.");
  }

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Migration locale vers Prisma</CardTitle>
          <Badge>Admin</Badge>
          <Badge>Explicite</Badge>
          <Badge>Best effort</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-950">Donnees potentiellement sensibles</p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                L&apos;export JSON peut contenir des KPI, decisions, memoire metier et donnees operationnelles. Les mots de passe SQL sont masques. Ne partagez pas cet export publiquement.
              </p>
            </div>
          </div>
        </div>

        {!mounted ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Analyse des donnees locales disponibles.
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-line bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Mode donnees</p>
                <p className="mt-2 text-sm font-semibold text-ink">{status?.dataMode ?? "inconnu"}</p>
              </div>
              <div className="rounded-md border border-line bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">DATABASE_URL</p>
                <p className="mt-2 text-sm font-semibold text-ink">{status?.databaseUrlConfigured ? "Configuree" : "Absente"}</p>
              </div>
              <div className="rounded-md border border-line bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Donnees locales</p>
                <p className="mt-2 text-sm font-semibold text-ink">{summary?.totalRecords ?? 0} enregistrement(s)</p>
              </div>
            </div>

            {summary ? (
              <div className="rounded-md border border-line bg-white p-4">
                <p className="text-sm font-semibold text-ink">{summary.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{summary.summary}</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {bundle?.domains.map((domain) => (
                    <div key={domain.domain} className="flex items-center justify-between rounded-md border border-line bg-slate-50 px-3 py-2 text-sm">
                      <span className="text-slate-600">{domain.domain}</span>
                      <Badge>{domain.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button onClick={refreshExport}>
                <Database className="h-4 w-4" aria-hidden="true" />
                Exporter les donnees locales
              </Button>
              <Button onClick={downloadBundle} disabled={!bundle}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Telecharger JSON
              </Button>
              <Button onClick={validateBundle} disabled={!bundle}>
                <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                Valider le bundle
              </Button>
              <Button onClick={importBundle} disabled={!canImport}>
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Importer vers Prisma
              </Button>
            </div>

            {!canImport ? (
              <p className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
                Import Prisma desactive : il faut `DATA_MODE=prisma`, `DATABASE_URL` configuree et un bundle valide. Aucun import automatique n&apos;est declenche.
              </p>
            ) : null}

            {message ? <p className="rounded-md border border-line bg-white p-3 text-sm text-slate-600">{message}</p> : null}

            {validation ? (
              <div className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={validation.valid ? "success" : "danger"}>
                    {validation.valid ? "Validation OK" : "Validation KO"}
                  </Badge>
                  <Badge>{validation.errors.length} erreur(s)</Badge>
                  <Badge>{validation.warnings.length} avertissement(s)</Badge>
                </div>
                {[...validation.errors, ...validation.warnings].length > 0 ? (
                  <ul className="mt-3 space-y-1">
                    {[...validation.errors, ...validation.warnings].slice(0, 8).map((item, index) => (
                      <li key={`migration-validation-${index}-${item}`} className="text-sm text-slate-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {report ? (
              <div className="rounded-md border border-line bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={report.success ? "success" : "warning"}>{report.success ? "Import reussi" : "Import partiel"}</Badge>
                  <Badge>{report.domainResults.reduce((total, domain) => total + domain.imported, 0)} importe(s)</Badge>
                  <Badge>{report.domainResults.reduce((total, domain) => total + domain.failed, 0)} echec(s)</Badge>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {report.domainResults.map((domain) => (
                    <div key={`migration-report-${domain.domain}`} className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="font-medium text-ink">{domain.domain}</p>
                      <p className="mt-1">Tentes {domain.attempted}, importes {domain.imported}, ignores {domain.skipped}, echecs {domain.failed}.</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
