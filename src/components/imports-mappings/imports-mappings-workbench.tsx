"use client";

import { CheckCircle2, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { validateColumnMappingAction } from "@/lib/actions/admin-actions";
import { formatAtlasField, formatMappingStatus } from "@/lib/formatters/status-labels";
import { dataSourcesMock } from "@/lib/mock/data-sources";
import { mappingReviewsMock } from "@/lib/mock/mapping-reviews";
import { performanceKpisMock } from "@/lib/mock/kpis";
import { organizationsMock } from "@/lib/mock/organizations";
import type { ActionResult, AtlasField, ColumnMappingDraft, MappingReview } from "@/types/atlas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const atlasFields: AtlasField[] = [
  "Date",
  "ChiffreAffaires",
  "Marge",
  "Region",
  "StatutMission",
  "Client",
  "Tresorerie",
  "Intervention",
  "Qualite",
  "NonMappe"
];

type LocalReview = MappingReview & {
  selectedAtlasField: AtlasField;
  localStatus: "to-review" | "mapped" | "ignored";
};

type CorrectionLog = {
  date: string;
  source: string;
  correction: string;
  user: string;
  impact: string;
};

const initialCorrections: CorrectionLog[] = [
  {
    date: "25/05/2026 09:42",
    source: "Export facturation mensuel",
    correction: "region_vente mappée vers Région",
    user: "Camille Bernard",
    impact: "Analyse CA par zone fiabilisee"
  },
  {
    date: "24/05/2026 18:58",
    source: "Tableau marge commerciale",
    correction: "marge_brute mappée vers Marge",
    user: "Remi Laurent",
    impact: "KPI marge brute recalculable"
  },
  {
    date: "23/05/2026 12:18",
    source: "Retours interventions terrain",
    correction: "score_service marqué à vérifier",
    user: "Nadia Moreau",
    impact: "Rapport qualité maintenu en brouillon"
  }
];

const statusVariant = {
  "to-review": "warning",
  mapped: "success",
  ignored: "default"
} as const;

