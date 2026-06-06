"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DatabaseZap, TableProperties } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveAtlasDatasetAction } from "@/lib/actions/dataset-persistence-actions";
import type { PreparedSqlSourceBundle } from "@/lib/connectors/sql/sql-prepared-source-types";
import { createDatasetFromPreparedSource, summarizeDataset } from "@/lib/datasets/atlas-dataset-engine";
import type { AtlasDataset } from "@/lib/datasets/atlas-dataset-types";
import { recordDatasetGenerated } from "@/lib/journal/decision-journal-engine";
import { getDatasets, saveDataset } from "@/lib/local/atlas-datasets-store";
import { getPreparedSqlSources } from "@/lib/local/sql-prepared-sources-store";

function scoreVariant(score: number) {
  if (score >= 80) return "success";
  if (score >= 55) return "warning";
  return "danger";
}

export function PreparedSqlSourcesSection() {
  const [mounted, setMounted] = useState(false);
  const [sources, setSources] = useState<PreparedSqlSourceBundle[]>([]);
  const [datasets, setDatasets] = useState<AtlasDataset[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSources(getPreparedSqlSources());
      setDatasets(getDatasets());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function generateDataset(bundle: PreparedSqlSourceBundle) {
    const dataset = createDatasetFromPreparedSource(bundle);
    const saved = saveDataset(dataset);
    void saveAtlasDatasetAction({
      dataset: saved,
      organizationId: bundle.source.organizationId
    });
    recordDatasetGenerated(saved);
    setDatasets(getDatasets());
    setMessage(`${saved.displayName} genere localement depuis la preview SQL.`);
  }

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Sources SQL preparees</CardTitle>
          <Badge>{mounted ? sources.length : 0}</Badge>
          <Badge>Lecture preview uniquement</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? <p className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">{message}</p> : null}
        {!mounted ? (
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Chargement des sources SQL preparees locales.
          </p>
        ) : sources.length === 0 ? (
          <div className="rounded-md border border-line bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Pipeline futur</Badge>
              <Badge>LocalStorage</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Aucune source SQL preparee. Creez un mapping SQL puis transformez-le en source exploitable par le futur pipeline Atlas.
            </p>
            <Link
              href="/sql-mappings"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ouvrir Mapping SQL
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-3 lg:grid-cols-2">
              {sources.map(({ source, preview }) => {
                const linkedDataset = datasets.find((dataset) => dataset.sourceId === source.id);

                return (
                <article key={source.id} className="rounded-md border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={scoreVariant(source.qualityScore)}>Score {source.qualityScore}/100</Badge>
                    <Badge variant="success">Prete pour pipeline Atlas</Badge>
                    <Badge>{source.availableAtlasFields.length} champ(s)</Badge>
                    <Badge>{preview.rows.length} ligne(s) preview</Badge>
                    {linkedDataset ? <Badge variant="brand">Dataset genere</Badge> : null}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{source.displayName}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Champs Atlas disponibles : {source.availableAtlasFields.map((field) => field.label).join(", ")}.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Table : {source.schema ? `${source.schema}.` : ""}{source.tableName}. Mapping : {source.mappingId}.
                  </p>
                  {source.warnings.length > 0 ? (
                    <p className="mt-2 text-xs leading-5 text-amber-700">
                      {source.warnings.slice(0, 2).join(" ")}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-slate-500">Preparation : {new Date(source.updatedAt).toLocaleString("fr-FR")}</p>
                  {linkedDataset ? (
                    <p className="mt-3 rounded-md border border-brand-100 bg-brand-50 p-3 text-xs leading-5 text-brand-700">
                      {summarizeDataset(linkedDataset).executiveSummary}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={() => generateDataset({ source, preview })}>
                      <TableProperties className="h-4 w-4" aria-hidden="true" />
                      Generer Dataset Atlas
                    </Button>
                    <Button disabled>
                      <DatabaseZap className="h-4 w-4" aria-hidden="true" />
                      Utiliser dans le pipeline Atlas - Phase suivante
                    </Button>
                  </div>
                </article>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/sql-mappings"
                className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Gerer les mappings SQL
              </Link>
            <Link
              href="/datasets"
              className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Voir les datasets
            </Link>
            <Link
              href="/dataset-pipeline"
              className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir le pipeline Dataset
            </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
