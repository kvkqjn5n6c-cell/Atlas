"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPotentialKpiImpacts } from "@/lib/data-pipeline/kpi-impact";
import {
  atlasFieldOptions,
  getEffectiveAtlasField,
  getMappingDisplayLabel,
  getMappingFieldType,
  validateLocalMapping
} from "@/lib/data-pipeline/mapping-suggestions";
import { clearLastLocalImport, getLastLocalImport, saveLastLocalImport } from "@/lib/local/local-import-store";
import { formatAtlasField } from "@/lib/formatters/status-labels";
import { registerBusinessFieldUsage } from "@/lib/local/business-dictionary-store";
import { registerBusinessFieldUsageAction } from "@/lib/actions/business-dictionary-actions";
import type { AtlasField } from "@/types/atlas";
import type { KpiImpactCandidate } from "@/lib/data-pipeline/kpi-impact";
import type { LocalValidatedColumnMapping, LocalValidatedImport, MappingFieldType } from "@/types/data-import";
import { CreateKpiFromImportPanel } from "./create-kpi-from-import-panel";

type LocalCorrectionLog = {
  id: string;
  date: string;
  column: string;
  previousValue: string;
  nextValue: string;
  action: "mapping modifié" | "colonne ignorée" | "champ personnalisé" | "correction validée";
  persisted: false;
};

type KpiCreationSelection =
  | { mode: "candidate"; candidate: KpiImpactCandidate }
  | { mode: "column"; mapping: LocalValidatedColumnMapping };

const mappingStatusVariant = {
  mapped: "success",
  ignored: "default",
  "to-review": "warning"
} as const;

