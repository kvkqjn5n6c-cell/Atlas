"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateBusinessDictionaryField } from "@/lib/local/business-dictionary-store";
import { updateBusinessDictionaryFieldAction } from "@/lib/actions/business-dictionary-actions";
import type { BusinessDictionaryField } from "@/types/business-dictionary";

export function BusinessFieldDetails({
  field,
  onUpdated
}: {
  field?: BusinessDictionaryField;
  onUpdated: () => void;
}) {
  const [label, setLabel] = useState(field?.label ?? "");

  if (!field) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détail champ métier</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
            Sélectionnez un champ pour voir ses colonnes sources, KPI liés et exemples.
          </p>
        </CardContent>
      </Card>
    );
  }

  function renameField() {
    if (!field) return;
    const updatedField = { ...field, label };
    updateBusinessDictionaryField(updatedField);
    void updateBusinessDictionaryFieldAction(updatedField);
    onUpdated();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Détail champ métier</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Vocabulaire local réutilisable dans les imports futurs.</p>
          </div>
          <Badge>persisted: false</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block rounded-md border border-line bg-slate-50 p-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Renommer</span>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
          />
        </label>
        <Button variant="primary" onClick={renameField}>Renommer le champ</Button>

        <div className="rounded-md border border-line bg-white p-4 text-sm text-slate-700">
          <p className="font-semibold text-ink">Colonnes source connues</p>
          <p className="mt-2">{field.sourceColumns.join(", ")}</p>
        </div>

        <div className="rounded-md border border-line bg-white p-4 text-sm text-slate-700">
          <p className="font-semibold text-ink">KPI liés</p>
          <p className="mt-2">{field.linkedKpis.length > 0 ? field.linkedKpis.join(", ") : "Aucun KPI lié"}</p>
        </div>

        <div className="rounded-md border border-line bg-white p-4 text-sm text-slate-700">
          <p className="font-semibold text-ink">Exemples</p>
          <p className="mt-2">{field.examples?.length ? field.examples.join(", ") : "Aucun exemple enregistré"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
