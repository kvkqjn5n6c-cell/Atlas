"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { atlasFieldOptions, validateLocalMapping } from "@/lib/data-pipeline/mapping-suggestions";
import type { LocalColumnMapping } from "@/types/data-import";

export function LocalMappingPanel({
  mappings,
  onChange
}: {
  mappings: LocalColumnMapping[];
  onChange: (mappings: LocalColumnMapping[]) => void;
}) {
  const validation = validateLocalMapping(mappings);

  function updateMapping(sourceColumn: string, atlasField: LocalColumnMapping["atlasField"]) {
    onChange(
      mappings.map((mapping) =>
        mapping.sourceColumn === sourceColumn ? { ...mapping, atlasField } : mapping
      )
    );
  }

  if (mappings.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Mapping manuel</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Associez les colonnes du fichier aux champs Atlas. Rien n&apos;est enregistré.
            </p>
          </div>
          <Badge variant={validation.qualityScore >= 70 ? "success" : "warning"}>
            Qualité mapping : {validation.qualityScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {mappings.map((mapping) => (
            <label key={mapping.sourceColumn} className="rounded-md border border-line bg-slate-50 p-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {mapping.sourceColumn}
              </span>
              <select
                value={mapping.atlasField}
                onChange={(event) =>
                  updateMapping(mapping.sourceColumn, event.target.value as LocalColumnMapping["atlasField"])
                }
                className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
              >
                {atlasFieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {validation.warnings.length > 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Limites détectées</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {validation.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            Mapping exploitable pour un import local de test.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