export function ImportsMappingsWorkbench() {
  const [reviews, setReviews] = useState<LocalReview[]>(
    mappingReviewsMock.map((review) => ({
      ...review,
      selectedAtlasField: review.suggestedAtlasField,
      localStatus: "to-review"
    }))
  );
  const [selectedId, setSelectedId] = useState(reviews[0]?.id ?? "");
  const [corrections, setCorrections] = useState(initialCorrections);
  const [result, setResult] = useState<ActionResult<ColumnMappingDraft> | null>(null);

  const selected = reviews.find((review) => review.id === selectedId) ?? reviews[0];

  const selectedContext = useMemo(() => {
    const source = dataSourcesMock.find((item) => item.id === selected?.dataSourceId);
    const organization = organizationsMock.find((item) => item.id === selected?.organizationId);
    const kpi = performanceKpisMock.find((item) => item.id === selected?.impactedKpiId);
    return { source, organization, kpi };
  }, [selected]);

  function updateSelectedField(atlasField: AtlasField) {
    setReviews((current) =>
      current.map((review) =>
        review.id === selected.id ? { ...review, selectedAtlasField: atlasField } : review
      )
    );
    setResult(null);
  }

  async function submitMapping(status: "mapped" | "ignored") {
    const input: ColumnMappingDraft = {
      dataSourceId: selected.dataSourceId,
      sourceColumn: selected.sourceColumn,
      detectedType: selected.detectedType,
      atlasField: status === "ignored" ? "NonMappe" : selected.selectedAtlasField,
      status
    };
    const actionResult = await validateColumnMappingAction(input);
    setResult(actionResult);
    if (!actionResult.success) return;

    setReviews((current) =>
      current.map((review) =>
        review.id === selected.id
          ? {
              ...review,
              selectedAtlasField: input.atlasField,
              localStatus: status
            }
          : review
      )
    );
    setCorrections((current) => [
      {
        date: "25/05/2026 10:12",
        source: selectedContext.source?.name ?? selected.dataSourceId,
        correction:
          status === "ignored"
            ? `${selected.sourceColumn} ignorée pour les KPI`
            : `${selected.sourceColumn} mappée vers ${formatAtlasField(input.atlasField)}`,
        user: "Utilisateur actif",
        impact: selected.potentialKpiImpact
      },
      ...current
    ]);
  }

  if (!selected) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mappings à corriger</CardTitle>
          <p className="text-sm text-slate-500">
            Corriger les mappings avant que les rapports soient faussés.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          {reviews.map((review) => {
            const source = dataSourcesMock.find((item) => item.id === review.dataSourceId);
            const organization = organizationsMock.find((item) => item.id === review.organizationId);
            const kpi = performanceKpisMock.find((item) => item.id === review.impactedKpiId);

            return (
              <button
                key={review.id}
                type="button"
                onClick={() => {
                  setSelectedId(review.id);
                  setResult(null);
                }}
                className="rounded-md border border-line bg-slate-50 p-4 text-left transition hover:border-brand-200 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={review.impactLevel === "high" ? "danger" : "warning"}>
                    impact {review.impactLevel}
                  </Badge>
                  <Badge variant={statusVariant[review.localStatus]}>{formatMappingStatus(review.localStatus)}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-ink">{source?.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{organization?.name}</p>
                <p className="mt-3 text-sm font-medium text-ink">
                  Colonne : {review.sourceColumn}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Champ sélectionné : {formatAtlasField(review.selectedAtlasField)}
                </p>
                <p className="mt-2 text-sm text-slate-600">KPI impacté : {kpi?.name ?? "Aucun"}</p>
                <p className="mt-3 text-sm font-medium text-ink">{review.recommendedAction}</p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Journal des corrections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="min-w-[850px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Correction</th>
                    <th className="px-4 py-3 font-medium">Utilisateur</th>
                    <th className="px-4 py-3 font-medium">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {corrections.map((correction) => (
                    <tr key={`${correction.date}-${correction.correction}`} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{correction.date}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{correction.source}</td>
                      <td className="px-4 py-3 text-slate-600">{correction.correction}</td>
                      <td className="px-4 py-3 text-slate-600">{correction.user}</td>
                      <td className="px-4 py-3 font-medium text-ink">{correction.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <label className="block rounded-md border border-line bg-slate-50 p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Colonne source</span>
                <input
                  readOnly
                  value={selected.sourceColumn}
                  className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
                />
              </label>
              <label className="block rounded-md border border-line bg-slate-50 p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Type détecté</span>
                <input
                  readOnly
                  value={selected.detectedType}
                  className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
                />
              </label>
              <label className="block rounded-md border border-line bg-slate-50 p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Champ Atlas sélectionné
                </span>
                <select
                  value={selected.selectedAtlasField}
                  onChange={(event) => updateSelectedField(event.target.value as AtlasField)}
                  className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
                >
                  {atlasFields.map((field) => (
                    <option key={field} value={field}>
                      {formatAtlasField(field)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-md border border-line bg-slate-50 p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Contexte</span>
                <p className="mt-2 text-sm font-semibold text-ink">{selectedContext.organization?.name}</p>
                <p className="mt-1 text-sm text-slate-600">{selectedContext.kpi?.name ?? "KPI non lié"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => void submitMapping("mapped")}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Valider le mapping
              </Button>
              <Button onClick={() => void submitMapping("ignored")}>
                <EyeOff className="h-4 w-4" aria-hidden="true" />
                Ignorer la colonne
              </Button>
              <Badge variant="warning">Simulation mock</Badge>
            </div>

            {result ? (
              <div
                className={`rounded-md border p-3 text-sm ${
                  result.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                <p className="font-semibold">{result.message}</p>
                <p className="mt-1">Mode : {result.mode} - persisté : {result.persisted ? "oui" : "non"}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