function getMappingStatus(mapping: LocalValidatedColumnMapping) {
  const fieldType = getMappingFieldType(mapping);
  if (fieldType === "unused") return "ignored";
  if (fieldType === "custom" && !mapping.customFieldLabel?.trim()) return "to-review";
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

function formatMappingValue(mapping: LocalValidatedColumnMapping) {
  const fieldType = getMappingFieldType(mapping);
  if (fieldType === "custom") return mapping.customFieldLabel?.trim() || "Champ personnalisé sans nom";
  if (fieldType === "unused") return "Non utilisé";
  return formatAtlasField(getEffectiveAtlasField(mapping));
}

export function LocalImportSupervision() {
  const [localImport, setLocalImport] = useState<LocalValidatedImport | null>(null);
  const [corrections, setCorrections] = useState<LocalCorrectionLog[]>([]);
  const [kpiSelection, setKpiSelection] = useState<KpiCreationSelection | null>(null);
  const [localKpiSavedCount, setLocalKpiSavedCount] = useState(0);

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
    previousValue: string,
    nextValue: string,
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

  function updateMapping(sourceColumn: string, patch: Partial<LocalValidatedColumnMapping>, action: LocalCorrectionLog["action"]) {
    if (!localImport) return;
    const previousMapping = localImport.mappings.find((mapping) => mapping.sourceColumn === sourceColumn);
    if (!previousMapping) return;

    const nextMappings = localImport.mappings.map((mapping) =>
      mapping.sourceColumn === sourceColumn ? { ...mapping, ...patch } : mapping
    );
    const nextMapping = nextMappings.find((mapping) => mapping.sourceColumn === sourceColumn) ?? previousMapping;

    if (getMappingFieldType(nextMapping) === "custom" && nextMapping.customFieldLabel?.trim()) {
      const dictionaryField = registerBusinessFieldUsage({
        organizationId: localImport.simulatedImportJob.organizationId,
        label: nextMapping.customFieldLabel,
        sourceColumn: nextMapping.sourceColumn,
        detectedType: nextMapping.detectedType,
        tags: ["mapping-local"]
      });
      if (dictionaryField) {
        nextMapping.dictionaryFieldId = dictionaryField.id;
        nextMapping.dictionaryConfidence = 100;
        nextMapping.dictionaryReason = "Champ métier mémorisé localement.";
      }
      void registerBusinessFieldUsageAction({
        organizationId: localImport.simulatedImportJob.organizationId,
        label: nextMapping.customFieldLabel,
        sourceColumn: nextMapping.sourceColumn,
        detectedType: nextMapping.detectedType,
        tags: ["mapping-local"]
      });
    }

    addCorrection(sourceColumn, formatMappingValue(previousMapping), formatMappingValue(nextMapping), action);
    persistImport({ ...localImport, mappings: nextMappings });
  }

  function updateFieldType(mapping: LocalValidatedColumnMapping, fieldType: MappingFieldType) {
    if (fieldType === "unused") {
      updateMapping(
        mapping.sourceColumn,
        { fieldType: "unused", atlasField: "NonMappe", mappedAtlasField: "NonMappe", customFieldLabel: undefined },
        "colonne ignorée"
      );
      return;
    }

    if (fieldType === "custom") {
      updateMapping(
        mapping.sourceColumn,
        { fieldType: "custom", atlasField: "NonMappe", mappedAtlasField: "NonMappe", customFieldLabel: mapping.customFieldLabel ?? "" },
        "champ personnalisé"
      );
      return;
    }

    const fallbackField = mapping.mappedAtlasField && mapping.mappedAtlasField !== "NonMappe" ? mapping.mappedAtlasField : "Tresorerie";
    updateMapping(
      mapping.sourceColumn,
      { fieldType: "standard", atlasField: fallbackField, mappedAtlasField: fallbackField, customFieldLabel: undefined },
      "mapping modifié"
    );
  }

  function updateStandardField(mapping: LocalValidatedColumnMapping, atlasField: AtlasField) {
    updateMapping(
      mapping.sourceColumn,
      { fieldType: "standard", atlasField, mappedAtlasField: atlasField, customFieldLabel: undefined },
      "mapping modifié"
    );
  }

  function clearImport() {
    clearLastLocalImport();
    setLocalImport(null);
    setCorrections([]);
    setKpiSelection(null);
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
                Atlas a détecté {localImport.columnsDetected} colonnes. Vous pouvez utiliser un champ Atlas standard,
                créer un champ personnalisé ou créer un KPI directement depuis une colonne.
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
              Atlas standardise sans bloquer les colonnes métier spécifiques à votre fichier.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Colonne source</th>
                    <th className="px-4 py-3 font-medium">Type détecté</th>
                    <th className="px-4 py-3 font-medium">Mode</th>
                    <th className="px-4 py-3 font-medium">Champ Atlas standard</th>
                    <th className="px-4 py-3 font-medium">Nom métier du champ</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {localImport.mappings.map((mapping) => {
                    const fieldType = getMappingFieldType(mapping);
                    const status = getMappingStatus(mapping);

                    return (
                      <tr key={mapping.sourceColumn} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-ink">{mapping.sourceColumn}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="space-y-1">
                            <p>{mapping.detectedType}</p>
                            {mapping.dictionaryFieldId ? (
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="brand">Reconnu</Badge>
                                <Badge variant="success">Confiance {mapping.dictionaryConfidence}%</Badge>
                              </div>
                            ) : null}
                            {mapping.dictionaryReason ? (
                              <p className="text-xs text-slate-500">{mapping.dictionaryReason}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={fieldType}
                            onChange={(event) => updateFieldType(mapping, event.target.value as MappingFieldType)}
                            className="h-9 min-w-44 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
                          >
                            <option value="standard">Champ Atlas standard</option>
                            <option value="custom">Champ personnalisé</option>
                            <option value="unused">Non utilisé</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={getEffectiveAtlasField(mapping)}
                            disabled={fieldType !== "standard"}
                            onChange={(event) => updateStandardField(mapping, event.target.value as AtlasField)}
                            className="h-9 min-w-48 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            {atlasFieldOptions.filter((option) => option.value !== "NonMappe").map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={mapping.customFieldLabel ?? ""}
                            disabled={fieldType !== "custom"}
                            onChange={(event) =>
                              updateMapping(
                                mapping.sourceColumn,
                                { customFieldLabel: event.target.value, fieldType: "custom", atlasField: "NonMappe", mappedAtlasField: "NonMappe" },
                                "champ personnalisé"
                              )
                            }
                            placeholder="Ex : Coût sous-traitance"
                            className="h-9 min-w-56 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={mappingStatusVariant[status]}>{formatMappingStatus(status)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="h-8"
                              onClick={() => addCorrection(mapping.sourceColumn, formatMappingValue(mapping), formatMappingValue(mapping), "correction validée")}
                            >
                              Valider
                            </Button>
                            <Button className="h-8" onClick={() => updateFieldType(mapping, "unused")}>
                              Non utilisé
                            </Button>
                            <Button className="h-8" variant="primary" onClick={() => setKpiSelection({ mode: "column", mapping })}>
                              Créer un KPI
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
            <CardTitle>KPI suggérés par Atlas</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Estimation déterministe à partir des champs Atlas standards présents.
            </p>
            {localKpiSavedCount > 0 ? (
              <Badge variant="success">{localKpiSavedCount} KPI local créé</Badge>
            ) : null}
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
                  <Button className="mt-3 h-8" onClick={() => setKpiSelection({ mode: "candidate", candidate: impact })}>
                    Créer un KPI
                  </Button>
                </article>
              ))
            ) : (
              <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
                Aucun KPI standard détecté. Vous pouvez créer un KPI directement depuis une colonne.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {kpiSelection ? (
        <CreateKpiFromImportPanel
          importData={localImport}
          candidate={kpiSelection.mode === "candidate" ? kpiSelection.candidate : undefined}
          mapping={kpiSelection.mode === "column" ? kpiSelection.mapping : undefined}
          onSaved={() => setLocalKpiSavedCount((current) => current + 1)}
        />
      ) : null}

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
                      <td className="px-4 py-3 text-slate-600">{correction.previousValue}</td>
                      <td className="px-4 py-3 text-slate-600">{correction.nextValue}</td>
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
