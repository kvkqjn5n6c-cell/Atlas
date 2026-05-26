"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BusinessDictionaryField } from "@/types/business-dictionary";

export function BusinessFieldCard({
  field,
  onSelect,
  onDelete
}: {
  field: BusinessDictionaryField;
  onSelect: (field: BusinessDictionaryField) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{field.label}</h3>
          <p className="mt-1 text-sm text-slate-500">{field.detectedType}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <Badge variant="brand">Champ personnalisé</Badge>
          {field.linkedKpis.length > 0 ? <Badge variant="success">KPI lié</Badge> : null}
          {field.usageCount >= 3 ? <Badge variant="warning">Champ fréquent</Badge> : null}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>Utilisations : <span className="font-semibold text-ink">{field.usageCount}</span></p>
        <p>Colonnes connues : {field.sourceColumns.join(", ")}</p>
        <p>Dernière utilisation : {new Date(field.updatedAt).toLocaleString("fr-FR")}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button className="h-8" onClick={() => onSelect(field)}>Voir détails</Button>
        <Button className="h-8" onClick={() => onDelete(field.id)}>Supprimer</Button>
      </div>
    </article>
  );
}
