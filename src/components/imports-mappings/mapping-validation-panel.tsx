import { CheckCircle2, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mappingReviewsMock } from "@/lib/mock/mapping-reviews";

const selected = mappingReviewsMock[1];

export function MappingValidationPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation mapping</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Colonne source", selected.sourceColumn],
            ["Type détecté", selected.detectedType],
            ["Champ Atlas sélectionné", selected.suggestedAtlasField],
            ["Statut", "À vérifier"]
          ].map(([label, value]) => (
            <label key={label} className="block rounded-md border border-line bg-slate-50 p-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
              <input
                readOnly
                value={value}
                className="mt-2 h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-medium text-ink"
              />
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Valider le mapping
          </Button>
          <Button>
            <EyeOff className="h-4 w-4" aria-hidden="true" />
            Ignorer la colonne
          </Button>
          <Badge variant="warning">Action simulée</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
