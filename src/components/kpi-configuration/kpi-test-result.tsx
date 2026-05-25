import { TestTube2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiTestResult() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tester le calcul</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="primary">
          <TestTube2 className="h-4 w-4" aria-hidden="true" />
          Tester le calcul
        </Button>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Valeur calculee", "53 100 EUR"],
            ["Lignes utilisees", "1 216"],
            ["Période testée", "Mai 2026"],
            ["Statut obtenu", "À surveiller"],
            ["Limites de donnée", "32 lignes rejetées"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-line bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Distinguer problème de performance et problème de donnée : le KPI est sous objectif,
          mais sa couverture reste partielle.
        </div>
        <Badge variant="warning">Résultat simulé</Badge>
      </CardContent>
    </Card>
  );
}
