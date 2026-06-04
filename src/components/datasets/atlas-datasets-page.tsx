"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TableProperties } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDatasetStatistics, summarizeDataset, validateDataset } from "@/lib/datasets/atlas-dataset-engine";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import { getDatasets } from "@/lib/local/atlas-datasets-store";

function scoreVariant(score: number) {
  if (score >= 80) return "success";
  if (score >= 55) return "warning";
  return "danger";
}

function valueToText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function AtlasDatasetsPage() {
  const [mounted, setMounted] = useState(false);
  const [datasets, setDatasets] = useState<AtlasDataset[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDatasets(getDatasets());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Datasets Atlas</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Chargement des datasets locaux.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Datasets Atlas</Badge>
              <Badge>Temporaire</Badge>
              <Badge>Preview SQL uniquement</Badge>
              <Badge>LocalStorage</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Donnees SQL normalisees pour Atlas
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Les datasets Atlas convertissent une source SQL preparee en records normalises par champs Atlas. Cette page ne cree aucun KPI et ne lit jamais toute la table SQL.
            </p>
          </div>
          <Link
            href="/data-sources"
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Retour sources de donnees
          </Link>
        </div>
      </section>

      {datasets.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Aucun dataset</Badge>
              <Badge>Pipeline futur</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Aucune donnee locale suffisante. Preparez une source SQL depuis Mapping SQL, puis generez un Dataset Atlas depuis Sources de donnees.
            </p>
            <Link
              href="/data-sources"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Ouvrir sources de donnees
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {datasets.map((dataset) => {
            const validation = validateDataset(dataset);
            const statistics = getDatasetStatistics(dataset);
            const summary = summarizeDataset(dataset);

            return (
              <Card key={dataset.id} className="border-brand-100">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{dataset.displayName}</CardTitle>
                    <Badge variant={scoreVariant(dataset.qualityScore)}>Score {dataset.qualityScore}/100</Badge>
                    <Badge>{dataset.rowCount} ligne(s)</Badge>
                    <Badge>{dataset.fields.length} champ(s)</Badge>
                    <Badge variant={validation.valid ? "success" : "danger"}>
                      {validation.valid ? "Exploitable localement" : "Incomplet"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 lg:grid-cols-4">
                    <div className="rounded-md border border-line bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completude</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{statistics.completeness}%</p>
                    </div>
                    <div className="rounded-md border border-line bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Valeurs manquantes</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{statistics.missingValues}</p>
                    </div>
                    <div className="rounded-md border border-line bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Champs mappes</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{statistics.mappedFields}</p>
                    </div>
                    <div className="rounded-md border border-line bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Generation</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{new Date(dataset.createdAt).toLocaleString("fr-FR")}</p>
                    </div>
                  </div>

                  <div className="rounded-md border border-line bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-ink">Resume dirigeant</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{summary.executiveSummary}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{summary.technicalSummary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dataset.fields.map((field) => (
                      <Badge key={`${dataset.id}-${field.key}-${field.sourceColumn}`}>
                        {field.label} - {field.atlasType}
                      </Badge>
                    ))}
                  </div>

                  {[...validation.errors, ...statistics.warnings].length > 0 ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-950">Warnings qualite</p>
                      <ul className="mt-2 space-y-1">
                        {[...validation.errors, ...statistics.warnings].slice(0, 8).map((warning, index) => (
                          <li key={`${dataset.id}-warning-${index}`} className="text-sm text-amber-800">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="overflow-x-auto rounded-lg border border-line">
                    <table className="min-w-[900px] w-full border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          {dataset.fields.map((field) => (
                            <th key={`${dataset.id}-head-${field.key}-${field.sourceColumn}`} className="px-4 py-3 font-medium">
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line bg-white">
                        {dataset.records.slice(0, 10).map((record) => (
                          <tr key={record.id} className="align-top transition hover:bg-slate-50">
                            {dataset.fields.map((field) => (
                              <td key={`${record.id}-${field.key}-${field.sourceColumn}`} className="px-4 py-3 text-slate-600">
                                {valueToText(record.values[field.key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button disabled>
                    <TableProperties className="h-4 w-4" aria-hidden="true" />
                    Creer KPI depuis ce dataset - Phase suivante
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
