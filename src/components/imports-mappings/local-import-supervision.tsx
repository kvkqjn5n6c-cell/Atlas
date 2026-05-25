"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPotentialKpiImpacts } from "@/lib/data-pipeline/kpi-impact";
import { atlasFieldOptions, validateLocalMapping } from "@/lib/data-pipeline/mapping-suggestions";
import { clearLastLocalImport, getLastLocalImport, saveLastLocalImport } from "@/lib/local/local-import-store";
import { formatAtlasField } from "@/lib/formatters/status-labels";
import type { AtlasField } from "@/types/atlas";
import type { LocalValidatedColumnMapping, LocalValidatedImport } from "@/types/data-import";

type LocalCorrectionLog = {
  id: string;
  date: string;
  column: string;
  previousValue: AtlasField;
  nextValue: AtlasField;
  action: "mapping modifié" | "colonne ignorée" | "correction validée";
  persisted: false;
};

const mappingStatusVariant = {
  mapped: "success",
  ignored: "default",
  "to-review": "warning"
} as const;

function getMappingStatus(mapping: LocalValidatedColumnMapping) {
  if (mapping.atlasField === "NonMappe") return "ignored";
  if (mapping.detectedType === "empty") return "to-review";
  return "mapped";
}

function formatMappingStatus(status: ReturnType<typeof getMappingStatus>) {
  const labels = {
    mapped: "Mappé",
    ignored: "Non utilisé",
    "to-review": "À vérifier"
  };

  return labels[status];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function LocalImportSupervision() {
  const [localImport, setLocalImport] = useState<LocalValidatedImport | null>(null);
  const [corrections, setCorrections] = useState<LocalCorrectionLog[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLocalImport(getLastLocalImport());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const kpiImpacts = useMemo(
    () => (localImport ? getPotentialKpiImpacts(localImport.mappings) : []),
    [localImport]
  );

  function persistImport(nextImport: LocalValidatedImport) {
    const validation = validateLocalMapping(nextImport.mappings);
    const updatedImport = {
      ...nextImport,
      mappedColumns: validation.mappedColumns,
      unmappedColumns: validation.unmappedColumns.length,
      mappingQualityScore: validation.qualityScore,
      persisted: false as const
    };

    saveLastLocalImport(updatedImport);
    setLocalImport(updatedImport);
  }

  function addCorrection(
    column: string,
    previousValue: AtlasField,
    nextValue: AtlasField,
    action: LocalCorrectionLog["action"]
  ) {
    setCorrections((current) => [
      {
        id: `local-correction-${Date.now()}-${column}`,
        date: new Date().toISOString(),
        column,
        previousValue,
        nextValue,
        action,
        persisted: false
      },
      ...current
    ]);
  }

  function updateMapping(sourceColumn: string, atlasField: AtlasField, action: LocalCorrectionLog["action"]) {
    if (!localImport) return;
    const previousMapping = localImport.mappings.find((mapping) => mapping.sourceColumn === sourceColumn);
    if (!previousMapping) return;

    if (previousMapping.atlasField === atlasField && action === "correction validée") {
      addCorrection(sourceColumn, previousMapping.atlasField, atlasField, action);
      return;
    }

    if (previousMapping.atlasField === atlasField) return;

    const nextMappings = localImport.mappings.map((mapping) =>
      mapping.sourceColumn === sourceColumn ? { ...mapping, atlasField } : mapping
    );

    addCorrection(sourceColumn, previousMapping.atlasField, atlasField, action);
    persistImport({ ...localImport, mappings: nextMappings });
  }

  function clearImport() {
    clearLastLocalImport();
    setLocalImport(null);
    setCorrections([]);
  }

  if (!localImport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dernier import local</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Aucun import CSV local n&apos;est prêt pour supervision.
          </p>
        </CardHeader>
        <CardContent>
          <Link
            href="/data-sources"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Importer un CSV de test
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <Card className="border-brand-100">
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">Dernier import local</Badge>
                <Badge>Non persisté</Badge>
                <Badge variant={localImport.mappingQualityScore >= 70 ? "success" : "warning"}>
                  Qualité mapping : {localImport.mappingQualityScore}%
                </Badge>
              </div>
              <CardTitle className="mt-3">{localImport.fileName}</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Atlas a détecté {localImport.columnsDetected} colonnes, dont {localImport.mappedColumns} peuvent
                alimenter des champs Atlas. Cette supervision reste locale et prépare un futur passage en base.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/data-sources"
                className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Retourner aux sources
              </Link>
              <Button onClick={clearImport}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Effacer l&apos;import local
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {[
              ["Date", formatDate(localImport.createdAt)],
              ["Lignes lues", localImport.rowsRead.toLocaleString("fr-FR")],
              ["Colonnes détectées", localImport.columnsDetected],
              ["Mappées", localImport.mappedColumns],
              ["Non utilisées", localImport.unmappedColumns]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-line bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Superviser le mapping local</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Modifiez les champs Atlas, ignorez les colonnes inutiles ou validez les corrections.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="min-w-[900px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Colonne source</th>
                    <th className="px-4 py-3 font-medium">Type détecté</th>
                    <th className="px-4 py-3 font-medium">Champ Atlas</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {localImport.mappings.map((mapping) => {
                    const status = getMappingStatus(mapping);

                    return (
                      <tr key={mapping.sourceColumn} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-ink">{mapping.sourceColumn}</td>
                        <td className="px-4 py-3 text-slate-600">{mapping.detectedType}</td>
                        <td className="px-4 py-3">
                          <select
                            value={mapping.atlasField}
                            onChange={(event) =>
                              updateMapping(
                                mapping.sourceColumn,
                                event.target.value as AtlasField,
                                "mapping modifié"
                              )
                            }
                            className="h-9 min-w-48 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
                          >
                            {atlasFieldOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={mappingStatusVariant[status]}>{formatMappingStatus(status)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="h-8"
                              onClick={() =>
                                updateMapping(mapping.sourceColumn, mapping.atlasField, "correction validée")
                              }
                            >
                              Valider
                            </Button>
                            <Button
                              className="h-8"
                              onClick={() => updateMapping(mapping.sourceColumn, "NonMappe", "colonne ignorée")}
                            >
                              Non utilisé
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KPI alimentables</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Estimation déterministe à partir des champs Atlas présents.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {kpiImpacts.length > 0 ? (
              kpiImpacts.map((impact) => (
                <article key={impact.id} className="rounded-md border border-line bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-ink">{impact.name}</h3>
                    <Badge variant={impact.confidence === "élevée" ? "success" : "warning"}>
                      Confiance {impact.confidence}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{impact.businessNote}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    Présents : {impact.requiredFieldsPresent.map(formatAtlasField).join(", ") || "-"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Manquants : {impact.missingFields.map(formatAtlasField).join(", ") || "aucun"}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
                Aucun KPI alimentable détecté. Mappez au moins une date ou un champ métier mesurable.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Journal local des corrections</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Historique non persisté des corrections effectuées sur ce poste.</p>
        </CardHeader>
        <CardContent>
          {corrections.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="min-w-[820px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Colonne</th>
                    <th className="px-4 py-3 font-medium">Ancienne valeur</th>
                    <th className="px-4 py-3 font-medium">Nouvelle valeur</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Persistance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {corrections.map((correction) => (
                    <tr key={correction.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{formatDate(correction.date)}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{correction.column}</td>
                      <td className="px-4 py-3 text-slate-600">{formatAtlasField(correction.previousValue)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatAtlasField(correction.nextValue)}</td>
                      <td className="px-4 py-3 text-slate-600">{correction.action}</td>
                      <td className="px-4 py-3"><Badge>persisted: false</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
              Aucune correction locale pour l&apos;instant.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
