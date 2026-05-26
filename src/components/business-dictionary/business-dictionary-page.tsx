"use client";

import { useEffect, useState } from "react";
import { BookOpenText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessFieldCard } from "@/components/business-dictionary/business-field-card";
import { BusinessFieldDetails } from "@/components/business-dictionary/business-field-details";
import { activeOrganizationId } from "@/lib/context/scope-defaults";
import { deleteBusinessDictionaryField, getBusinessDictionary } from "@/lib/local/business-dictionary-store";
import type { BusinessDictionaryField } from "@/types/business-dictionary";

export function BusinessDictionaryPage() {
  const [fields, setFields] = useState<BusinessDictionaryField[]>([]);
  const [selectedField, setSelectedField] = useState<BusinessDictionaryField | undefined>();

  function refreshFields() {
    const nextFields = getBusinessDictionary(activeOrganizationId);
    setFields(nextFields);
    setSelectedField((current) => nextFields.find((field) => field.id === current?.id) ?? nextFields[0]);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(refreshFields, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function deleteField(id: string) {
    deleteBusinessDictionaryField(id);
    refreshFields();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Dictionnaire métier</Badge>
              <Badge>Local</Badge>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Vocabulaire métier de l&apos;organisation
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Atlas mémorise les champs personnalisés, colonnes sources, synonymes et KPI liés pour réutiliser
              le vocabulaire métier dans les prochains imports.
            </p>
          </div>
          <div className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-600">
            <BookOpenText className="mb-2 h-5 w-5 text-brand-700" aria-hidden="true" />
            Gouvernance donnée locale, prête pour une future persistance Prisma.
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Champs mémorisés", fields.length],
          ["Utilisations", fields.reduce((total, field) => total + field.usageCount, 0)],
          ["KPI liés", fields.reduce((total, field) => total + field.linkedKpis.length, 0)],
          ["Colonnes connues", fields.reduce((total, field) => total + field.sourceColumns.length, 0)]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Champs métier connus</CardTitle>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <p className="rounded-md border border-line bg-slate-50 p-4 text-sm text-slate-600">
                Aucun champ métier mémorisé. Créez un champ personnalisé dans Imports & mappings pour alimenter ce dictionnaire.
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {fields.map((field) => (
                  <BusinessFieldCard
                    key={field.id}
                    field={field}
                    onSelect={setSelectedField}
                    onDelete={deleteField}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <BusinessFieldDetails key={selectedField?.id ?? "empty"} field={selectedField} onUpdated={refreshFields} />
      </section>
    </div>
  );
}
