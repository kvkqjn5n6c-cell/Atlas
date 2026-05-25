import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LocalImportSummary } from "@/types/data-import";

export function LocalImportSummary({ summary }: { summary: LocalImportSummary | null }) {
  if (!summary) return null;

  return (
    <Card className="border-brand-100 bg-brand-50/40">
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Résumé import local</CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              ImportJob simulé généré en local. Aucune donnée n&apos;est enregistrée en base.
            </p>
          </div>
          <Badge variant={summary.importJob.status === "completed" ? "success" : "warning"}>
            persisted: false
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["Lignes lues", summary.rowsRead],
            ["Colonnes détectées", summary.columnsDetected],
            ["Colonnes mappées", summary.mappedColumns],
            ["Colonnes non utilisées", summary.unmappedColumns]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-line bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-line bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-500">Score qualité mapping</span>
            <span className="font-semibold text-ink">{summary.qualityScore}%</span>
          </div>
          <Progress value={summary.qualityScore} />
        </div>

        <div className="rounded-md border border-line bg-white p-4 text-sm text-slate-700">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Import local simulé : {summary.importJob.id}
          </div>
          <p className="mt-2">
            Statut : {summary.importJob.status} · Durée : {summary.importJob.durationSeconds}s · Déclenchement : manuel
          </p>
          {summary.validationWarnings.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {summary.validationWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2">Le fichier est exploitable pour préparer une configuration KPI.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
